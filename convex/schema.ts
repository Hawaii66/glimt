import { authTables as defaultAuthTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const authTables = {
  ...defaultAuthTables,
  users: defineTable({
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    email: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("username", ["username"]),
  authVerifiers: defineTable({
    nonce: v.string(),
    expirationTime: v.number(),
  }),
};

export default defineSchema({
  ...authTables,
});
