import { authTables as defaultAuthTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const authTables = {
  ...defaultAuthTables,
  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.optional(v.string()),
    nonce: v.optional(v.string()),
    expirationTime: v.optional(v.number()),
  }).index("signature", ["signature"]),
};

export default defineSchema({
  ...authTables,
});
