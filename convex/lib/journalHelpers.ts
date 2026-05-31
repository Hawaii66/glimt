import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { todayIsoDate } from "./dates";
import { findGroupForUsers } from "./friendGroups";
import {
  prepareJournalTimezoneForMutation,
} from "./journalTimezone";

export type JournalEntry = {
  id: Id<"journalEntries">;
  authorUserId: Id<"users">;
  photoUrl: string;
  caption?: string;
  sentAt: number;
};

export type JournalDay = {
  date: string;
  sharedEmoji: string | null;
  togetherUnlockedAt: number | null;
  meetLocked: boolean;
  yours: JournalEntry[];
  theirs: JournalEntry[];
};

export type UserProfile = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
  accentTheme?: string;
};

export type HomeFriendTile = UserProfile & {
  previewPhotoUrl: string;
  groupToday: string;
};

export type TodayFriendGlimtTile = HomeFriendTile & {
  sentAt: number;
};

export type WidgetGlimt = {
  friendUserId: Id<"users">;
  photoUrl: string;
  avatarUrl: string;
  displayName: string;
  sentAt: number;
};

export async function prepareGroupJournalDay(
  ctx: Parameters<typeof prepareJournalTimezoneForMutation>[0],
  groupId: Id<"friendGroups">,
  memberUserIds: Id<"users">[],
  now = Date.now(),
) {
  const context = await prepareJournalTimezoneForMutation(
    ctx,
    groupId,
    memberUserIds,
    now,
  );
  return {
    date: todayIsoDate(now, context.effectiveTimezone),
    timezone: context.effectiveTimezone,
  };
}

export function normalizeCaption(caption: string | undefined) {
  const trimmedCaption = caption?.trim();
  if (trimmedCaption && trimmedCaption.length > 30) {
    throw new Error("Caption must be 30 characters or fewer.");
  }
  return trimmedCaption || undefined;
}

export async function enrichEntry(
  ctx: QueryCtx,
  entry: {
    _id: Id<"journalEntries">;
    authorUserId: Id<"users">;
    photoStorageId: Id<"_storage">;
    caption?: string;
    sentAt: number;
  },
): Promise<JournalEntry> {
  const photoUrl = (await ctx.storage.getUrl(entry.photoStorageId)) ?? "";

  return {
    id: entry._id,
    authorUserId: entry.authorUserId,
    photoUrl,
    caption: entry.caption,
    sentAt: entry.sentAt,
  };
}

export async function buildJournalDay(
  ctx: QueryCtx,
  groupId: Id<"friendGroups">,
  currentUserId: Id<"users">,
  date: string,
  entries: Array<{
    _id: Id<"journalEntries">;
    authorUserId: Id<"users">;
    photoStorageId: Id<"_storage">;
    caption?: string;
    sentAt: number;
  }>,
): Promise<JournalDay> {
  const day = await ctx.db
    .query("journalDays")
    .withIndex("by_group_and_date", (q) =>
      q.eq("groupId", groupId).eq("date", date),
    )
    .unique();

  const enrichedEntries = await Promise.all(
    entries.map((entry) => enrichEntry(ctx, entry)),
  );

  const yours: JournalEntry[] = [];
  const theirs: JournalEntry[] = [];

  for (const entry of enrichedEntries) {
    if (entry.authorUserId === currentUserId) {
      yours.push(entry);
    } else {
      theirs.push(entry);
    }
  }

  yours.sort((a, b) => a.sentAt - b.sentAt);
  theirs.sort((a, b) => a.sentAt - b.sentAt);

  return {
    date,
    sharedEmoji: day?.sharedEmoji ?? null,
    togetherUnlockedAt: day?.togetherUnlockedAt ?? null,
    meetLocked: day?.meetLocked ?? false,
    yours,
    theirs,
  };
}

export async function getUserProfile(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<UserProfile | null> {
  const user = await ctx.db.get(userId);
  if (!user) {
    return null;
  }

  const avatarUrl = user.avatarStorageId
    ? ((await ctx.storage.getUrl(user.avatarStorageId)) ?? "")
    : "";

  return {
    id: user._id,
    displayName: user.name ?? "",
    username: user.username ?? "",
    avatarUrl,
    accentTheme: user.accentTheme,
  };
}

export async function areFriends(
  ctx: QueryCtx,
  userId: Id<"users">,
  friendUserId: Id<"users">,
) {
  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_user_and_friend", (q) =>
      q.eq("userId", userId).eq("friendUserId", friendUserId),
    )
    .unique();
  return friendship !== null;
}

export async function resolveFriendGroup(
  ctx: QueryCtx,
  userId: Id<"users">,
  friendUserId: Id<"users">,
): Promise<Id<"friendGroups"> | null> {
  if (!(await areFriends(ctx, userId, friendUserId))) {
    return null;
  }

  return await findGroupForUsers(ctx, userId, friendUserId);
}

export async function collectListDays(
  ctx: QueryCtx,
  groupId: Id<"friendGroups">,
  userId: Id<"users">,
): Promise<JournalDay[]> {
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

  const dayRecords = await ctx.db
    .query("journalDays")
    .withIndex("by_group_and_date", (q) => q.eq("groupId", groupId))
    .collect();

  for (const dayRecord of dayRecords) {
    if (!entriesByDate.has(dayRecord.date)) {
      entriesByDate.set(dayRecord.date, []);
    }
  }

  const days = await Promise.all(
    [...entriesByDate.entries()].map(([date, dayEntries]) =>
      buildJournalDay(ctx, groupId, userId, date, dayEntries),
    ),
  );

  return days.sort((a, b) => b.date.localeCompare(a.date));
}
