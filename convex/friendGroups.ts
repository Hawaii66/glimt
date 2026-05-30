import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  findGroupForUsers,
  getOrCreateFriendGroupForUsers,
  listGroupMemberIds,
  requireGroupMember,
  validateEmoji,
} from "./lib/friendGroups";
import { requireAuthUserId } from "./lib/auth";

type MemberProfile = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
};

type FriendGroupSummary = {
  groupId: Id<"friendGroups">;
  sharedEmoji: string | null;
  members: MemberProfile[];
};

async function getUserProfile(ctx: QueryCtx, userId: Id<"users">) {
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
  };
}

async function buildGroupSummary(
  ctx: QueryCtx,
  groupId: Id<"friendGroups">,
): Promise<FriendGroupSummary | null> {
  const group = await ctx.db.get(groupId);
  if (!group) {
    return null;
  }

  const memberIds = await listGroupMemberIds(ctx, groupId);
  const members = await Promise.all(
    memberIds.map((memberId) => getUserProfile(ctx, memberId)),
  );

  return {
    groupId,
    sharedEmoji: group.sharedEmoji ?? null,
    members: members.filter((member): member is MemberProfile => member !== null),
  };
}

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<FriendGroupSummary[]> => {
    const userId = await requireAuthUserId(ctx);

    const memberships = await ctx.db
      .query("friendGroupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const groups = await Promise.all(
      memberships.map((membership) => buildGroupSummary(ctx, membership.groupId)),
    );

    return groups.filter(
      (group): group is FriendGroupSummary => group !== null,
    );
  },
});

export const getWithFriend = query({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, { friendUserId }): Promise<FriendGroupSummary | null> => {
    const userId = await requireAuthUserId(ctx);
    const groupId = await findGroupForUsers(ctx, userId, friendUserId);
    if (!groupId) {
      return null;
    }

    await requireGroupMember(ctx, groupId, userId);
    return await buildGroupSummary(ctx, groupId);
  },
});

export const getOrCreateWithFriend = mutation({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, { friendUserId }) => {
    const userId = await requireAuthUserId(ctx);

    if (userId === friendUserId) {
      throw new Error("You cannot create a friend group with yourself.");
    }

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_and_friend", (q) =>
        q.eq("userId", userId).eq("friendUserId", friendUserId),
      )
      .unique();

    if (!friendship) {
      throw new Error("You can only open a journal with an accepted friend.");
    }

    const groupId = await getOrCreateFriendGroupForUsers(
      ctx,
      userId,
      friendUserId,
    );

    return await buildGroupSummary(ctx, groupId);
  },
});

export const setSharedEmoji = mutation({
  args: {
    groupId: v.id("friendGroups"),
    emoji: v.string(),
  },
  handler: async (ctx, { groupId, emoji }) => {
    const userId = await requireAuthUserId(ctx);
    await requireGroupMember(ctx, groupId, userId);

    const normalizedEmoji = validateEmoji(emoji);

    await ctx.db.patch(groupId, {
      sharedEmoji: normalizedEmoji,
      updatedAt: Date.now(),
    });
  },
});
