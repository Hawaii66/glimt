import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/auth";
import {
  findGroupForUsers,
  getOrCreateFriendGroupForUsers,
  listGroupMemberIds,
  requireGroupMember,
  validateDayDate,
  validateEmoji,
} from "./lib/friendGroups";
import {
  isDayComplete,
  isDayEnded,
  prepareTodayMeetLocksForUser,
  syncMeetLocksForGroup as syncMeetLocksForGroupInternal,
  todayIsoDate,
} from "./lib/meetLock";
import { userError } from "./lib/userError";

type JournalEntry = {
  id: Id<"journalEntries">;
  authorUserId: Id<"users">;
  photoUrl: string;
  caption?: string;
  sentAt: number;
};

type JournalDay = {
  date: string;
  sharedEmoji: string | null;
  togetherUnlockedAt: number | null;
  meetLocked: boolean;
  yours: JournalEntry[];
  theirs: JournalEntry[];
};

function dayDateFromTimestamp(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function normalizeCaption(caption: string | undefined) {
  const trimmedCaption = caption?.trim();
  if (trimmedCaption && trimmedCaption.length > 30) {
    throw new Error("Caption must be 30 characters or fewer.");
  }
  return trimmedCaption || undefined;
}

async function enrichEntry(
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

async function buildJournalDay(
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

export const prepareTodayMeetLocksOnAppOpen = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const results = await prepareTodayMeetLocksForUser(ctx, userId);
    return { today: todayIsoDate(), results };
  },
});

export const getTodayMeetLocksForFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const today = todayIsoDate();

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results: Array<{
      friendUserId: Id<"users">;
      groupId: Id<"friendGroups"> | null;
      date: string;
      meetLocked: boolean;
      rolled: boolean;
    }> = [];

    for (const friendship of friendships) {
      const groupId = await findGroupForUsers(
        ctx,
        userId,
        friendship.friendUserId,
      );

      if (!groupId) {
        results.push({
          friendUserId: friendship.friendUserId,
          groupId: null,
          date: today,
          meetLocked: false,
          rolled: false,
        });
        continue;
      }

      const day = await ctx.db
        .query("journalDays")
        .withIndex("by_group_and_date", (q) =>
          q.eq("groupId", groupId).eq("date", today),
        )
        .unique();

      results.push({
        friendUserId: friendship.friendUserId,
        groupId,
        date: today,
        meetLocked: day?.meetLocked ?? false,
        rolled: day?.meetLocked !== undefined,
      });
    }

    return results;
  },
});

export const listDays = query({
  args: { groupId: v.id("friendGroups") },
  handler: async (ctx, { groupId }): Promise<JournalDay[]> => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

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
  },
});

export const getDay = query({
  args: {
    groupId: v.id("friendGroups"),
    date: v.string(),
  },
  handler: async (ctx, { groupId, date }): Promise<JournalDay> => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);
    const normalizedDate = validateDayDate(date);

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_group_and_day", (q) =>
        q.eq("groupId", groupId).eq("dayDate", normalizedDate),
      )
      .collect();

    return await buildJournalDay(
      ctx,
      groupId,
      userId,
      normalizedDate,
      entries,
    );
  },
});

export const syncMeetLocksForGroup = mutation({
  args: { groupId: v.id("friendGroups") },
  handler: async (ctx, { groupId }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const memberUserIds = await listGroupMemberIds(ctx, groupId);
    const rolledCount = await syncMeetLocksForGroupInternal(
      ctx,
      groupId,
      memberUserIds,
    );

    return { rolledCount };
  },
});

export const addEntry = mutation({
  args: {
    groupId: v.id("friendGroups"),
    photoStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
    dayDate: v.optional(v.string()),
  },
  handler: async (ctx, { groupId, photoStorageId, caption, dayDate }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const normalizedCaption = normalizeCaption(caption);

    const sentAt = Date.now();
    const normalizedDayDate = dayDate
      ? validateDayDate(dayDate)
      : dayDateFromTimestamp(sentAt);

    return await ctx.db.insert("journalEntries", {
      groupId,
      authorUserId: userId,
      photoStorageId,
      caption: normalizedCaption,
      sentAt,
      dayDate: normalizedDayDate,
    });
  },
});

export const generatePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendGlimt = mutation({
  args: {
    photoStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
    friendUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, { photoStorageId, caption, friendUserId }) => {
    const userId = await requireAuthUserId(ctx);
    const normalizedCaption = normalizeCaption(caption);

    let targetFriendIds: Id<"users">[];

    if (friendUserId) {
      if (friendUserId === userId) {
        userError("You cannot send a glimt to yourself.");
      }

      const friendship = await ctx.db
        .query("friendships")
        .withIndex("by_user_and_friend", (q) =>
          q.eq("userId", userId).eq("friendUserId", friendUserId),
        )
        .unique();

      if (!friendship) {
        userError("You can only send glimts to accepted friends.");
      }

      targetFriendIds = [friendUserId];
    } else {
      const friendships = await ctx.db
        .query("friendships")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      targetFriendIds = friendships.map(
        (friendship) => friendship.friendUserId,
      );

      if (targetFriendIds.length === 0) {
        userError("Add a friend first.");
      }
    }

    const sentAt = Date.now();
    const dayDate = dayDateFromTimestamp(sentAt);
    const entryIds: Id<"journalEntries">[] = [];

    for (const targetFriendId of targetFriendIds) {
      const groupId = await getOrCreateFriendGroupForUsers(
        ctx,
        userId,
        targetFriendId,
      );

      const entryId = await ctx.db.insert("journalEntries", {
        groupId,
        authorUserId: userId,
        photoStorageId,
        caption: normalizedCaption,
        sentAt,
        dayDate,
      });

      entryIds.push(entryId);
    }

    return {
      entryIds,
      recipientCount: targetFriendIds.length,
    };
  },
});

export const setDayEmoji = mutation({
  args: {
    groupId: v.id("friendGroups"),
    date: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, { groupId, date, emoji }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const normalizedDate = validateDayDate(date);
    const normalizedEmoji = validateEmoji(emoji);

    const existingDay = await ctx.db
      .query("journalDays")
      .withIndex("by_group_and_date", (q) =>
        q.eq("groupId", groupId).eq("date", normalizedDate),
      )
      .unique();

    if (existingDay) {
      await ctx.db.patch(existingDay._id, {
        sharedEmoji: normalizedEmoji,
      });
      return existingDay._id;
    }

    return await ctx.db.insert("journalDays", {
      groupId,
      date: normalizedDate,
      sharedEmoji: normalizedEmoji,
    });
  },
});

export const unlockTogetherDay = mutation({
  args: {
    groupId: v.id("friendGroups"),
    date: v.string(),
  },
  handler: async (ctx, { groupId, date }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const normalizedDate = validateDayDate(date);
    const now = Date.now();

    if (!isDayEnded(normalizedDate, now)) {
      userError("Today's glimts cannot be unlocked yet.");
    }

    const memberUserIds = await listGroupMemberIds(ctx, groupId);
    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_group_and_day", (q) =>
        q.eq("groupId", groupId).eq("dayDate", normalizedDate),
      )
      .collect();

    if (!isDayComplete(entries, memberUserIds)) {
      userError("Both friends need to share glimts for this day.");
    }

    const existingDay = await ctx.db
      .query("journalDays")
      .withIndex("by_group_and_date", (q) =>
        q.eq("groupId", groupId).eq("date", normalizedDate),
      )
      .unique();

    if (existingDay?.togetherUnlockedAt !== undefined) {
      return existingDay._id;
    }

    if (existingDay?.meetLocked !== true) {
      userError("This day is not meet-locked.");
    }

    if (existingDay) {
      await ctx.db.patch(existingDay._id, {
        togetherUnlockedAt: now,
      });
      return existingDay._id;
    }

    userError("This day is not meet-locked.");
  },
});
