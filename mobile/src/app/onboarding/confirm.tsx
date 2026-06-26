import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { uploadAvatarToStorage } from "@/lib/uploadAvatar";
import { useAppColors } from "@/lib/theme";
import { APP_HOME } from "@/lib/routes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

export default function ConfirmScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const displayName = useOnboardingStore((state) => state.displayName);
  const username = useOnboardingStore((state) => state.username);
  const localAvatarUri = useOnboardingStore((state) => state.localAvatarUri);
  const accentTheme = useOnboardingStore((state) => state.accentTheme);
  const reset = useOnboardingStore((state) => state.reset);
  const generateAvatarUploadUrl = useMutation(
    api.users.generateAvatarUploadUrl,
  );
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setError(null);
    setLoading(true);

    try {
      let avatarStorageId: Awaited<
        ReturnType<typeof uploadAvatarToStorage>
      > | undefined;

      if (localAvatarUri) {
        avatarStorageId = await uploadAvatarToStorage({
          localUri: localAvatarUri,
          generateUploadUrl: () => generateAvatarUploadUrl(),
        });
      }

      await completeOnboarding({
        name: displayName.trim(),
        username: username.trim(),
        avatarStorageId,
        accentTheme,
      });

      reset();
      router.replace(APP_HOME);
    } catch (completeError) {
      const message =
        completeError instanceof Error
          ? completeError.message
          : "Could not complete onboarding.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

  if (user === null) {
    return <Redirect href="/onboarding/sign-in" />;
  }

  if (user?.onboardingComplete) {
    return <Redirect href={APP_HOME} />;
  }

  if (!displayName.trim()) {
    return <Redirect href="/onboarding/setup" />;
  }

  if (!username.trim()) {
    return <Redirect href="/onboarding/username" />;
  }

  return (
    <OnboardingScreen
      actionLabel="Get started"
      loading={loading}
      onNext={() => {
        void handleComplete();
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        Confirm your profile
      </Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Everything looks good? You can always change this later.
      </Text>
      {error ? (
        <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
  },
});
