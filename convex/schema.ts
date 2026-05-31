import { authTables as defaultAuthTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { accentThemeValidator } from "./lib/accentTheme";

const authTables = {
  ...defaultAuthTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    onboardingComplete: v.optional(v.boolean()),
    accentTheme: v.optional(accentThemeValidator),
    timezone: v.optional(v.string()),
    timezoneUpdatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("username", ["username"]),
  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.optional(v.string()),
    nonce: v.optional(v.string()),
    expirationTime: v.optional(v.number()),
  }).index("signature", ["signature"]),
};

export default defineSchema({
  ...authTables,
  friendRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_to_and_status", ["toUserId", "status"])
    .index("by_from_and_status", ["fromUserId", "status"])
    .index("by_from_and_to", ["fromUserId", "toUserId"]),
  friendships: defineTable({
    userId: v.id("users"),
    friendUserId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_friend", ["userId", "friendUserId"]),
  friendGroups: defineTable({
    sharedEmoji: v.optional(v.string()),
    journalTimezone: v.optional(v.string()),
    scheduledJournalTimezone: v.optional(v.string()),
    scheduledJournalTimezoneFrom: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  friendGroupMembers: defineTable({
    groupId: v.id("friendGroups"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_group", ["groupId"])
    .index("by_group_and_user", ["groupId", "userId"]),
  journalEntries: defineTable({
    groupId: v.id("friendGroups"),
    authorUserId: v.id("users"),
    photoStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
    sentAt: v.number(),
    dayDate: v.string(),
  })
    .index("by_group", ["groupId"])
    .index("by_group_and_day", ["groupId", "dayDate"]),
  journalDays: defineTable({
    groupId: v.id("friendGroups"),
    date: v.string(),
    sharedEmoji: v.optional(v.string()),
    togetherUnlockedAt: v.optional(v.number()),
    meetLocked: v.optional(v.boolean()),
    meetLockedAt: v.optional(v.number()),
  })
    .index("by_group", ["groupId"])
    .index("by_group_and_date", ["groupId", "date"]),
  meetUnlockSessions: defineTable({
    groupId: v.id("friendGroups"),
    date: v.string(),
    sessionId: v.string(),
    hostUserId: v.id("users"),
    nonce: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_group_and_date", ["groupId", "date"]),
});
