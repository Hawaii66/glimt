import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";

import { convex } from "@/lib/convex";

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack />
    </ConvexProvider>
  );
}
