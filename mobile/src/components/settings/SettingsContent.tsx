import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import {
  ACCENT_THEMES,
  getAccentTheme,
  type AccentThemeId,
} from "@/lib/accent-themes";
import { appFriendJourney } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useAccentThemeStore } from "@/stores/accentThemeStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type SettingsContentProps = {
  scrollMaxHeight?: number;
};

function FriendAvatar({ avatarUrl }: { avatarUrl: string }) {
  const colors = useAppColors();

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={styles.friendAvatar}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.friendAvatar,
        styles.friendAvatarPlaceholder,
        { backgroundColor: colors.fill },
      ]}
    />
  );
}

export function SettingsContent({ scrollMaxHeight }: SettingsContentProps) {
  const colors = useAppColors();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);
  const friends = useQuery(api.friends.listFriends);
  const incomingRequests = useQuery(api.friends.listIncomingRequests);
  const sendFriendRequest = useMutation(api.friends.sendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptRequest);
  const declineFriendRequest = useMutation(api.friends.declineRequest);
  const accentId = useAccentThemeStore((state) => state.accentId);
  const setAccentId = useAccentThemeStore((state) => state.setAccentId);
  const gradientColors = getAccentTheme(accentId).gradientColors;
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [friendUsername, setFriendUsername] = useState("@");
  const [signingOut, setSigningOut] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [respondingRequestId, setRespondingRequestId] =
    useState<Id<"friendRequests"> | null>(null);

  const handleFriendUsernameChange = (text: string) => {
    const withoutAt = text.replace(/^@+/, "");
    setFriendUsername(`@${withoutAt}`);
  };

  const handleAddFriend = async () => {
    const normalized = friendUsername.trim().replace(/^@/, "").toLowerCase();
    if (!normalized || addingFriend) {
      return;
    }

    setAddingFriend(true);
    try {
      await sendFriendRequest({ username: normalized });
      setFriendUsername("@");
      Alert.alert(
        "Request sent",
        `Your friend request to @${normalized} was sent.`,
      );
    } catch (addError) {
      const message =
        addError instanceof Error
          ? addError.message
          : "Could not send friend request.";
      Alert.alert("Could not add friend", message);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleAcceptRequest = async (request: {
    requestId: Id<"friendRequests">;
    displayName: string;
  }) => {
    if (respondingRequestId) {
      return;
    }

    setRespondingRequestId(request.requestId);
    try {
      await acceptFriendRequest({ requestId: request.requestId });
      Alert.alert("Friend added", `${request.displayName} is now on your list.`);
    } catch (acceptError) {
      const message =
        acceptError instanceof Error
          ? acceptError.message
          : "Could not accept friend request.";
      Alert.alert("Could not accept", message);
    } finally {
      setRespondingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId: Id<"friendRequests">) => {
    if (respondingRequestId) {
      return;
    }

    setRespondingRequestId(requestId);
    try {
      await declineFriendRequest({ requestId });
    } catch (declineError) {
      const message =
        declineError instanceof Error
          ? declineError.message
          : "Could not decline friend request.";
      Alert.alert("Could not decline", message);
    } finally {
      setRespondingRequestId(null);
    }
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
      style={[styles.scroll, scrollMaxHeight != null && { maxHeight: scrollMaxHeight }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>

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
                    {
                      borderColor: selected
                        ? colors.text
                        : colors.surfaceBorder,
                    },
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
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.fill,
              },
            ]}
            placeholder="username"
            placeholderTextColor={colors.textMuted}
            value={friendUsername}
            onChangeText={handleFriendUsernameChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleAddFriend}
          />
          <Pressable
            style={[
              styles.addFriendButton,
              { backgroundColor: colors.text, opacity: addingFriend ? 0.6 : 1 },
            ]}
            onPress={handleAddFriend}
            disabled={addingFriend}
          >
            {addingFriend ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text
                style={[
                  styles.addFriendButtonText,
                  { color: colors.background },
                ]}
              >
                Add
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {incomingRequests === undefined ? (
        <View style={styles.sectionLoading}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : incomingRequests.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Friend requests
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            {incomingRequests.map((request, index) => {
              const isResponding =
                respondingRequestId === request.requestId;
              return (
                <View
                  key={request.requestId}
                  style={[
                    styles.requestRow,
                    index < incomingRequests.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.surfaceBorder,
                    },
                  ]}
                >
                  <FriendAvatar avatarUrl={request.avatarUrl} />
                  <View style={styles.friendText}>
                    <Text style={[styles.friendName, { color: colors.text }]}>
                      {request.displayName}
                    </Text>
                    <Text
                      style={[
                        styles.friendUsername,
                        { color: colors.textMuted },
                      ]}
                    >
                      @{request.username}
                    </Text>
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      style={[
                        styles.declineButton,
                        {
                          borderColor: colors.surfaceBorder,
                          opacity: isResponding ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleDeclineRequest(request.requestId)}
                      disabled={respondingRequestId !== null}
                    >
                      <Text
                        style={[
                          styles.declineButtonText,
                          { color: colors.textMuted },
                        ]}
                      >
                        Decline
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.acceptButton,
                        {
                          backgroundColor: colors.text,
                          opacity: isResponding ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleAcceptRequest(request)}
                      disabled={respondingRequestId !== null}
                    >
                      <Text
                        style={[
                          styles.acceptButtonText,
                          { color: colors.background },
                        ]}
                      >
                        Accept
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Friends
        </Text>
        {friends === undefined ? (
          <View style={styles.sectionLoading}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : friends.length === 0 ? (
          <Text style={[styles.emptyFriendsText, { color: colors.textMuted }]}>
            No friends yet. Add someone by username above.
          </Text>
        ) : (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            {friends.map((friend, index) => (
              <Pressable
                key={friend.id}
                onPress={() => router.push(appFriendJourney(friend.id))}
                style={({ pressed }) => [
                  styles.friendRow,
                  index < friends.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.surfaceBorder,
                  },
                  pressed && styles.friendRowPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Open journey with ${friend.displayName}`}
              >
                <FriendAvatar avatarUrl={friend.avatarUrl} />
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
                <Text
                  style={[styles.friendChevron, { color: colors.textMuted }]}
                >
                  ›
                </Text>
              </Pressable>
            ))}
          </View>
        )}
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
  accountSection: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  section: {
    gap: 12,
  },
  sectionLoading: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyFriendsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  friendRowPressed: {
    opacity: 0.7,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendAvatarPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(128, 128, 128, 0.35)",
  },
  friendText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
  },
  friendUsername: {
    fontSize: 14,
  },
  friendChevron: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
  },
  declineButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: "600",
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
