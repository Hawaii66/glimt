import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  localHour,
  resolveUserTimezone,
  startOfLocalDayTimestamp,
  todayIsoDate,
  tomorrowIsoDate,
} from "./lib/dates";

const REMINDER_HOUR_START = 9;
const REMINDER_HOUR_END = 21;
const REMINDER_CHANCE_PERCENT = 25;
const ONE_HOUR_MS = 60 * 60 * 1000;

function stableHash(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomDelayMs(maxDelayMs: number): number {
  if (maxDelayMs <= 0) {
    return 0;
  }
  return Math.floor(Math.random() * maxDelayMs);
}

function maxDelayWithinReminderWindow(
  now: number,
  timezone: string,
): number {
  const today = todayIsoDate(now, timezone);
  const windowEndMs =
    startOfLocalDayTimestamp(today, timezone) + REMINDER_HOUR_END * ONE_HOUR_MS;
  const nextHourEndMs = now + ONE_HOUR_MS;
  const sendDeadlineMs = Math.min(windowEndMs, nextHourEndMs);
  return Math.max(0, Math.min(ONE_HOUR_MS, sendDeadlineMs - now));
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

function shouldPlanDailyReminder(
  userId: Id<"users">,
  timezone: string,
  now: number,
  lastDailyReminderDate: string | undefined,
): { shouldPlan: boolean; today: string; localHour: number } {
  const today = todayIsoDate(now, timezone);
  if (lastDailyReminderDate === today) {
    return { shouldPlan: false, today, localHour: localHour(now, timezone) };
  }

  const hour = localHour(now, timezone);
  if (hour < REMINDER_HOUR_START || hour >= REMINDER_HOUR_END) {
    return { shouldPlan: false, today, localHour: hour };
  }

  const roll = stableHash(`${userId}:${today}:${hour}`) % 100;
  if (roll >= REMINDER_CHANCE_PERCENT) {
    return { shouldPlan: false, today, localHour: hour };
  }

  return { shouldPlan: true, today, localHour: hour };
}

export const planDailyReminders = internalMutation({
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
      const { shouldPlan, today, localHour: hour } = shouldPlanDailyReminder(
        userId,
        timezone,
        now,
        user.lastDailyReminderDate,
      );

      if (!shouldPlan) {
        continue;
      }

      if (!(await userHasFriends(ctx, userId))) {
        continue;
      }

      if (await userSentGlimtToday(ctx, userId, timezone, now)) {
        continue;
      }

      const maxDelayMs = maxDelayWithinReminderWindow(now, timezone);
      if (maxDelayMs <= 0) {
        continue;
      }

      const delayMs = randomDelayMs(maxDelayMs);
      await ctx.scheduler.runAfter(
        delayMs,
        internal.pushReminders.sendDailyReminderToUser,
        { userId, plannedDate: today, plannedHour: hour },
      );
    }
  },
});

export const sendDailyReminderToUser = internalMutation({
  args: {
    userId: v.id("users"),
    plannedDate: v.string(),
    plannedHour: v.number(),
  },
  handler: async (ctx, { userId, plannedDate }) => {
    const user = await ctx.db.get(userId);
    if (!user?.onboardingComplete) {
      return;
    }

    const timezone = resolveUserTimezone(user.timezone);
    const now = Date.now();
    const today = todayIsoDate(now, timezone);

    if (user.lastDailyReminderDate === today) {
      return;
    }

    if (today !== plannedDate) {
      return;
    }

    const hour = localHour(now, timezone);
    if (hour < REMINDER_HOUR_START || hour >= REMINDER_HOUR_END) {
      return;
    }

    if (!(await userHasFriends(ctx, userId))) {
      return;
    }

    if (await userSentGlimtToday(ctx, userId, timezone, now)) {
      return;
    }

    await ctx.scheduler.runAfter(0, internal.pushNotifications.sendToUser, {
      userId,
      source: "cron:daily_reminder",
      title: "Send today's glimt",
      body: "Share a moment with your friends before the day ends.",
      data: { type: "daily_reminder" },
    });

    await ctx.db.patch(userId, { lastDailyReminderDate: today });
  },
});
