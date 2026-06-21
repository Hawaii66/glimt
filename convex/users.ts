import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { accentThemeValidator } from "./lib/accentTheme";
import { widgetDisplayPreferencesValidator } from "./lib/widgetDisplayPreferences";
import {
  normalizeUsername,
  requireAuthUserId,
  requireExistingUser,
  validateUsername,
} from "./lib/auth";
import { validateIanaTimezone } from "./lib/dates";

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

    return { ...user, avatarUrl };
  },
});

export const isUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const normalized = normalizeUsername(username);
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      return false;
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", normalized))
      .unique();

    if (!existing) {
      return true;
    }

    const currentUserId = await getAuthUserId(ctx);
    return existing._id === currentUserId;
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAccentTheme = mutation({
  args: { accentTheme: accentThemeValidator },
  handler: async (ctx, { accentTheme }) => {
    const { userId } = await requireExistingUser(ctx);
    await ctx.db.patch(userId, { accentTheme });
  },
});

export const setWidgetDisplayPreferences = mutation({
  args: {
    preferences: widgetDisplayPreferencesValidator,
  },
  handler: async (ctx, { preferences }) => {
    const { userId } = await requireExistingUser(ctx);
    await ctx.db.patch(userId, { widgetDisplayPreferences: preferences });
  },
});

export const syncTimezone = mutation({
  args: { timezone: v.string() },
  handler: async (ctx, { timezone }) => {
    const { userId, user } = await requireExistingUser(ctx);
    const normalizedTimezone = validateIanaTimezone(timezone);

    if (user.timezone === normalizedTimezone) {
      return { timezone: normalizedTimezone, updated: false };
    }

    const now = Date.now();
    await ctx.db.patch(userId, {
      timezone: normalizedTimezone,
      timezoneUpdatedAt: now,
    });

    return { timezone: normalizedTimezone, updated: true };
  },
});

export const updateName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const { userId } = await requireExistingUser(ctx);
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Display name is required.");
    }

    await ctx.db.patch(userId, { name: trimmedName });
  },
});

export const updateAvatar = mutation({
  args: {
    avatarStorageId: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, { avatarStorageId }) => {
    const { userId } = await requireExistingUser(ctx);
    await ctx.db.patch(userId, {
      avatarStorageId: avatarStorageId ?? undefined,
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    accentTheme: accentThemeValidator,
  },
  handler: async (ctx, { name, username, avatarStorageId, accentTheme }) => {
    const { userId } = await requireExistingUser(ctx);
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Display name is required.");
    }

    const normalizedUsername = validateUsername(username);

    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", normalizedUsername))
      .unique();

    if (existing && existing._id !== userId) {
      throw new Error("Username is already taken.");
    }

    await ctx.db.patch(userId, {
      name: trimmedName,
      username: normalizedUsername,
      avatarStorageId,
      accentTheme,
      onboardingComplete: true,
    });
  },
});
