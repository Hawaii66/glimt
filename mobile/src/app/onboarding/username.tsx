import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { useAppColors } from "@/lib/theme";
import { APP_HOME } from "@/lib/routes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default function UsernameScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const username = useOnboardingStore((state) => state.username);
  const setUsername = useOnboardingStore((state) => state.setUsername);
  const displayName = useOnboardingStore((state) => state.displayName);

  const normalizedUsername = username.trim().toLowerCase();
  const hasValidFormat = USERNAME_PATTERN.test(normalizedUsername);

  const isAvailable = useQuery(
    api.users.isUsernameAvailable,
    hasValidFormat ? { username: normalizedUsername } : "skip",
  );

  const validationMessage = useMemo(() => {
    if (!username.trim()) {
      return null;
    }
    if (!hasValidFormat) {
      return "Use 3–20 lowercase letters, numbers, or underscores.";
    }
    if (isAvailable === false) {
      return "Username is already taken.";
    }
    return null;
  }, [username, hasValidFormat, isAvailable]);

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

  if (!displayName.trim()) {
    return <Redirect href="/onboarding/name" />;
  }

  const canContinue =
    hasValidFormat && isAvailable === true && !validationMessage;

  return (
    <OnboardingScreen
      nextDisabled={!canContinue}
      onNext={() => {
        setUsername(normalizedUsername);
        router.push("/onboarding/photo");
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>Username</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="username"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.textMuted,
          },
        ]}
        value={username}
        onChangeText={setUsername}
      />
      {validationMessage ? (
        <Text style={[styles.error, { color: "#ef4444" }]}>
          {validationMessage}
        </Text>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          This is how friends will find you.
        </Text>
      )}
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
  },
});
