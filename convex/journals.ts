import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
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
import { dayDateFromTimestamp, isDayEnded, resolveUserTimezone, todayIsoDate } from "./lib/dates";
import {
  getJournalTimezoneContext,
  prepareJournalTimezoneForMutation,
  setJournalTimezoneForGroup,
} from "./lib/journalTimezone";
import {
  isDayComplete,
  prepareTodayMeetLocksForUser,
  syncMeetLocksForGroup as syncMeetLocksForGroupInternal,
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

type UserProfile = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
  accentTheme?: string;
};

type HomeFriendTile = UserProfile & {
  previewPhotoUrl: string;
  groupToday: string;
};

async function prepareGroupJournalDay(
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

async function getUserProfile(
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

async function areFriends(
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

async function resolveFriendGroup(
  ctx: QueryCtx,
  userId: Id<"users">,
  friendUserId: Id<"users">,
): Promise<Id<"friendGroups"> | null> {
  if (!(await areFriends(ctx, userId, friendUserId))) {
    return null;
  }

  return await findGroupForUsers(ctx, userId, friendUserId);
}

async function collectListDays(
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

export const prepareTodayMeetLocksOnAppOpen = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const now = Date.now();
    const results = await prepareTodayMeetLocksForUser(
      ctx,
      userId,
      async (groupId, memberUserIds) =>
        prepareGroupJournalDay(ctx, groupId, memberUserIds, now),
      now,
    );
    return { results };
  },
});

export const getJournalContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const user = await ctx.db.get(userId);
    const viewerTimezone = resolveUserTimezone(user?.timezone);
    const now = Date.now();

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const todayByGroup: Array<{
      groupId: Id<"friendGroups">;
      friendUserId: Id<"users">;
      journalTimezone: string;
      today: string;
      canChangeJournalTimezone: boolean;
      scheduledJournalTimezone?: string;
      scheduledJournalTimezoneFrom?: string;
    }> = [];

    for (const friendship of friendships) {
      const groupId = await findGroupForUsers(
        ctx,
        userId,
        friendship.friendUserId,
      );
      if (!groupId) {
        continue;
      }

      const memberUserIds = await listGroupMemberIds(ctx, groupId);
      const context = await getJournalTimezoneContext(
        ctx,
        groupId,
        memberUserIds,
        now,
      );

      todayByGroup.push({
        groupId,
        friendUserId: friendship.friendUserId,
        journalTimezone: context.effectiveTimezone,
        today: todayIsoDate(now, context.effectiveTimezone),
        canChangeJournalTimezone: context.canChangeJournalTimezone,
        scheduledJournalTimezone: context.scheduledChange?.timezone,
        scheduledJournalTimezoneFrom: context.scheduledChange?.effectiveFrom,
      });
    }

    return {
      viewerTimezone,
      todayByGroup,
    };
  },
});

export const getJournalTimezoneForFriend = query({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, { friendUserId }) => {
    const userId = await requireAuthUserId(ctx);
    const groupId = await findGroupForUsers(ctx, userId, friendUserId);
    if (!groupId) {
      return null;
    }

    const memberUserIds = await listGroupMemberIds(ctx, groupId);
    const context = await getJournalTimezoneContext(
      ctx,
      groupId,
      memberUserIds,
    );

    return {
      groupId,
      effectiveTimezone: context.effectiveTimezone,
      memberTimezones: context.memberTimezones,
      canChangeJournalTimezone: context.canChangeJournalTimezone,
      scheduledChange: context.scheduledChange ?? null,
    };
  },
});

export const setJournalTimezone = mutation({
  args: {
    groupId: v.id("friendGroups"),
    timezone: v.string(),
  },
  handler: async (ctx, { groupId, timezone }) => {
    const userId = await requireAuthUserId(ctx);
    return await setJournalTimezoneForGroup(ctx, groupId, userId, timezone);
  },
});

export const getTodayMeetLocksForFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const now = Date.now();

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
          date: "",
          meetLocked: false,
          rolled: false,
        });
        continue;
      }

      const memberUserIds = await listGroupMemberIds(ctx, groupId);
      const context = await getJournalTimezoneContext(
        ctx,
        groupId,
        memberUserIds,
        now,
      );
      const today = todayIsoDate(now, context.effectiveTimezone);

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
    return await collectListDays(ctx, groupId, userId);
  },
});

export const listDaysForFriend = query({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, { friendUserId }): Promise<JournalDay[]> => {
    const userId = await requireAuthUserId(ctx);
    const groupId = await resolveFriendGroup(ctx, userId, friendUserId);
    if (!groupId) {
      return [];
    }
    return await collectListDays(ctx, groupId, userId);
  },
});

export const getDayForFriend = query({
  args: {
    friendUserId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, { friendUserId, date }): Promise<JournalDay | null> => {
    const userId = await requireAuthUserId(ctx);
    const groupId = await resolveFriendGroup(ctx, userId, friendUserId);
    if (!groupId) {
      return null;
    }

    const normalizedDate = validateDayDate(date);
    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_group_and_day", (q) =>
        q.eq("groupId", groupId).eq("dayDate", normalizedDate),
      )
      .collect();

    return await buildJournalDay(ctx, groupId, userId, normalizedDate, entries);
  },
});

export const listHomeFriends = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ tiles: HomeFriendTile[]; totalFriendCount: number }> => {
    const userId = await requireAuthUserId(ctx);
    const now = Date.now();

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const tiles: HomeFriendTile[] = [];

    for (const friendship of friendships) {
      const friendUserId = friendship.friendUserId;
      const groupId = await findGroupForUsers(ctx, userId, friendUserId);
      if (!groupId) {
        continue;
      }

      const memberUserIds = await listGroupMemberIds(ctx, groupId);
      const context = await getJournalTimezoneContext(
        ctx,
        groupId,
        memberUserIds,
        now,
      );
      const groupToday = todayIsoDate(now, context.effectiveTimezone);

      const entries = await ctx.db
        .query("journalEntries")
        .withIndex("by_group_and_day", (q) =>
          q.eq("groupId", groupId).eq("dayDate", groupToday),
        )
        .collect();

      const theirs = entries.filter(
        (entry) => entry.authorUserId === friendUserId,
      );
      if (theirs.length === 0) {
        continue;
      }

      theirs.sort((a, b) => b.sentAt - a.sentAt);
      const latestEntry = theirs[0];
      const previewPhotoUrl =
        (await ctx.storage.getUrl(latestEntry.photoStorageId)) ?? "";

      const profile = await getUserProfile(ctx, friendUserId);
      if (!profile) {
        continue;
      }

      tiles.push({
        ...profile,
        previewPhotoUrl,
        groupToday,
      });
    }

    return {
      tiles,
      totalFriendCount: friendships.length,
    };
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

    return await buildJournalDay(ctx, groupId, userId, normalizedDate, entries);
  },
});

export const syncMeetLocksForGroup = mutation({
  args: { groupId: v.id("friendGroups") },
  handler: async (ctx, { groupId }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const memberUserIds = await listGroupMemberIds(ctx, groupId);
    const now = Date.now();
    const { timezone } = await prepareGroupJournalDay(
      ctx,
      groupId,
      memberUserIds,
      now,
    );
    const rolledCount = await syncMeetLocksForGroupInternal(
      ctx,
      groupId,
      memberUserIds,
      timezone,
      now,
    );

    return { rolledCount };
  },
});

export const addEntry = mutation({
  args: {
    groupId: v.id("friendGroups"),
    photoStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { groupId, photoStorageId, caption }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const normalizedCaption = normalizeCaption(caption);

    const sentAt = Date.now();
    const memberUserIds = await listGroupMemberIds(ctx, groupId);
    const { timezone } = await prepareGroupJournalDay(
      ctx,
      groupId,
      memberUserIds,
      sentAt,
    );
    const normalizedDayDate = dayDateFromTimestamp(sentAt, timezone);

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
    const entryIds: Id<"journalEntries">[] = [];

    for (const targetFriendId of targetFriendIds) {
      const groupId = await getOrCreateFriendGroupForUsers(
        ctx,
        userId,
        targetFriendId,
      );
      const memberUserIds = await listGroupMemberIds(ctx, groupId);
      const { timezone } = await prepareGroupJournalDay(
        ctx,
        groupId,
        memberUserIds,
        sentAt,
      );
      const normalizedDayDate = dayDateFromTimestamp(sentAt, timezone);

      const entryId = await ctx.db.insert("journalEntries", {
        groupId,
        authorUserId: userId,
        photoStorageId,
        caption: normalizedCaption,
        sentAt,
        dayDate: normalizedDayDate,
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
    const memberUserIds = await listGroupMemberIds(ctx, groupId);
    const { timezone } = await prepareGroupJournalDay(
      ctx,
      groupId,
      memberUserIds,
      now,
    );

    if (!isDayEnded(normalizedDate, now, timezone)) {
      userError("Today's glimts cannot be unlocked yet.");
    }
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
