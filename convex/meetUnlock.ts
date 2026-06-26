import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { requireAuthUserId } from "./lib/auth";
import {
  listGroupMemberIds,
  requireGroupMember,
  validateDayDate,
} from "./lib/friendGroups";
import { isDayEnded } from "./lib/dates";
import { getJournalTimezoneContext } from "./lib/journalTimezone";
import { userError } from "./lib/userError";

const TOKEN_PREFIX = "glimt-meet-unlock-v1:";
const SESSION_TTL_MS = 3 * 60 * 1000;

type MeetUnlockTokenPayload = {
  sessionId: string;
  groupId: Id<"friendGroups">;
  date: string;
  nonce: string;
  exp: number;
};

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomSessionId(): string {
  return crypto.randomUUID();
}

function encodeToken(payload: MeetUnlockTokenPayload): string {
  return `${TOKEN_PREFIX}${JSON.stringify(payload)}`;
}

function decodeToken(token: string): MeetUnlockTokenPayload | null {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      token.slice(TOKEN_PREFIX.length),
    ) as MeetUnlockTokenPayload;

    if (
      typeof parsed.sessionId !== "string" ||
      typeof parsed.groupId !== "string" ||
      typeof parsed.date !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function assertMeetLockedDay(
  ctx: Parameters<typeof requireGroupMember>[0],
  groupId: Id<"friendGroups">,
  date: string,
) {
  const day = await ctx.db
    .query("journalDays")
    .withIndex("by_group_and_date", (q) =>
      q.eq("groupId", groupId).eq("date", date),
    )
    .unique();

  if (day?.meetLocked !== true) {
    userError("This day is not meet-locked.");
  }

  if (day?.togetherUnlockedAt !== undefined) {
    userError("This day is already unlocked.");
  }
}

export const startMeetUnlockSession = mutation({
  args: {
    groupId: v.id("friendGroups"),
    date: v.string(),
  },
  handler: async (ctx, { groupId, date }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const normalizedDate = validateDayDate(date);
    await assertMeetLockedDay(ctx, groupId, normalizedDate);

    const now = Date.now();
    const expiresAt = now + SESSION_TTL_MS;
    const sessionId = randomSessionId();
    const nonce = randomNonce();

    const existingSessions = await ctx.db
      .query("meetUnlockSessions")
      .withIndex("by_group_and_date", (q) =>
        q.eq("groupId", groupId).eq("date", normalizedDate),
      )
      .collect();

    for (const session of existingSessions) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.insert("meetUnlockSessions", {
      groupId,
      date: normalizedDate,
      sessionId,
      hostUserId: userId,
      nonce,
      expiresAt,
      createdAt: now,
    });

    const token = encodeToken({
      sessionId,
      groupId,
      date: normalizedDate,
      nonce,
      exp: expiresAt,
    });

    return {
      token,
      expiresAt,
      sessionId,
    };
  },
});

export const refreshMeetUnlockSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const userId = await requireAuthUserId(ctx);

    const session = await ctx.db
      .query("meetUnlockSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .unique();

    if (!session) {
      userError("Unlock session not found.");
    }

    if (session.hostUserId !== userId) {
      userError("Only the host can refresh this unlock session.");
    }

    const now = Date.now();
    if (session.expiresAt <= now) {
      await ctx.db.delete(session._id);
      userError("Unlock session expired.");
    }

    const nonce = randomNonce();
    await ctx.db.patch(session._id, { nonce });

    const token = encodeToken({
      sessionId: session.sessionId,
      groupId: session.groupId,
      date: session.date,
      nonce,
      exp: session.expiresAt,
    });

    return {
      token,
      expiresAt: session.expiresAt,
    };
  },
});

export const completeMeetUnlock = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await requireAuthUserId(ctx);
    const payload = decodeToken(token);

    if (!payload || payload.exp <= Date.now()) {
      userError("That code didn't work. Ask your friend to show a fresh code.");
    }

    await requireGroupMember(ctx, payload.groupId, userId);

    const session = await ctx.db
      .query("meetUnlockSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", payload.sessionId))
      .unique();

    if (
      !session ||
      session.groupId !== payload.groupId ||
      session.date !== payload.date ||
      session.nonce !== payload.nonce ||
      session.expiresAt !== payload.exp
    ) {
      userError("That code didn't work. Ask your friend to show a fresh code.");
    }

    if (session.hostUserId === userId) {
      userError("Scan your friend's code, not your own.");
    }

    const day = await ctx.db
      .query("journalDays")
      .withIndex("by_group_and_date", (q) =>
        q.eq("groupId", payload.groupId).eq("date", payload.date),
      )
      .unique();

    if (day?.meetLocked !== true) {
      userError("This day is not meet-locked.");
    }

    const now = Date.now();
    const memberUserIds = await listGroupMemberIds(ctx, payload.groupId);
    const context = await getJournalTimezoneContext(
      ctx,
      payload.groupId,
      memberUserIds,
      now,
    );

    if (!isDayEnded(payload.date, now, context.effectiveTimezone)) {
      userError("Today's glimts cannot be unlocked yet.");
    }

    if (day) {
      await ctx.db.patch(day._id, {
        togetherUnlockedAt: now,
      });
    } else {
      userError("This day is not meet-locked.");
    }

    await ctx.db.delete(session._id);

    return {
      groupId: payload.groupId,
      date: payload.date,
      togetherUnlockedAt: now,
    };
  },
});
