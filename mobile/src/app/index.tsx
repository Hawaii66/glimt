import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppleSignInButton } from "@/components/AppleSignInButton";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

export default function HomeScreen() {
  const colors = useAppColors();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Glimt</Text>

      {isLoading ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Checking session...
        </Text>
      ) : isAuthenticated ? (
        <>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Signed in{user?.name ? ` as ${user.name}` : user?.email ? ` as ${user.email}` : ""}.
          </Text>
          <Pressable
            style={[styles.signOutButton, { borderColor: colors.textMuted }]}
            onPress={() => {
              void signOut();
            }}
          >
            <Text style={[styles.signOutText, { color: colors.text }]}>
              Sign out
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Sign in to start sharing glimts.
          </Text>
          <AppleSignInButton onError={setError} />
          {error ? (
            <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 320,
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
