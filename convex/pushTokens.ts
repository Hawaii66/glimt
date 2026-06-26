import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { requireAuthUserId, requireExistingUser } from "./lib/auth";

export const registerPushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
  },
  handler: async (ctx, { token, platform }) => {
    const { userId } = await requireExistingUser(ctx);
    const now = Date.now();

    const existingForToken = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (existingForToken) {
      await ctx.db.patch(existingForToken._id, {
        userId,
        platform,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("pushTokens", {
        userId,
        token,
        platform,
        updatedAt: now,
      });
    }

    const userTokens = await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const entry of userTokens) {
      if (entry.platform === platform && entry.token !== token) {
        await ctx.db.delete(entry._id);
      }
    }
  },
});

export const unregisterPushToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await requireAuthUserId(ctx);
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (existing && existing.userId === userId) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const listForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const removeByToken = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
