import { ConvexReactClient } from "convex/react";

import { getMobileEnvironment, resolveConvexUrl } from "@/lib/environment";

function getConvexUrl(): string {
  return resolveConvexUrl(getMobileEnvironment()) ?? "";
}

export const convexUrl = getConvexUrl();

export const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;
