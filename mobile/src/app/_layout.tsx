import "react-native-gesture-handler";

import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import  Widget from "@/lib/widget";

import { convex } from "@/lib/convex";
import { type AppColors, useAppColors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});
Widget.updateSnapshot({ count: Math.random() });

export default function RootLayout() {
  const colors = useAppColors();

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <ConvexProvider client={convex}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
});
