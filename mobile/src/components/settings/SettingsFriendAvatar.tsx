import { StyleSheet } from "react-native";

import { UserAvatar } from "@/components/UserAvatar";
import { useAppColors } from "@/lib/theme";

type SettingsFriendAvatarProps = {
  avatarUrl: string;
  displayName: string;
};

export function SettingsFriendAvatar({
  avatarUrl,
  displayName,
}: SettingsFriendAvatarProps) {
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

const styles = StyleSheet.create({
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendAvatarPlaceholder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(128, 128, 128, 0.35)",
  },
});
