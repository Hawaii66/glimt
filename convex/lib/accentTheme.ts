import { v } from "convex/values";

export const accentThemeValidator = v.union(
  v.literal("blue"),
  v.literal("pink"),
  v.literal("green"),
  v.literal("purple"),
  v.literal("orange"),
  v.literal("red"),
  v.literal("cyan"),
  v.literal("sunset"),
  v.literal("black"),
  v.literal("white"),
  v.literal("gray"),
  v.literal("polka"),
  v.literal("christmas"),
  v.literal("midnight"),
  v.literal("neon"),
  v.literal("ocean"),
  v.literal("candy"),
  v.literal("sakura"),
  v.literal("coffee"),
  v.literal("rainbow"),
);
