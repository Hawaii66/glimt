import { v } from "convex/values";

export const accentThemeValidator = v.union(
  v.literal("orange"),
  v.literal("blue"),
  v.literal("green"),
  v.literal("purple"),
  v.literal("pink"),
  v.literal("teal"),
);
