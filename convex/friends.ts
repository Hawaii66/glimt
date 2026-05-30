import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId, validateUsername } from "./lib/auth";
import { createFriendGroup } from "./lib/friendGroups";

type UserProfile = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
};

type FriendRequestWithProfile = UserProfile & {
  requestId: Id<"friendRequests">;
};

async function getUserProfile(
  ctx: QueryCtx | MutationCtx,
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
  };
}

async function areFriends(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  otherUserId: Id<"users">,
) {
  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_user_and_friend", (q) =>
      q.eq("userId", userId).eq("friendUserId", otherUserId),
    )
    .unique();
  return friendship !== null;
}

export const listIncomingRequests = query({
  args: {},
  handler: async (ctx): Promise<FriendRequestWithProfile[]> => {
    const userId = await requireAuthUserId(ctx);

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_and_status", (q) =>
        q.eq("toUserId", userId).eq("status", "pending"),
      )
      .collect();

    const profiles = await Promise.all(
      requests.map(async (request) => {
        const profile = await getUserProfile(ctx, request.fromUserId);
        if (!profile) {
          return null;
        }
        return {
          requestId: request._id,
          ...profile,
        };
      }),
    );

    return profiles.filter(
      (profile): profile is FriendRequestWithProfile => profile !== null,
    );
  },
});

export const listFriends = query({
  args: {},
  handler: async (ctx): Promise<UserProfile[]> => {
    const userId = await requireAuthUserId(ctx);

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const profiles = await Promise.all(
      friendships.map((friendship) =>
        getUserProfile(ctx, friendship.friendUserId),
      ),
    );

    return profiles.filter((profile): profile is UserProfile => profile !== null);
  },
});

export const sendRequest = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const fromUserId = await requireAuthUserId(ctx);
    const normalizedUsername = validateUsername(username);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", normalizedUsername))
      .unique();

    if (!targetUser) {
      throw new Error("No user found with that username.");
    }

    if (!targetUser.onboardingComplete) {
      throw new Error("That user has not finished setting up their account.");
    }

    const toUserId = targetUser._id;

    if (fromUserId === toUserId) {
      throw new Error("You cannot send a friend request to yourself.");
    }

    if (await areFriends(ctx, fromUserId, toUserId)) {
      throw new Error("You are already friends with this user.");
    }

    const incoming = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_and_to", (q) =>
        q.eq("fromUserId", toUserId).eq("toUserId", fromUserId),
      )
      .unique();

    if (incoming?.status === "pending") {
      throw new Error("This user already sent you a friend request.");
    }

    const outgoing = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_and_to", (q) =>
        q.eq("fromUserId", fromUserId).eq("toUserId", toUserId),
      )
      .unique();

    if (outgoing?.status === "pending") {
      throw new Error("Friend request already sent.");
    }

    const now = Date.now();

    if (outgoing?.status === "declined") {
      await ctx.db.patch(outgoing._id, {
        status: "pending",
        createdAt: now,
        respondedAt: undefined,
      });
      return outgoing._id;
    }

    return await ctx.db.insert("friendRequests", {
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: now,
    });
  },
});

export const acceptRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    const userId = await requireAuthUserId(ctx);
    const request = await ctx.db.get(requestId);

    if (!request) {
      throw new Error("Friend request not found.");
    }

    if (request.toUserId !== userId) {
      throw new Error("You can only accept requests sent to you.");
    }

    if (request.status !== "pending") {
      throw new Error("This friend request is no longer pending.");
    }

    const now = Date.now();

    await ctx.db.patch(requestId, {
      status: "accepted",
      respondedAt: now,
    });

    if (!(await areFriends(ctx, request.fromUserId, request.toUserId))) {
      await ctx.db.insert("friendships", {
        userId: request.fromUserId,
        friendUserId: request.toUserId,
        createdAt: now,
      });
      await ctx.db.insert("friendships", {
        userId: request.toUserId,
        friendUserId: request.fromUserId,
        createdAt: now,
      });
      await createFriendGroup(ctx, [request.fromUserId, request.toUserId]);
    }
  },
});

export const declineRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    const userId = await requireAuthUserId(ctx);
    const request = await ctx.db.get(requestId);

    if (!request) {
      throw new Error("Friend request not found.");
    }

    if (request.toUserId !== userId) {
      throw new Error("You can only decline requests sent to you.");
    }

    if (request.status !== "pending") {
      throw new Error("This friend request is no longer pending.");
    }

    await ctx.db.patch(requestId, {
      status: "declined",
      respondedAt: Date.now(),
    });
  },
});
