import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { APP_HOME } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

export default function SetupScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const seedFromUser = useOnboardingStore((state) => state.seedFromUser);

  useEffect(() => {
    if (user) {
      seedFromUser(user);
    }
  }, [user, seedFromUser]);

  if (authLoading || (isAuthenticated && user === undefined)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding/sign-in" />;
  }

  if (user?.onboardingComplete) {
    return <Redirect href={APP_HOME} />;
  }

  return (
    <OnboardingScreen
      actionLabel="Start"
      onNext={() => {
        router.push("/onboarding/name");
      }}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Let's set up your account
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        Add a name, username, and photo so friends know it's you.
      </Text>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
});
