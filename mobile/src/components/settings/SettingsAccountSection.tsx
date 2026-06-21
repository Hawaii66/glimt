import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { getAccentTheme } from "@/lib/accent-themes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { usePushTokenStore } from "@/stores/pushTokenStore";
import { api } from "convex/_generated/api";

export function SettingsAccountProfile() {
  const user = useQuery(api.users.current);
  const { accentTheme } = useCurrentUserAccentTheme();
  const gradientColors = getAccentTheme(accentTheme).gradientColors;

  return (
    <LinearGradient
      colors={[...gradientColors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.accountSection}
    >
      <ProfilePreview
        embedded
        onGradientBackground
        profile={{
          displayName: user?.name,
          username: user?.username,
          avatarUri: user?.avatarUrl,
        }}
      />
    </LinearGradient>
  );
}

export function SettingsSignOutButton() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const unregisterPushToken = useMutation(api.pushTokens.unregisterPushToken);
  const pushToken = usePushTokenStore((state) => state.token);
  const setPushToken = usePushTokenStore((state) => state.setToken);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }
    setSigningOut(true);
    try {
      if (pushToken) {
        await unregisterPushToken({ token: pushToken }).catch(() => {});
        setPushToken(null);
      }
      await signOut();
      resetOnboarding();
      router.replace("/onboarding/sign-in");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Pressable
      style={styles.signOutButton}
      onPress={handleSignOut}
      disabled={signingOut}
    >
      <Text style={styles.signOutText}>
        {signingOut ? "Signing out…" : "Sign out"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accountSection: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  signOutButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 17,
    fontWeight: "600",
  },
});
