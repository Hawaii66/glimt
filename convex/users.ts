import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  normalizeUsername,
  requireExistingUser,
  validateUsername,
} from "./lib/auth";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function isOnboardingComplete(user: { username?: string | null }) {
  return Boolean(user.username?.trim());
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const avatarUrl = user.avatarStorageId
      ? await ctx.storage.getUrl(user.avatarStorageId)
      : null;

    return {
      ...user,
      avatarUrl,
      onboardingComplete: isOnboardingComplete(user),
    };
  },
});

export const isUsernameAvailable = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const username = normalizeUsername(args.username);
    if (!USERNAME_PATTERN.test(username)) {
      return false;
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username))
      .unique();

    return !existing || existing._id === userId;
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireExistingUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireExistingUser(ctx);
    if (isOnboardingComplete(user)) {
      throw new Error("Onboarding already completed");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Display name is required");
    }

    const username = validateUsername(args.username);
    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username))
      .unique();

    if (existing && existing._id !== userId) {
      throw new Error("Username is already taken");
    }

    await ctx.db.patch(userId, {
      name,
      username,
      ...(args.avatarStorageId
        ? { avatarStorageId: args.avatarStorageId }
        : {}),
    });
  },
});
