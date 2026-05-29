import { v } from "convex/values";
import * as oauth from "oauth4webapi";

import { internalMutation, mutation } from "../../_generated/server";

export const initSignIn = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Init nonce");
    const nonce = oauth.generateRandomNonce();
    const verifierId = await ctx.db.insert("authVerifiers", {
      nonce,
      expirationTime: Date.now() + 1000 * 60 * 5,
    });
    return { verifierId, nonce };
  },
});

export const consumeVerifier = internalMutation({
  args: {
    verifierId: v.id("authVerifiers"),
  },
  handler: async (ctx, args) => {
    const verifier = await ctx.db.get(args.verifierId);
    if (!verifier) {
      throw new Error("Verifier not found");
    }

    await ctx.db.delete(args.verifierId);

    if (
      typeof verifier.nonce !== "string" ||
      typeof verifier.expirationTime !== "number"
    ) {
      throw new Error("Invalid verifier");
    }

    if (verifier.expirationTime < Date.now()) {
      throw new Error("Verifier expired");
    }

    return verifier.nonce;
  },
});
