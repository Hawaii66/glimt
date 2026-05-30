import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { FriendRequestNotification } from "@/components/FriendRequestNotification";
import { Toast } from "@/components/Toast";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

export default function AppLayout() {
  const colors = useAppColors();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current);

  if (authLoading || (isAuthenticated && user === undefined)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding/sign-in" />;
  }

  if (!user?.onboardingComplete) {
    return <Redirect href="/onboarding/setup" />;
  }

  return (
    <View style={styles.appRoot}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen name="capture" />
        <Stack.Screen name="compose" />
        <Stack.Screen name="settings" />
        <Stack.Screen
          name="friend/[friendId]/index"
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="friend/[friendId]/day/[date]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="friend/[friendId]/unlock/[date]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <Toast />
      <FriendRequestNotification />
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
