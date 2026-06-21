import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  localHour,
  localMinute,
  resolveUserTimezone,
  startOfLocalDayTimestamp,
  todayIsoDate,
  tomorrowIsoDate,
} from "./lib/dates";

const REMINDER_HOUR_START = 9;
const REMINDER_HOUR_END = 21;
const REMINDER_CHANCE_PERCENT = 25;
const REMINDER_SLOT_MINUTES = 15;
const REMINDER_SLOTS_PER_HOUR = 60 / REMINDER_SLOT_MINUTES;

function currentReminderSlot(minute: number): number {
  return Math.floor(minute / REMINDER_SLOT_MINUTES);
}

function stableHash(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function userHasFriends(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return friendship !== null;
}

async function userSentGlimtToday(
  ctx: MutationCtx,
  userId: Id<"users">,
  timezone: string,
  now: number,
): Promise<boolean> {
  const today = todayIsoDate(now, timezone);
  const startMs = startOfLocalDayTimestamp(today, timezone);
  const endMs = startOfLocalDayTimestamp(tomorrowIsoDate(now, timezone), timezone);

  const entry = await ctx.db
    .query("journalEntries")
    .withIndex("by_author_and_sentAt", (q) =>
      q.eq("authorUserId", userId).gte("sentAt", startMs).lt("sentAt", endMs),
    )
    .first();

  return entry !== null;
}

function shouldSendDailyReminder(
  userId: Id<"users">,
  timezone: string,
  now: number,
  lastDailyReminderDate: string | undefined,
): { shouldSend: boolean; today: string } {
  const today = todayIsoDate(now, timezone);
  if (lastDailyReminderDate === today) {
    return { shouldSend: false, today };
  }

  const hour = localHour(now, timezone);
  if (hour < REMINDER_HOUR_START || hour >= REMINDER_HOUR_END) {
    return { shouldSend: false, today };
  }

  const roll = stableHash(`${userId}:${today}:${hour}`) % 100;
  if (roll >= REMINDER_CHANCE_PERCENT) {
    return { shouldSend: false, today };
  }

  const targetSlot =
    stableHash(`${userId}:${today}:${hour}:slot`) % REMINDER_SLOTS_PER_HOUR;
  const minute = localMinute(now, timezone);
  if (currentReminderSlot(minute) !== targetSlot) {
    return { shouldSend: false, today };
  }

  return { shouldSend: true, today };
}

export const runDailyReminderChecks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const tokens = await ctx.db.query("pushTokens").collect();
    const userIds = [...new Set(tokens.map((token) => token.userId))];

    for (const userId of userIds) {
      const user = await ctx.db.get(userId);
      if (!user?.onboardingComplete) {
        continue;
      }

      const timezone = resolveUserTimezone(user.timezone);
      const { shouldSend, today } = shouldSendDailyReminder(
        userId,
        timezone,
        now,
        user.lastDailyReminderDate,
      );

      if (!shouldSend) {
        continue;
      }

      if (!(await userHasFriends(ctx, userId))) {
        continue;
      }

      if (await userSentGlimtToday(ctx, userId, timezone, now)) {
        continue;
      }

      await ctx.scheduler.runAfter(0, internal.pushNotifications.sendToUser, {
        userId,
        source: "cron:daily_reminder",
        title: "Send today's glimt",
        body: "Share a moment with your friends before the day ends.",
        data: { type: "daily_reminder" },
      });

      await ctx.db.patch(userId, { lastDailyReminderDate: today });
    }
  },
});
