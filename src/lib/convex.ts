import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL. Copy .env.example to .env.local and run `npx convex dev` (or `eas integrations:convex:connect`).",
  );
}

export const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});
