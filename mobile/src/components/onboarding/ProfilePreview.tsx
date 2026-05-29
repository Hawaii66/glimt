import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

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
};

export function ProfilePreview({ profile, embedded = false }: ProfilePreviewProps) {
  const colors = useAppColors();
  const storeDisplayName = useOnboardingStore((state) => state.displayName);
  const storeUsername = useOnboardingStore((state) => state.username);
  const storeAvatarUri = useOnboardingStore((state) => state.localAvatarUri);

  const displayName = profile?.displayName ?? storeDisplayName;
  const username = profile?.username ?? storeUsername;
  const avatarUri = profile?.avatarUri ?? storeAvatarUri;

  const showUsername = (username ?? "").trim().length > 0;
  const showName = (displayName ?? "").trim().length > 0;

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      <View
        style={[
          styles.avatar,
          embedded && styles.avatarEmbedded,
          {
            backgroundColor: colors.fill,
            borderColor: colors.surfaceBorder,
          },
        ]}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : null}
      </View>

      <Text style={[styles.username, { color: colors.textMuted }]}>
        {showUsername
          ? `@${username!.trim().toLowerCase()}`
          : "@username"}
      </Text>

      <Text style={[styles.displayName, { color: colors.text }]}>
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
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  avatarEmbedded: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 4,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  username: {
    fontSize: 15,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700",
  },
});
