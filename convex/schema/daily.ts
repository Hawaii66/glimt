import { defineTable } from "convex/server";
import { v } from "convex/values";

import { localDate } from "./validators";

/**
 * Denormalized per-user daily summary for lock state, cooldown, and grid heat.
 * Updated when glimts are created.
 */
export const dailyTables = {
  userDailyStates: defineTable({
    userId: v.id("users"),
    localDate,
    glimtCount: v.number(),
    /** Timestamp of the first glimt — posting it unlocks the app for the day. */
    keyGlimtAt: v.optional(v.number()),
    /** Timestamp of the most recent glimt — drives the 15-minute cooldown. */
    lastGlimtAt: v.optional(v.number()),
  })
    .index("by_userId_and_localDate", ["userId", "localDate"])
    .index("by_userId", ["userId"]),
};
