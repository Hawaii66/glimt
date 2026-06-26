import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function deleteFriendshipsBetween(
  ctx: MutationCtx,
  userA: Id<"users">,
  userB: Id<"users">,
) {
  const friendshipA = await ctx.db
    .query("friendships")
    .withIndex("by_user_and_friend", (q) =>
      q.eq("userId", userA).eq("friendUserId", userB),
    )
    .unique();

  if (friendshipA) {
    await ctx.db.delete(friendshipA._id);
  }

  const friendshipB = await ctx.db
    .query("friendships")
    .withIndex("by_user_and_friend", (q) =>
      q.eq("userId", userB).eq("friendUserId", userA),
    )
    .unique();

  if (friendshipB) {
    await ctx.db.delete(friendshipB._id);
  }
}

export async function deleteAllRequestsBetween(
  ctx: MutationCtx,
  userA: Id<"users">,
  userB: Id<"users">,
) {
  const requestsAB = await ctx.db
    .query("friendRequests")
    .withIndex("by_from_and_to", (q) =>
      q.eq("fromUserId", userA).eq("toUserId", userB),
    )
    .collect();

  for (const request of requestsAB) {
    await ctx.db.delete(request._id);
  }

  const requestsBA = await ctx.db
    .query("friendRequests")
    .withIndex("by_from_and_to", (q) =>
      q.eq("fromUserId", userB).eq("toUserId", userA),
    )
    .collect();

  for (const request of requestsBA) {
    await ctx.db.delete(request._id);
  }
}

export async function deleteMeetUnlockSessionsForGroup(
  ctx: MutationCtx,
  groupId: Id<"friendGroups">,
) {
  const sessions = await ctx.db
    .query("meetUnlockSessions")
    .filter((q) => q.eq(q.field("groupId"), groupId))
    .collect();

  for (const session of sessions) {
    await ctx.db.delete(session._id);
  }
}
