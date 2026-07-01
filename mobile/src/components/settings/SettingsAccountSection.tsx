import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useOnboardingStore } from "@/stores/onboardingStore";

export function SettingsSignOutButton() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    try {
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
