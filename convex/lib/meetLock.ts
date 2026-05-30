import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export const MEET_LOCK_PROBABILITY = 1 / 7;

export function dayDateFromTimestamp(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function todayIsoDate(now = Date.now()): string {
  return dayDateFromTimestamp(now);
}

export function isDayEnded(date: string, now = Date.now()): boolean {
  const today = todayIsoDate(now);
  return date < today;
}

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
  now = Date.now(),
): boolean {
  if (date !== todayIsoDate(now)) {
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
  now?: number;
}): boolean {
  const { date, entries, memberUserIds, dayRecord, now = Date.now() } = args;

  if (!isDayEnded(date, now)) {
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
  now = Date.now(),
): Promise<{ created: boolean; meetLocked: boolean }> {
  const existingDay = await ctx.db
    .query("journalDays")
    .withIndex("by_group_and_date", (q) =>
      q.eq("groupId", groupId).eq("date", date),
    )
    .unique();

  if (!isEligibleForTodayMeetLockRoll(date, existingDay, now)) {
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
  now = Date.now(),
): Promise<
  Array<{
    groupId: Id<"friendGroups">;
    date: string;
    meetLocked: boolean;
    created: boolean;
  }>
> {
  const today = todayIsoDate(now);
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
    const { created, meetLocked } = await prepareTodayMeetLockForGroup(
      ctx,
      groupId,
      today,
      now,
    );
    results.push({ groupId, date: today, meetLocked, created });
  }

  return results;
}

export async function rollMeetLockForDayIfEligible(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
  date: string,
  entries: Array<{ authorUserId: Id<"users"> }>,
  memberUserIds: Id<"users">[],
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
  now = Date.now(),
): Promise<number> {
  const today = todayIsoDate(now);
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
      now,
    );
    rolledCount += 1;
  }

  return rolledCount;
}
