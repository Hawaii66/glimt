import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/auth";
import {
  requireGroupMember,
  validateDayDate,
  validateEmoji,
} from "./lib/friendGroups";

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
  yours: JournalEntry[];
  theirs: JournalEntry[];
};

function dayDateFromTimestamp(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
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
    yours,
    theirs,
  };
}

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

    const trimmedCaption = caption?.trim();
    if (trimmedCaption && trimmedCaption.length > 30) {
      throw new Error("Caption must be 30 characters or fewer.");
    }

    const sentAt = Date.now();
    const normalizedDayDate = dayDate
      ? validateDayDate(dayDate)
      : dayDateFromTimestamp(sentAt);

    return await ctx.db.insert("journalEntries", {
      groupId,
      authorUserId: userId,
      photoStorageId,
      caption: trimmedCaption || undefined,
      sentAt,
      dayDate: normalizedDayDate,
    });
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

    const existingDay = await ctx.db
      .query("journalDays")
      .withIndex("by_group_and_date", (q) =>
        q.eq("groupId", groupId).eq("date", normalizedDate),
      )
      .unique();

    if (existingDay) {
      await ctx.db.patch(existingDay._id, {
        togetherUnlockedAt: now,
      });
      return existingDay._id;
    }

    return await ctx.db.insert("journalDays", {
      groupId,
      date: normalizedDate,
      togetherUnlockedAt: now,
    });
  },
});
