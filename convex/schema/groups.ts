import { defineTable } from "convex/server";
import { v } from "convex/values";

import { groupMemberRole } from "./validators";

/** Shared friend-group journals with an 8-character invite code. */
export const groupTables = {
  groups: defineTable({
    name: v.optional(v.string()),
    inviteCode: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_inviteCode", ["inviteCode"])
    .index("by_createdBy", ["createdBy"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: groupMemberRole,
    /** History before this timestamp is hidden from this member. */
    joinedAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"])
    .index("by_groupId_and_userId", ["groupId", "userId"]),
};
