import { authTables as defaultAuthTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const authTables = {
  ...defaultAuthTables,
  users: defineTable({
    username: v.string(),
    name: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    email: v.string(),
  })
    .index("email", ["email"])
    .index("username", ["username"]),
  authVerifiers: defineTable({
    sessionId: v.id("authSessions"),
    signature: v.string(),
    nonce: v.string(),
    expirationTime: v.number(),
  }).index("signature", ["signature"]),
};

export default defineSchema({
  ...authTables,
});
