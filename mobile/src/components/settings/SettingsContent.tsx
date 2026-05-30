import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { UserAvatar } from "@/components/UserAvatar";
import { AccentThemePicker } from "@/components/settings/AccentThemePicker";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { getAccentTheme } from "@/lib/accent-themes";
import { getConvexErrorMessage } from "@/lib/convexError";
import { appFriendJourney } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useSettingsFocusStore } from "@/stores/settingsFocusStore";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type SettingsContentProps = {
  scrollMaxHeight?: number;
};

function FriendAvatar({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string;
  displayName: string;
}) {
  const colors = useAppColors();

  return (
    <UserAvatar
      imageUri={avatarUrl || null}
      displayName={displayName}
      size={44}
      style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}
      backgroundColor={colors.fill}
      borderColor="rgba(128, 128, 128, 0.35)"
      borderWidth={StyleSheet.hairlineWidth}
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
  const outgoingRequests = useQuery(api.friends.listOutgoingRequests);
  const sendFriendRequest = useMutation(api.friends.sendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptRequest);
  const declineFriendRequest = useMutation(api.friends.declineRequest);
  const { accentTheme, setAccentTheme } = useCurrentUserAccentTheme();
  const gradientColors = getAccentTheme(accentTheme).gradientColors;
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const settingsFocus = useSettingsFocusStore((state) => state.focus);
  const clearSettingsFocus = useSettingsFocusStore((state) => state.clearFocus);
  const [friendUsername, setFriendUsername] = useState("@");
  const [signingOut, setSigningOut] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [respondingRequestId, setRespondingRequestId] =
    useState<Id<"friendRequests"> | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const addFriendSectionY = useRef(0);
  const friendRequestsSectionY = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToAddFriend = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, addFriendSectionY.current - 16),
        animated: true,
      });
    });
  };

  const scrollToFriendRequests = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, friendRequestsSectionY.current - 16),
        animated: true,
      });
    });
  };

  useEffect(() => {
    if (settingsFocus !== "friend-requests") {
      return;
    }

    if (incomingRequests === undefined) {
      return;
    }

    if (incomingRequests.length === 0) {
      clearSettingsFocus();
      return;
    }

    const attemptScroll = () => {
      if (friendRequestsSectionY.current > 0) {
        scrollToFriendRequests();
        clearSettingsFocus();
        return true;
      }
      return false;
    };

    if (attemptScroll()) {
      return;
    }

    const timer = setTimeout(() => {
      attemptScroll();
      clearSettingsFocus();
    }, 150);

    return () => clearTimeout(timer);
  }, [settingsFocus, incomingRequests, clearSettingsFocus]);

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
      Alert.alert(
        "Could not add friend",
        getConvexErrorMessage(addError, "Could not send friend request."),
      );
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
      Alert.alert(
        "Friend added",
        `${request.displayName} is now on your list.`,
      );
    } catch (acceptError) {
      Alert.alert(
        "Could not accept",
        getConvexErrorMessage(acceptError, "Could not accept friend request."),
      );
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
      Alert.alert(
        "Could not decline",
        getConvexErrorMessage(
          declineError,
          "Could not decline friend request.",
        ),
      );
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
    <KeyboardAvoidingView
      style={[
        styles.keyboardAvoid,
        scrollMaxHeight != null && { maxHeight: scrollMaxHeight },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          scrollMaxHeight == null && styles.scrollContentGrow,
          { paddingBottom: 32 + keyboardHeight },
        ]}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
          <AccentThemePicker
            selectedId={accentTheme}
            onSelect={setAccentTheme}
          />
        </View>

        <View
          style={styles.section}
          onLayout={(event) => {
            addFriendSectionY.current = event.nativeEvent.layout.y;
          }}
        >
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
              onFocus={scrollToAddFriend}
            />
            <Pressable
              style={[
                styles.addFriendButton,
                {
                  backgroundColor: colors.text,
                  opacity: addingFriend ? 0.6 : 1,
                },
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
          <View
            style={styles.section}
            onLayout={(event) => {
              friendRequestsSectionY.current = event.nativeEvent.layout.y;
            }}
          >
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
                const isResponding = respondingRequestId === request.requestId;
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
                    <FriendAvatar
                      avatarUrl={request.avatarUrl}
                      displayName={request.displayName}
                    />
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

        {outgoingRequests !== undefined && outgoingRequests.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              Pending approval
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
              {outgoingRequests.map((request, index) => (
                <View
                  key={request.requestId}
                  style={[
                    styles.friendRow,
                    index < outgoingRequests.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.surfaceBorder,
                    },
                  ]}
                >
                  <FriendAvatar
                    avatarUrl={request.avatarUrl}
                    displayName={request.displayName}
                  />
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
                  <Text
                    style={[styles.pendingLabel, { color: colors.textMuted }]}
                  >
                    Pending
                  </Text>
                </View>
              ))}
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
            <Text
              style={[styles.emptyFriendsText, { color: colors.textMuted }]}
            >
              {outgoingRequests && outgoingRequests.length > 0
                ? "No friends yet. Waiting on pending requests above."
                : "No friends yet. Add someone by username above."}
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
                  <FriendAvatar
                    avatarUrl={friend.avatarUrl}
                    displayName={friend.displayName}
                  />
                  <View style={styles.friendText}>
                    <Text style={[styles.friendName, { color: colors.text }]}>
                      {friend.displayName}
                    </Text>
                    <Text
                      style={[
                        styles.friendUsername,
                        { color: colors.textMuted },
                      ]}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 24,
  },
  scrollContentGrow: {
    flexGrow: 1,
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
  pendingLabel: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 0,
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
