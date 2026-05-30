import { ConvexError } from "convex/values";

export function userError(message: string): never {
  throw new ConvexError(message);
}
