import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAuthUserId } from "./lib/auth";

export const logWidgetRefresh = mutation({
  args: {
    event: v.string(),
    details: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, { event, details }) => {
    const userId = await requireAuthUserId(ctx);
    console.log("[widget-refresh]", {
      userId,
      event,
      details,
    });
  },
});
