import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Doc } from "../_generated/dataModel";
import { validateUsername } from "./auth";
import { userError } from "./userError";

type UserCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export async function getUserByUsername(
  ctx: UserCtx,
  username: string,
): Promise<Doc<"users">> {
  const normalized = validateUsername(username);
  const user = await ctx.db
    .query("users")
    .withIndex("username", (q) => q.eq("username", normalized))
    .unique();

  if (!user) {
    userError("User not found.");
  }

  return user;
}
