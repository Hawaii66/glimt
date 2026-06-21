import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { findGroupForUsers, listGroupMemberIds } from "./friendGroups";
import { getJournalTimezoneContext } from "./journalTimezone";
import { getUserProfile, type WidgetGlimt } from "./journalHelpers";
import { todayIsoDate } from "./dates";

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed);

  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index]!;
    result[index] = result[swapIndex]!;
    result[swapIndex] = current;
  }

  return result;
}

export function selectWidgetGlimts(
  candidates: WidgetGlimt[],
  limit: number,
  seed: number,
  pinnedPhotoId?: Id<"journalEntries">,
): WidgetGlimt[] {
  if (candidates.length === 0) {
    return [];
  }

  const pinned = pinnedPhotoId
    ? candidates.find((candidate) => candidate.photoId === pinnedPhotoId)
    : undefined;
  const pool = pinned
    ? candidates.filter((candidate) => candidate.photoId !== pinnedPhotoId)
    : candidates;
  const shuffled = seededShuffle(pool, seed);
  const selected = pinned ? [pinned, ...shuffled] : shuffled;

  return selected.slice(0, limit);
}

export async function listTodayWidgetGlimtCandidates(
  ctx: QueryCtx,
  userId: Id<"users">,
  now = Date.now(),
): Promise<WidgetGlimt[]> {
  const friendships = await ctx.db
    .query("friendships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const candidates: WidgetGlimt[] = [];

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

    const friendEntries = entries
      .filter((entry) => entry.authorUserId === friendUserId)
      .sort((a, b) => b.sentAt - a.sentAt);

    if (friendEntries.length === 0) {
      continue;
    }

    const profile = await getUserProfile(ctx, friendUserId);
    if (!profile) {
      continue;
    }

    for (const entry of friendEntries) {
      const photoUrl =
        (await ctx.storage.getUrl(entry.photoStorageId)) ?? "";
      if (!photoUrl) {
        continue;
      }

      candidates.push({
        friendUserId: profile.id,
        photoId: entry._id,
        photoUrl,
        avatarUrl: profile.avatarUrl,
        displayName: profile.displayName,
        sentAt: entry.sentAt,
      });
    }
  }

  return candidates;
}

export function currentWidgetRotationSeed(now = Date.now()): number {
  return Math.floor(now / (60 * 60 * 1000));
}
