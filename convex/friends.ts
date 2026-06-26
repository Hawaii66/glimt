import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAuthUserId, validateUsername } from "./lib/auth";
import { createFriendGroup, findGroupForUsers, listGroupMemberIds } from "./lib/friendGroups";
import { resolveUserTimezone, todayIsoDate } from "./lib/dates";
import {
  ensureJournalTimezoneDefault,
  prepareJournalTimezoneForMutation,
} from "./lib/journalTimezone";
import { prepareTodayMeetLockForGroup } from "./lib/meetLock";
import {
  deleteAllRequestsBetween,
  deleteFriendshipsBetween,
  deleteMeetUnlockSessionsForGroup,
} from "./lib/friends";
import { scheduleFriendRequestAcceptedPush } from "./lib/pushScheduling";
import { userError } from "./lib/userError";

type UserProfile = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
  accentTheme?: string;
  timezone: string;
};

type FriendRequestWithProfile = UserProfile & {
  requestId: Id<"friendRequests">;
};

type FriendRequestDoc = {
  _id: Id<"friendRequests">;
  fromUserId: Id<"users">;
  toUserId: Id<"users">;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
  respondedAt?: number;
};

const REQUEST_STATUS_PRIORITY: Record<FriendRequestDoc["status"], number> = {
  pending: 0,
  declined: 1,
  accepted: 2,
};

async function getRequestBetweenUsers(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
): Promise<FriendRequestDoc | null> {
  const requests = await ctx.db
    .query("friendRequests")
    .withIndex("by_from_and_to", (q) =>
      q.eq("fromUserId", fromUserId).eq("toUserId", toUserId),
    )
    .collect();

  if (requests.length === 0) {
    return null;
  }

  const sorted = [...requests].sort((a, b) => {
    const priorityDiff =
      REQUEST_STATUS_PRIORITY[a.status] - REQUEST_STATUS_PRIORITY[b.status];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return b.createdAt - a.createdAt;
  });

  const canonical = sorted[0]!;
  for (const duplicate of sorted.slice(1)) {
    await ctx.db.delete(duplicate._id);
  }

  return canonical;
}

async function deleteRequestsBetweenUsers(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
  exceptId?: Id<"friendRequests">,
) {
  const requests = await ctx.db
    .query("friendRequests")
    .withIndex("by_from_and_to", (q) =>
      q.eq("fromUserId", fromUserId).eq("toUserId", toUserId),
    )
    .collect();

  for (const request of requests) {
    if (request._id !== exceptId) {
      await ctx.db.delete(request._id);
    }
  }
}

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
    accentTheme: user.accentTheme,
    timezone: resolveUserTimezone(user.timezone),
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

    return collectRequestsWithProfiles(ctx, requests, "fromUserId");
  },
});

export const listOutgoingRequests = query({
  args: {},
  handler: async (ctx): Promise<FriendRequestWithProfile[]> => {
    const userId = await requireAuthUserId(ctx);

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_and_status", (q) =>
        q.eq("fromUserId", userId).eq("status", "pending"),
      )
      .collect();

    return collectRequestsWithProfiles(ctx, requests, "toUserId");
  },
});

async function collectRequestsWithProfiles(
  ctx: QueryCtx,
  requests: Array<{
    _id: Id<"friendRequests">;
    fromUserId: Id<"users">;
    toUserId: Id<"users">;
  }>,
  profileUserIdKey: "fromUserId" | "toUserId",
): Promise<FriendRequestWithProfile[]> {
  const profiles = await Promise.all(
    requests.map(async (request) => {
      const profile = await getUserProfile(ctx, request[profileUserIdKey]);
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
}

export const getFriend = query({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, { friendUserId }): Promise<UserProfile | null> => {
    const userId = await requireAuthUserId(ctx);

    if (!(await areFriends(ctx, userId, friendUserId))) {
      return null;
    }

    return getUserProfile(ctx, friendUserId);
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

    return profiles.filter(
      (profile): profile is UserProfile => profile !== null,
    );
  },
});

export const getGroupForFriend = query({
  args: { friendUserId: v.id("users") },
  handler: async (
    ctx,
    { friendUserId },
  ): Promise<Id<"friendGroups"> | null> => {
    const userId = await requireAuthUserId(ctx);

    if (!(await areFriends(ctx, userId, friendUserId))) {
      return null;
    }

    return await findGroupForUsers(ctx, userId, friendUserId);
  },
});

async function scheduleFriendRequestPush(
  ctx: MutationCtx,
  toUserId: Id<"users">,
  fromUserId: Id<"users">,
) {
  const fromProfile = await getUserProfile(ctx, fromUserId);
  if (!fromProfile) {
    return;
  }

  const senderLabel = fromProfile.displayName || fromProfile.username || "Someone";
  await ctx.scheduler.runAfter(0, internal.pushNotifications.sendToUser, {
    userId: toUserId,
    fromUserId,
    title: "Friend request",
    body: `${senderLabel} sent you a friend request`,
    data: { type: "friend_request" },
  });
}

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
      userError("No one found with that username.");
    }

    if (!targetUser.onboardingComplete) {
      userError("That user has not finished setting up their account.");
    }

    const toUserId = targetUser._id;

    if (fromUserId === toUserId) {
      userError("You cannot send a friend request to yourself.");
    }

    if (await areFriends(ctx, fromUserId, toUserId)) {
      userError("You are already friends with this user.");
    }

    const incoming = await getRequestBetweenUsers(ctx, toUserId, fromUserId);

    if (incoming?.status === "pending") {
      userError("This user already sent you a friend request.");
    }

    const outgoing = await getRequestBetweenUsers(ctx, fromUserId, toUserId);

    if (outgoing?.status === "pending") {
      userError("Friend request already sent.");
    }

    const now = Date.now();

    if (outgoing?.status === "declined") {
      await ctx.db.patch(outgoing._id, {
        status: "pending",
        createdAt: now,
        respondedAt: undefined,
      });
      await deleteRequestsBetweenUsers(ctx, toUserId, fromUserId);
      await scheduleFriendRequestPush(ctx, toUserId, fromUserId);
      return outgoing._id;
    }

    if (incoming?.status === "declined") {
      await deleteRequestsBetweenUsers(ctx, fromUserId, toUserId);
      await ctx.db.patch(incoming._id, {
        fromUserId,
        toUserId,
        status: "pending",
        createdAt: now,
        respondedAt: undefined,
      });
      await scheduleFriendRequestPush(ctx, toUserId, fromUserId);
      return incoming._id;
    }

    const requestId = await ctx.db.insert("friendRequests", {
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: now,
    });
    await scheduleFriendRequestPush(ctx, toUserId, fromUserId);
    return requestId;
  },
});

export const acceptRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    const userId = await requireAuthUserId(ctx);
    const request = await ctx.db.get(requestId);

    if (!request) {
      userError("Friend request not found.");
    }

    if (request.toUserId !== userId) {
      userError("You can only accept requests sent to you.");
    }

    if (request.status !== "pending") {
      userError("This friend request is no longer pending.");
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
      const groupId = await createFriendGroup(ctx, [
        request.fromUserId,
        request.toUserId,
      ]);
      const memberUserIds = await listGroupMemberIds(ctx, groupId);
      await ensureJournalTimezoneDefault(ctx, groupId, memberUserIds, now);
      const context = await prepareJournalTimezoneForMutation(
        ctx,
        groupId,
        memberUserIds,
        now,
      );
      const today = todayIsoDate(now, context.effectiveTimezone);
      await prepareTodayMeetLockForGroup(
        ctx,
        groupId,
        today,
        context.effectiveTimezone,
        now,
      );
    }

    await scheduleFriendRequestAcceptedPush(ctx, request.fromUserId, userId);
  },
});

export const removeFriend = mutation({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, { friendUserId }) => {
    const userId = await requireAuthUserId(ctx);

    if (userId === friendUserId) {
      userError("You cannot remove yourself as a friend.");
    }

    if (!(await areFriends(ctx, userId, friendUserId))) {
      userError("You are not friends with this user.");
    }

    const groupId = await findGroupForUsers(ctx, userId, friendUserId);

    await deleteFriendshipsBetween(ctx, userId, friendUserId);
    await deleteAllRequestsBetween(ctx, userId, friendUserId);

    if (groupId) {
      await deleteMeetUnlockSessionsForGroup(ctx, groupId);
    }

    return { removed: true as const };
  },
});

export const cancelRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    const userId = await requireAuthUserId(ctx);
    const request = await ctx.db.get(requestId);

    if (!request) {
      userError("Friend request not found.");
    }

    if (request.fromUserId !== userId) {
      userError("You can only cancel requests you sent.");
    }

    if (request.status !== "pending") {
      userError("This friend request is no longer pending.");
    }

    await ctx.db.delete(requestId);
  },
});

export const declineRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, { requestId }) => {
    const userId = await requireAuthUserId(ctx);
    const request = await ctx.db.get(requestId);

    if (!request) {
      userError("Friend request not found.");
    }

    if (request.toUserId !== userId) {
      userError("You can only decline requests sent to you.");
    }

    if (request.status !== "pending") {
      userError("This friend request is no longer pending.");
    }

    await ctx.db.patch(requestId, {
      status: "declined",
      respondedAt: Date.now(),
    });
  },
});
