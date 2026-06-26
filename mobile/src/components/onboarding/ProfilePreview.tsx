import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UserAvatar } from "@/components/UserAvatar";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAppColors } from "@/lib/theme";

export type ProfilePreviewData = {
  displayName?: string | null;
  username?: string | null;
  avatarUri?: string | null;
};

type ProfilePreviewProps = {
  profile?: ProfilePreviewData;
  /** Compact layout for sheets and embedded contexts (no flex growth). */
  embedded?: boolean;
  /** Light text and borders for accent gradient backgrounds. */
  onGradientBackground?: boolean;
  onAvatarPress?: () => void;
  showEditIcon?: boolean;
};

export function ProfilePreview({
  profile,
  embedded = false,
  onGradientBackground = false,
  onAvatarPress,
  showEditIcon = false,
}: ProfilePreviewProps) {
  const colors = useAppColors();
  const storeDisplayName = useOnboardingStore((state) => state.displayName);
  const storeUsername = useOnboardingStore((state) => state.username);
  const storeAvatarUri = useOnboardingStore((state) => state.localAvatarUri);

  const displayName = profile?.displayName ?? storeDisplayName;
  const username = profile?.username ?? storeUsername;
  const avatarUri = profile?.avatarUri ?? storeAvatarUri;

  const showUsername = (username ?? "").trim().length > 0;
  const showName = (displayName ?? "").trim().length > 0;

  const usernameColor = onGradientBackground
    ? "rgba(255, 255, 255, 0.85)"
    : colors.textMuted;
  const displayNameColor = onGradientBackground ? "#FFFFFF" : colors.text;
  const avatarBackground = onGradientBackground
    ? "rgba(255, 255, 255, 0.25)"
    : colors.fill;
  const avatarBorder = onGradientBackground ? "#FFFFFF" : colors.surfaceBorder;
  const avatarInitialsColor = onGradientBackground ? "#FFFFFF" : colors.textMuted;
  const avatarSize = embedded ? 88 : 96;
  const editIconVisible = showEditIcon && onAvatarPress != null;

  const avatarMarginBottom = embedded ? 4 : 8;

  const avatar = (
    <UserAvatar
      imageUri={avatarUri}
      displayName={displayName?.trim() ?? ""}
      size={avatarSize}
      style={onAvatarPress ? undefined : { marginBottom: avatarMarginBottom }}
      backgroundColor={avatarBackground}
      borderColor={avatarBorder}
      borderWidth={1}
      initialsColor={avatarInitialsColor}
    />
  );

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {onAvatarPress ? (
        <Pressable
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={[
            styles.avatarPressable,
            { marginBottom: avatarMarginBottom },
          ]}
        >
          {avatar}
          {editIconVisible ? (
            <View
              style={[
                styles.editBadge,
                { bottom: embedded ? 2 : 6 },
              ]}
            >
              <SymbolView
                name="pencil"
                size={12}
                tintColor="#FFFFFF"
                weight="semibold"
              />
            </View>
          ) : null}
        </Pressable>
      ) : (
        avatar
      )}

      <Text style={[styles.username, { color: usernameColor }]}>
        {showUsername
          ? `@${username!.trim().toLowerCase()}`
          : "@username"}
      </Text>

      <Text style={[styles.displayName, { color: displayNameColor }]}>
        {showName ? displayName!.trim() : "Your name"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  containerEmbedded: {
    flex: 0,
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  avatarPressable: {
    position: "relative",
  },
  editBadge: {
    position: "absolute",
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  username: {
    fontSize: 15,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700",
  },
});
