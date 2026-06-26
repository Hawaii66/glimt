import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { JournalTimezoneSettings } from "@/components/settings/JournalTimezoneSettings";
import { useFriendProfile } from "@/hooks/useFriendProfile";
import {
  DEFAULT_ACCENT_THEME_ID,
  getAccentTheme,
} from "@/lib/accent-themes";
import { getConvexErrorMessage } from "@/lib/convexError";
import { APP_HOME } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type FriendshipSettingsContentProps = {
  friendId: string;
};

export function FriendshipSettingsContent({
  friendId,
}: FriendshipSettingsContentProps) {
  const colors = useAppColors();
  const router = useRouter();
  const { friend, isLoading } = useFriendProfile(friendId);
  const removeFriend = useMutation(api.friends.removeFriend);
  const [removingFriend, setRemovingFriend] = useState(false);
  const gradientColors = getAccentTheme(
    friend?.accentId ?? DEFAULT_ACCENT_THEME_ID,
  ).gradientColors;

  const handleRemoveFriend = useCallback(() => {
    if (!friend || removingFriend) {
      return;
    }

    Alert.alert(
      "Remove friend",
      `Remove ${friend.displayName} from your friends? Your shared journal will be hidden until you become friends again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setRemovingFriend(true);
              try {
                await removeFriend({
                  friendUserId: friendId as Id<"users">,
                });
                router.replace(APP_HOME);
              } catch (error) {
                Alert.alert(
                  "Could not remove friend",
                  getConvexErrorMessage(
                    error,
                    "Could not remove this friend.",
                  ),
                );
              } finally {
                setRemovingFriend(false);
              }
            })();
          },
        },
      ],
    );
  }, [friend, friendId, removeFriend, removingFriend, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (!friend) {
    return (
      <View style={styles.notFound}>
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>
          Friend not found
        </Text>
        <Text style={[styles.notFoundBody, { color: colors.textMuted }]}>
          This friend could not be found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileSection}
      >
        <ProfilePreview
          embedded
          onGradientBackground
          profile={{
            displayName: friend.displayName,
            username: friend.username,
            avatarUri: friend.avatarUrl,
          }}
        />
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Timezones
        </Text>
        <View style={styles.sectionContent}>
          <JournalTimezoneSettings friendUserId={friendId} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Friendship
        </Text>
        <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
          Removing a friend hides your shared journal. If you become friends
          again later, your history will come back.
        </Text>
        <Pressable
          style={[
            styles.removeButton,
            { opacity: removingFriend ? 0.6 : 1 },
          ]}
          onPress={handleRemoveFriend}
          disabled={removingFriend}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${friend.displayName} as a friend`}
        >
          {removingFriend ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text style={styles.removeButtonText}>Remove friend</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  notFoundBody: {
    fontSize: 15,
    textAlign: "center",
  },
  profileSection: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 16,
    paddingHorizontal: 12,
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
  sectionContent: {
    paddingLeft: 16,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  removeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  removeButtonText: {
    color: "#ef4444",
    fontSize: 17,
    fontWeight: "600",
  },
});
