import { v } from "convex/values";

/** yyyy-MM-dd calendar day in the author's local timezone at capture time. */
export const localDate = v.string();

export const groupMemberRole = v.union(
  v.literal("owner"),
  v.literal("member"),
);

export const friendRequestStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
);

export const capsuleVaultStatus = v.union(
  v.literal("sealed"),
  v.literal("unlocked"),
);

export const scheduledNotificationKind = v.union(
  v.literal("unlock_nudge"),
  v.literal("evening_rescue"),
  v.literal("domino_effect"),
  v.literal("vibe_check"),
);

export const scheduledNotificationStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("cancelled"),
);

export const pushPlatform = v.union(
  v.literal("ios"),
  v.literal("android"),
);

/** Max caption length from IDEA.md. */
export const CAPTION_MAX_LENGTH = 50;

/** Camera cooldown after each glimt (15 minutes). */
export const GLIMT_COOLDOWN_MS = 15 * 60 * 1000;

/** Group invite codes (8 characters). */
export const GROUP_INVITE_CODE_LENGTH = 8;
