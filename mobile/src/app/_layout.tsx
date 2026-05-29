import "react-native-gesture-handler";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { authStorage } from "@/lib/auth-storage";
import { convex } from "@/lib/convex";
import { useAppColors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function refreshFriendGlimtWidget() {
  if (Platform.OS !== "ios") return;

  void import("@/lib/widget")
    .then((module) => {
      module.default.updateSnapshot({ count: 5 });
    })
    .catch((error) => {
      console.warn("[FriendGlimt] widget update failed:", error);
    });
}

export default function RootLayout() {
  const colors = useAppColors();

  useEffect(() => {
    void SplashScreen.hideAsync();
    refreshFriendGlimtWidget();
  }, []);

  if (!convex) {
    return (
      <View style={styles.missingConfig}>
        <Text style={styles.missingTitle}>Convex not configured</Text>
        <Text style={styles.missingBody}>
          Set EXPO_PUBLIC_CONVEX_URL_DEV (or _STAGE / _PROD) in .env.*.local or EAS.
        </Text>
      </View>
    );
  }

  return (
    <ConvexAuthProvider client={convex} storage={authStorage}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </ConvexAuthProvider>
  );
}

const styles = StyleSheet.create({
  missingConfig: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  missingBody: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
});
