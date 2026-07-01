import { defineTable } from "convex/server";
import { v } from "convex/values";

import { capsuleVaultStatus, localDate } from "./validators";

/**
 * QR meet capsules: glimts in a date range stay sealed until friends scan
 * a host's short-lived QR code together.
 */
export const capsuleTables = {
  capsuleVaults: defineTable({
    groupId: v.id("groups"),
    periodStartDate: localDate,
    periodEndDate: localDate,
    status: capsuleVaultStatus,
    unlockedAt: v.optional(v.number()),
  }).index("by_groupId", ["groupId"]),

  meetUnlockSessions: defineTable({
    vaultId: v.id("capsuleVaults"),
    hostUserId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_vaultId", ["vaultId"]),

  meetScans: defineTable({
    sessionId: v.id("meetUnlockSessions"),
    userId: v.id("users"),
    scannedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_and_userId", ["sessionId", "userId"]),
};
