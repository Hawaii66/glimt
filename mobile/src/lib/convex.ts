import Constants from "expo-constants";
import { ConvexReactClient } from "convex/react";

import { getMobileEnvironment, resolveConvexUrl } from "@/lib/environment";

function getConvexUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.convexUrl;
  if (typeof fromExtra === "string" && fromExtra.length > 0) {
    return fromExtra;
  }

  return resolveConvexUrl(getMobileEnvironment()) ?? "";
}

export const convexUrl = getConvexUrl();

export const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;
