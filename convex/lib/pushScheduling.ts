import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { getUserProfile } from "./journalHelpers";

function displayLabel(profile: {
  displayName: string;
  username: string;
}): string {
  return profile.displayName || profile.username || "Someone";
}

export async function scheduleGlimtReceivedPush(
  ctx: MutationCtx,
  toUserId: Id<"users">,
  fromUserId: Id<"users">,
) {
  const senderProfile = await getUserProfile(ctx, fromUserId);
  if (!senderProfile) {
    return;
  }

  const senderLabel = displayLabel(senderProfile);
  await ctx.scheduler.runAfter(0, internal.pushNotifications.sendToUser, {
    userId: toUserId,
    fromUserId,
    title: "New glimt",
    body: `${senderLabel} sent you a glimt`,
    data: { type: "glimt_received" },
  });
}

export async function scheduleFriendRequestAcceptedPush(
  ctx: MutationCtx,
  toUserId: Id<"users">,
  fromUserId: Id<"users">,
) {
  const accepterProfile = await getUserProfile(ctx, fromUserId);
  if (!accepterProfile) {
    return;
  }

  const accepterLabel = displayLabel(accepterProfile);
  await ctx.scheduler.runAfter(0, internal.pushNotifications.sendToUser, {
    userId: toUserId,
    fromUserId,
    title: "Friend request accepted",
    body: `${accepterLabel} accepted your friend request`,
    data: { type: "friend_request_accepted" },
  });
}
