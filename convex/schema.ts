import { authTables as defaultAuthTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


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
});
