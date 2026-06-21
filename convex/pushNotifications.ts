import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type ExpoPushTicket = {
  status?: string;
  details?: {
    error?: string;
  };
};

type ExpoPushResponse = {
  data?: ExpoPushTicket | ExpoPushTicket[];
};

export const sendToUser = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, { userId, title, body, data }) => {
    const tokens = await ctx.runQuery(internal.pushTokens.listForUser, {
      userId,
    });

    if (tokens.length === 0) {
      return;
    }

    const messages = tokens.map(({ token }) => ({
      to: token,
      title,
      body,
      data,
      sound: "default" as const,
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      console.error("Expo push request failed:", await response.text());
      return;
    }

    const result = (await response.json()) as ExpoPushResponse;
    const tickets = Array.isArray(result.data)
      ? result.data
      : result.data
        ? [result.data]
        : [];

    for (let index = 0; index < tickets.length; index++) {
      const ticket = tickets[index];
      if (
        ticket?.status === "error" &&
        ticket.details?.error === "DeviceNotRegistered"
      ) {
        await ctx.runMutation(internal.pushTokens.removeByToken, {
          token: tokens[index]!.token,
        });
      }
    }
  },
});
