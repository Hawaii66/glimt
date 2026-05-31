import { useMutation } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SettingsFriendAvatar } from "@/components/settings/SettingsFriendAvatar";
import { getConvexErrorMessage } from "@/lib/convexError";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type FriendRequest = {
  requestId: Id<"friendRequests">;
  avatarUrl: string;
  displayName: string;
  username: string;
};

type SettingsFriendRequestsSectionProps = {
  incomingRequests: FriendRequest[] | undefined;
  outgoingRequests: FriendRequest[] | undefined;
  onIncomingSectionLayout: (event: LayoutChangeEvent) => void;
};

export function SettingsFriendRequestsSection({
  incomingRequests,
  outgoingRequests,
  onIncomingSectionLayout,
}: SettingsFriendRequestsSectionProps) {
  const colors = useAppColors();
  const acceptFriendRequest = useMutation(api.friends.acceptRequest);
  const declineFriendRequest = useMutation(api.friends.declineRequest);
  const cancelFriendRequest = useMutation(api.friends.cancelRequest);
  const [respondingRequestId, setRespondingRequestId] =
    useState<Id<"friendRequests"> | null>(null);
  const [cancellingRequestId, setCancellingRequestId] =
    useState<Id<"friendRequests"> | null>(null);

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

  const handleCancelRequest = async (requestId: Id<"friendRequests">) => {
    if (cancellingRequestId) {
      return;
    }

    setCancellingRequestId(requestId);
    try {
      await cancelFriendRequest({ requestId });
    } catch (cancelError) {
      Alert.alert(
        "Could not cancel",
        getConvexErrorMessage(cancelError, "Could not cancel friend request."),
      );
    } finally {
      setCancellingRequestId(null);
    }
  };

  return (
    <>
      {incomingRequests === undefined ? (
        <View style={styles.sectionLoading}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : incomingRequests.length > 0 ? (
        <View style={styles.section} onLayout={onIncomingSectionLayout}>
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
                  <SettingsFriendAvatar
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
            {outgoingRequests.map((request, index) => {
              const isCancelling = cancellingRequestId === request.requestId;
              return (
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
                  <SettingsFriendAvatar
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
                  <Pressable
                    style={[
                      styles.cancelButton,
                      {
                        borderColor: colors.surfaceBorder,
                        opacity: isCancelling ? 0.6 : 1,
                      },
                    ]}
                    onPress={() => handleCancelRequest(request.requestId)}
                    disabled={cancellingRequestId !== null}
                  >
                    {isCancelling ? (
                      <ActivityIndicator color={colors.textMuted} size="small" />
                    ) : (
                      <Text
                        style={[
                          styles.cancelButtonText,
                          { color: colors.textMuted },
                        ]}
                      >
                        Cancel
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionLoading: {
    alignItems: "center",
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
