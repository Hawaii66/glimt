import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
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

type PushLogContext = {
  kind: "silent" | "alert";
  toUserId: Id<"users">;
  fromUserId?: Id<"users">;
  source?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
  tokenCount: number;
};

function logPushNotification(context: PushLogContext) {
  const from = context.fromUserId ?? context.source ?? "system";
  console.log("[push]", {
    kind: context.kind,
    from,
    to: context.toUserId,
    title: context.title,
    body: context.body,
    data: context.data,
    tokenCount: context.tokenCount,
  });
}

function logPushSkipped(
  kind: PushLogContext["kind"],
  toUserId: Id<"users">,
  fromUserId: Id<"users"> | undefined,
  source: string | undefined,
  data?: Record<string, string>,
) {
  const from = fromUserId ?? source ?? "system";
  console.log("[push] skipped (no tokens)", {
    kind,
    from,
    to: toUserId,
    data,
  });
}

export const sendSilentToUser = internalAction({
  args: {
    userId: v.id("users"),
    fromUserId: v.optional(v.id("users")),
    source: v.optional(v.string()),
    data: v.record(v.string(), v.string()),
  },
  handler: async (ctx, { userId, fromUserId, source, data }) => {
    const tokens = await ctx.runQuery(internal.pushTokens.listForUser, {
      userId,
    });

    if (tokens.length === 0) {
      logPushSkipped("silent", userId, fromUserId, source, data);
      return;
    }

    logPushNotification({
      kind: "silent",
      toUserId: userId,
      fromUserId,
      source,
      data,
      tokenCount: tokens.length,
    });

    const messages = tokens.map(({ token }) => ({
      to: token,
      data,
      priority: "high" as const,
      _contentAvailable: true,
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
      console.error("Expo silent push request failed:", await response.text());
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

export const sendToUser = internalAction({
  args: {
    userId: v.id("users"),
    fromUserId: v.optional(v.id("users")),
    source: v.optional(v.string()),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, { userId, fromUserId, source, title, body, data }) => {
    const tokens = await ctx.runQuery(internal.pushTokens.listForUser, {
      userId,
    });

    if (tokens.length === 0) {
      logPushSkipped("alert", userId, fromUserId, source, data);
      return;
    }

    logPushNotification({
      kind: "alert",
      toUserId: userId,
      fromUserId,
      source,
      title,
      body,
      data,
      tokenCount: tokens.length,
    });

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
