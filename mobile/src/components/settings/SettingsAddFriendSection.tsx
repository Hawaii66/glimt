import { useMutation } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getConvexErrorMessage } from "@/lib/convexError";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

type SettingsAddFriendSectionProps = {
  onLayout: (event: LayoutChangeEvent) => void;
  onInputFocus: () => void;
};

export function SettingsAddFriendSection({
  onLayout,
  onInputFocus,
}: SettingsAddFriendSectionProps) {
  const colors = useAppColors();
  const sendFriendRequest = useMutation(api.friends.sendRequest);
  const [friendUsername, setFriendUsername] = useState("@");
  const [addingFriend, setAddingFriend] = useState(false);

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
    } catch (addError) {
      Alert.alert(
        "Could not add friend",
        getConvexErrorMessage(addError, "Could not send friend request."),
      );
    } finally {
      setAddingFriend(false);
    }
  };

  return (
    <View style={styles.section} onLayout={onLayout}>
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
          onFocus={onInputFocus}
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
              style={[styles.addFriendButtonText, { color: colors.background }]}
            >
              Add
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
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
});
