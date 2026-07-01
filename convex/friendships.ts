import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation } from "./_generated/server";
import { requireExistingUser } from "./lib/auth";
import { getUserByUsername } from "./lib/users";
import { userError } from "./lib/userError";

async function getFriendRequestBetween(
  ctx: MutationCtx,
  userIdA: Id<"users">,
  userIdB: Id<"users">,
) {
  const forward = await ctx.db
    .query("friendRequests")
    .withIndex("by_fromUserId_and_toUserId", (q) =>
      q.eq("fromUserId", userIdA).eq("toUserId", userIdB),
    )
    .unique();

  if (forward) {
    return forward;
  }

  return await ctx.db
    .query("friendRequests")
    .withIndex("by_fromUserId_and_toUserId", (q) =>
      q.eq("fromUserId", userIdB).eq("toUserId", userIdA),
    )
    .unique();
}

export const addFriend = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const { userId } = await requireExistingUser(ctx);
    const target = await getUserByUsername(ctx, username);

    if (target._id === userId) {
      userError("You can't add yourself as a friend.");
    }

    const existing = await getFriendRequestBetween(ctx, userId, target._id);

    if (existing) {
      if (existing.status === "accepted") {
        userError("You're already friends with this user.");
      }

      if (existing.status === "pending") {
        if (existing.fromUserId === userId) {
          userError("Friend request already sent.");
        }
        userError("This user already sent you a friend request.");
      }

      if (existing.fromUserId === userId) {
        await ctx.db.patch(existing._id, {
          status: "pending",
          respondedAt: undefined,
        });
        return;
      }

      await ctx.db.delete(existing._id);
    }

    await ctx.db.insert("friendRequests", {
      fromUserId: userId,
      toUserId: target._id,
      status: "pending",
    });
  },
});

export const removeFriend = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const { userId } = await requireExistingUser(ctx);
    const target = await getUserByUsername(ctx, username);

    if (target._id === userId) {
      userError("You can't remove yourself as a friend.");
    }

    const existing = await getFriendRequestBetween(ctx, userId, target._id);

    if (!existing) {
      userError("No friendship or request with this user.");
    }

    if (existing.status === "accepted") {
      await ctx.db.delete(existing._id);
      return;
    }

    if (existing.status === "pending" && existing.fromUserId === userId) {
      await ctx.db.delete(existing._id);
      return;
    }

    if (existing.status === "pending") {
      userError("Use declineFriendRequest to decline an incoming request.");
    }

    userError("No friendship with this user.");
  },
});

export const acceptFriendRequest = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const { userId } = await requireExistingUser(ctx);
    const requester = await getUserByUsername(ctx, username);

    if (requester._id === userId) {
      userError("You can't accept a friend request from yourself.");
    }

    const request = await ctx.db
      .query("friendRequests")
      .withIndex("by_fromUserId_and_toUserId", (q) =>
        q.eq("fromUserId", requester._id).eq("toUserId", userId),
      )
      .unique();

    if (!request || request.status !== "pending") {
      userError("No pending friend request from this user.");
    }

    await ctx.db.patch(request._id, {
      status: "accepted",
      respondedAt: Date.now(),
    });
  },
});

export const declineFriendRequest = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const { userId } = await requireExistingUser(ctx);
    const requester = await getUserByUsername(ctx, username);

    if (requester._id === userId) {
      userError("You can't decline a friend request from yourself.");
    }

    const request = await ctx.db
      .query("friendRequests")
      .withIndex("by_fromUserId_and_toUserId", (q) =>
        q.eq("fromUserId", requester._id).eq("toUserId", userId),
      )
      .unique();

    if (!request || request.status !== "pending") {
      userError("No pending friend request from this user.");
    }

    await ctx.db.patch(request._id, {
      status: "declined",
      respondedAt: Date.now(),
    });
  },
});
