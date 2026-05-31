import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Doc, Id } from "../_generated/dataModel";
import { userError } from "./userError";

type AuthCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export async function requireAuthUserId(ctx: AuthCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export async function requireExistingUser(
  ctx: AuthCtx,
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const userId = await requireAuthUserId(ctx);
  const user = await ctx.db.get(userId);
  if (!user) {
    userError("Account not found. Please sign out and sign in again.");
  }
  return { userId, user: user as Doc<"users"> };
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string) {
  const normalized = normalizeUsername(username);
  if (!USERNAME_PATTERN.test(normalized)) {
    userError(
      "Username must be 3–20 characters and contain only lowercase letters, numbers, and underscores.",
    );
  }
  return normalized;
}
