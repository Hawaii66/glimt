import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    AUTH_APPLE_ID: v.string(),
    AUTH_APPLE_PK8: v.string(),
    AUTH_APPLE_KID: v.string(),
    AUTH_APPLE_TEAM_ID: v.string(),
    AUTH_APPLE_BUNDLE_ID: v.string(),
    AUTH_APPLE_EXPIRATION: v.string(),
    AUTH_APPLE_AUDIENCE: v.string(),
    JWKS: v.string(),
    JWT_PRIVATE_KEY: v.string(),
  },
});

export default app;
