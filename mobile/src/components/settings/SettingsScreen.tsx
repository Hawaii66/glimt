import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ACCENT_THEMES,
  type AccentThemeId,
} from "@/lib/accent-themes";
import { MOCK_FRIEND_GLIMTS } from "@/lib/glimt-mock-data";
import { useAppColors } from "@/lib/theme";
import { useAccentThemeStore } from "@/stores/accentThemeStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

export function SettingsScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);
  const accentId = useAccentThemeStore((state) => state.accentId);
  const setAccentId = useAccentThemeStore((state) => state.setAccentId);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [friendUsername, setFriendUsername] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const handleAddFriend = () => {
    const normalized = friendUsername.trim().replace(/^@/, "").toLowerCase();
    if (!normalized) {
      return;
    }
    Alert.alert(
      "Coming soon",
      `Friend requests for @${normalized} will be available in a future update.`,
    );
    setFriendUsername("");
  };

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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Account
        </Text>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.textMuted + "14" },
          ]}
        >
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: colors.textMuted + "30" },
            ]}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.profileAvatarImage}
                contentFit="cover"
              />
            ) : (
              <SymbolView
                name="person.circle.fill"
                size={48}
                tintColor={colors.textMuted}
              />
            )}
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.name?.trim() || "Your name"}
            </Text>
            <Text style={[styles.profileUsername, { color: colors.textMuted }]}>
              {user?.username ? `@${user.username}` : "@username"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Theme
        </Text>
        <View style={styles.themeGrid}>
          {ACCENT_THEMES.map((theme) => {
            const selected = accentId === theme.id;
            return (
              <Pressable
                key={theme.id}
                style={styles.themeOption}
                onPress={() => setAccentId(theme.id as AccentThemeId)}
                accessibilityRole="button"
                accessibilityLabel={`${theme.label} theme`}
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.themePreview,
                    selected && styles.themePreviewSelected,
                  ]}
                >
                  <LinearGradient
                    colors={[...theme.gradientColors]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themePreviewGradient}
                  />
                </View>
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color: selected ? colors.text : colors.textMuted,
                      fontWeight: selected ? "600" : "400",
                    },
                  ]}
                >
                  {theme.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Add friend
        </Text>
        <View style={styles.addFriendRow}>
          <TextInput
            style={[
              styles.friendInput,
              {
                color: colors.text,
                borderColor: colors.textMuted + "40",
                backgroundColor: colors.textMuted + "10",
              },
            ]}
            placeholder="@username"
            placeholderTextColor={colors.textMuted}
            value={friendUsername}
            onChangeText={setFriendUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleAddFriend}
          />
          <Pressable
            style={[styles.addFriendButton, { backgroundColor: colors.text }]}
            onPress={handleAddFriend}
          >
            <Text
              style={[styles.addFriendButtonText, { color: colors.background }]}
            >
              Add
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Friends
        </Text>
        <View style={styles.friendsList}>
          {MOCK_FRIEND_GLIMTS.map((friend) => (
            <View
              key={friend.id}
              style={[
                styles.friendRow,
                { borderBottomColor: colors.textMuted + "25" },
              ]}
            >
              <Image
                source={{ uri: friend.avatarUrl }}
                style={styles.friendAvatar}
                contentFit="cover"
              />
              <View style={styles.friendText}>
                <Text style={[styles.friendName, { color: colors.text }]}>
                  {friend.displayName}
                </Text>
                <Text
                  style={[styles.friendUsername, { color: colors.textMuted }]}
                >
                  @{friend.username}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Text style={styles.signOutText}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const THEME_PREVIEW_SIZE = 52;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
  },
  profileUsername: {
    fontSize: 15,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  themeOption: {
    alignItems: "center",
    gap: 6,
    width: THEME_PREVIEW_SIZE + 8,
  },
  themePreview: {
    width: THEME_PREVIEW_SIZE,
    height: THEME_PREVIEW_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  themePreviewSelected: {
    borderColor: "#111111",
  },
  themePreviewGradient: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 12,
  },
  addFriendRow: {
    flexDirection: "row",
    gap: 10,
  },
  friendInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  addFriendButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addFriendButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  friendsList: {
    borderRadius: 14,
    overflow: "hidden",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendText: {
    flex: 1,
    gap: 2,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
  },
  friendUsername: {
    fontSize: 14,
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
