import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAppColors } from "@/lib/theme";
import { APP_HOME } from "@/lib/routes";
import { api } from "convex/_generated/api";

export default function Index() {
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

  return <Redirect href={APP_HOME} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
