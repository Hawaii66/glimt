import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";

import { convex } from "@/lib/convex";
import CreateWidget from "@/lib/widget";

CreateWidget().updateSnapshot({ count: 5 });

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack />
    </ConvexProvider>
  );
}
