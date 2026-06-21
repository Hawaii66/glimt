import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { currentWidgetRotationSeed } from "./lib/widgetGlimts";

export const sendHourlyWidgetRefreshes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tokens = await ctx.db.query("pushTokens").collect();
    const userIds = new Set(tokens.map((token) => token.userId));
    const seed = `${currentWidgetRotationSeed()}`;

    for (const userId of userIds) {
      await ctx.scheduler.runAfter(0, internal.pushNotifications.sendSilentToUser, {
        userId,
        source: "cron:hourly_widget_refresh",
        data: {
          type: "widget_refresh",
          seed,
        },
      });
    }
  },
});
