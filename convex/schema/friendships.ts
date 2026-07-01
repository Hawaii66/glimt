import { defineTable } from "convex/server";
import { v } from "convex/values";

import { friendRequestStatus } from "./validators";

export const friendshipTables = {
  friendRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: friendRequestStatus,
    respondedAt: v.optional(v.number()),
  })
    .index("by_toUserId_and_status", ["toUserId", "status"])
    .index("by_fromUserId", ["fromUserId"])
    .index("by_fromUserId_and_toUserId", ["fromUserId", "toUserId"]),
};
