import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { isDayEnded, todayIsoDate } from "./dates";

export const MEET_LOCK_PROBABILITY = 1 / 7;

export function isDayComplete(
  entries: Array<{ authorUserId: Id<"users"> }>,
  memberUserIds: Id<"users">[],
): boolean {
  if (memberUserIds.length < 2) {
    return false;
  }

  const authorsWithEntries = new Set(entries.map((entry) => entry.authorUserId));
  return memberUserIds.every((memberId) => authorsWithEntries.has(memberId));
}

export function rollMeetLocked(): boolean {
  return Math.random() < MEET_LOCK_PROBABILITY;
}

type DayRecord = {
  _id: Id<"journalDays">;
  meetLocked?: boolean;
  togetherUnlockedAt?: number;
};

export function isEligibleForTodayMeetLockRoll(
  date: string,
  dayRecord: DayRecord | null,
  timezone: string,
  now = Date.now(),
): boolean {
  if (date !== todayIsoDate(now, timezone)) {
    return false;
  }

  if (dayRecord?.togetherUnlockedAt !== undefined) {
    return false;
  }

  if (dayRecord?.meetLocked !== undefined) {
    return false;
  }

  return true;
}

export function isEligibleForMeetLockRoll(args: {
  date: string;
  entries: Array<{ authorUserId: Id<"users"> }>;
  memberUserIds: Id<"users">[];
  dayRecord: DayRecord | null;
  timezone: string;
  now?: number;
}): boolean {
  const {
    date,
    entries,
    memberUserIds,
    dayRecord,
    timezone,
    now = Date.now(),
  } = args;

  if (!isDayEnded(date, now, timezone)) {
    return false;
  }

  if (!isDayComplete(entries, memberUserIds)) {
    return false;
  }

  if (dayRecord?.togetherUnlockedAt !== undefined) {
    return false;
  }

  if (dayRecord?.meetLocked !== undefined) {
    return false;
  }

  return true;
}

export async function prepareTodayMeetLockForGroup(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  date: string,
  timezone: string,
  now = Date.now(),
): Promise<{ created: boolean; meetLocked: boolean }> {
  const existingDay = await ctx.db
    .query("journalDays")
    .withIndex("by_group_and_date", (q) =>
      q.eq("groupId", groupId).eq("date", date),
    )
    .unique();

  if (!isEligibleForTodayMeetLockRoll(date, existingDay, timezone, now)) {
    return {
      created: false,
      meetLocked: existingDay?.meetLocked ?? false,
    };
  }

  const meetLocked = rollMeetLocked();

  if (existingDay) {
    await ctx.db.patch(existingDay._id, {
      meetLocked,
      meetLockedAt: now,
    });
  } else {
    await ctx.db.insert("journalDays", {
      groupId,
      date,
      meetLocked,
      meetLockedAt: now,
    });
  }

  return { created: true, meetLocked };
}

export async function prepareTodayMeetLocksForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
  prepareGroup: (
    groupId: Id<"friendGroups">,
    memberUserIds: Id<"users">[],
  ) => Promise<{ date: string; timezone: string }>,
  now = Date.now(),
): Promise<
  Array<{
    groupId: Id<"friendGroups">;
    date: string;
    meetLocked: boolean;
    created: boolean;
  }>
> {
  const memberships = await ctx.db
    .query("friendGroupMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const groupIds = [...new Set(memberships.map((membership) => membership.groupId))];
  const results: Array<{
    groupId: Id<"friendGroups">;
    date: string;
    meetLocked: boolean;
    created: boolean;
  }> = [];

  for (const groupId of groupIds) {
    const memberUserIds = await ctx.db
      .query("friendGroupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect()
      .then((rows) => rows.map((row) => row.userId));

    const { date, timezone } = await prepareGroup(groupId, memberUserIds);
    const { created, meetLocked } = await prepareTodayMeetLockForGroup(
      ctx,
      groupId,
      date,
      timezone,
      now,
    );
    results.push({ groupId, date, meetLocked, created });
  }

  return results;
}

export async function rollMeetLockForDayIfEligible(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  date: string,
  entries: Array<{ authorUserId: Id<"users"> }>,
  memberUserIds: Id<"users">[],
  timezone: string,
  now = Date.now(),
): Promise<boolean | null> {
  const existingDay = await ctx.db
    .query("journalDays")
    .withIndex("by_group_and_date", (q) =>
      q.eq("groupId", groupId).eq("date", date),
    )
    .unique();

  if (
    !isEligibleForMeetLockRoll({
      date,
      entries,
      memberUserIds,
      dayRecord: existingDay,
      timezone,
      now,
    })
  ) {
    return existingDay?.meetLocked ?? null;
  }

  const meetLocked = rollMeetLocked();

  if (existingDay) {
    await ctx.db.patch(existingDay._id, {
      meetLocked,
      meetLockedAt: now,
    });
  } else {
    await ctx.db.insert("journalDays", {
      groupId,
      date,
      meetLocked,
      meetLockedAt: now,
    });
  }

  return meetLocked;
}

export async function syncMeetLocksForGroup(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  memberUserIds: Id<"users">[],
  timezone: string,
  now = Date.now(),
): Promise<number> {
  const today = todayIsoDate(now, timezone);
  const entries = await ctx.db
    .query("journalEntries")
    .withIndex("by_group", (q) => q.eq("groupId", groupId))
    .collect();

  const entriesByDate = new Map<string, typeof entries>();
  for (const entry of entries) {
    const dayEntries = entriesByDate.get(entry.dayDate) ?? [];
    dayEntries.push(entry);
    entriesByDate.set(entry.dayDate, dayEntries);
  }

  let rolledCount = 0;

  for (const [date, dayEntries] of entriesByDate) {
    if (date === today) {
      continue;
    }

    const existingDay = await ctx.db
      .query("journalDays")
      .withIndex("by_group_and_date", (q) =>
        q.eq("groupId", groupId).eq("date", date),
      )
      .unique();

    if (
      !isEligibleForMeetLockRoll({
        date,
        entries: dayEntries,
        memberUserIds,
        dayRecord: existingDay,
        timezone,
        now,
      })
    ) {
      continue;
    }

    await rollMeetLockForDayIfEligible(
      ctx,
      groupId,
      date,
      dayEntries,
      memberUserIds,
      timezone,
      now,
    );
    rolledCount += 1;
  }

  return rolledCount;
}
