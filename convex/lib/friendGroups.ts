import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type FriendGroupCtx = QueryCtx | MutationCtx;

export async function findGroupForUsers(
  ctx: FriendGroupCtx,
  userId: Id<"users">,
  otherUserId: Id<"users">,
): Promise<Id<"friendGroups"> | null> {
  const memberships = await ctx.db
    .query("friendGroupMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const membership of memberships) {
    const otherMembership = await ctx.db
      .query("friendGroupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", membership.groupId).eq("userId", otherUserId),
      )
      .unique();

    if (otherMembership) {
      return membership.groupId;
    }
  }

  return null;
}

export async function createFriendGroup(
  ctx: MutationCtx,
  memberUserIds: Id<"users">[],
) {
  const uniqueMemberIds = [...new Set(memberUserIds)];
  if (uniqueMemberIds.length < 2) {
    throw new Error("A friend group needs at least two members.");
  }

  const now = Date.now();
  const groupId = await ctx.db.insert("friendGroups", {
    sharedEmoji: undefined,
    createdAt: now,
    updatedAt: now,
  });

  for (const userId of uniqueMemberIds) {
    await ctx.db.insert("friendGroupMembers", {
      groupId,
      userId,
      joinedAt: now,
    });
  }

  return groupId;
}

export async function getOrCreateFriendGroupForUsers(
  ctx: MutationCtx,
  userId: Id<"users">,
  otherUserId: Id<"users">,
) {
  const existingGroupId = await findGroupForUsers(ctx, userId, otherUserId);
  if (existingGroupId) {
    return existingGroupId;
  }

  return await createFriendGroup(ctx, [userId, otherUserId]);
}

export async function requireGroupMember(
  ctx: FriendGroupCtx,
  groupId: Id<"friendGroups">,
  userId: Id<"users">,
) {
  const group = await ctx.db.get(groupId);
  if (!group) {
    throw new Error("Friend group not found.");
  }

  const membership = await ctx.db
    .query("friendGroupMembers")
    .withIndex("by_group_and_user", (q) =>
      q.eq("groupId", groupId).eq("userId", userId),
    )
    .unique();

  if (!membership) {
    throw new Error("You are not a member of this friend group.");
  }

  return group;
}

export async function listGroupMemberIds(
  ctx: FriendGroupCtx,
  groupId: Id<"friendGroups">,
) {
  const memberships = await ctx.db
    .query("friendGroupMembers")
    .withIndex("by_group", (q) => q.eq("groupId", groupId))
    .collect();

  return memberships.map((membership) => membership.userId);
}

export function validateEmoji(emoji: string) {
  const trimmed = emoji.trim();
  if (!trimmed) {
    throw new Error("Emoji is required.");
  }
  if (trimmed.length > 8) {
    throw new Error("Emoji is too long.");
  }
  return trimmed;
}

export function validateDayDate(dayDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDate)) {
    throw new Error("Day date must be in YYYY-MM-DD format.");
  }
  return dayDate;
}
