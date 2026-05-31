import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SettingsFriendAvatar } from "@/components/settings/SettingsFriendAvatar";
import { appFriendJourney } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

type SettingsFriendsListSectionProps = {
  hasPendingOutgoingRequests: boolean;
};

export function SettingsFriendsListSection({
  hasPendingOutgoingRequests,
}: SettingsFriendsListSectionProps) {
  const colors = useAppColors();
  const router = useRouter();
  const friends = useQuery(api.friends.listFriends);

  return (
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
          {hasPendingOutgoingRequests
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
              <SettingsFriendAvatar
                avatarUrl={friend.avatarUrl}
                displayName={friend.displayName}
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
  emptyFriendsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
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
});
