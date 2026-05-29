import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { useAppColors } from "@/lib/theme";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

export default function HomeScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const reset = useOnboardingStore((state) => state.reset);
  const user = useQuery(api.users.current);

  const handleSignOut = () => {
    reset();
    void signOut().then(() => {
      router.replace("/onboarding/sign-in");
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.preview}>
        <ProfilePreview
          profile={{
            displayName: user?.name,
            username: user?.username,
            avatarUri: user?.avatarUrl,
          }}
        />
      </View>

      <Pressable
        style={[styles.signOutButton, { borderColor: colors.textMuted }]}
        onPress={handleSignOut}
      >
        <Text style={[styles.signOutText, { color: colors.text }]}>
          Sign out
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  preview: {
    flex: 1,
    minHeight: 280,
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
