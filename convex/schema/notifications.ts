import { defineTable } from "convex/server";
import { v } from "convex/values";

import {
  pushPlatform,
  scheduledNotificationKind,
  scheduledNotificationStatus,
} from "./validators";

export const notificationTables = {
  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    platform: pushPlatform,
  })
    .index("by_userId", ["userId"])
    .index("by_token", ["token"]),

  scheduledNotifications: defineTable({
    userId: v.id("users"),
    kind: scheduledNotificationKind,
    status: scheduledNotificationStatus,
    scheduledFor: v.number(),
    /** Optional group context (e.g. vibe check, domino effect). */
    groupId: v.optional(v.id("groups")),
    /** Optional actor who triggered the notification. */
    actorUserId: v.optional(v.id("users")),
    sentAt: v.optional(v.number()),
  })
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_status_and_scheduledFor", ["status", "scheduledFor"]),
};
