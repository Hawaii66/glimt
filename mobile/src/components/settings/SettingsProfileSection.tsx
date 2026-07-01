import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { DEFAULT_ACCENT_THEME_ID, getAccentTheme } from "@/lib/accent-themes";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

export function SettingsProfileSection() {
  const colors = useAppColors();
  const user = useQuery(api.users.current);
  const gradientColors = getAccentTheme(DEFAULT_ACCENT_THEME_ID).gradientColors;

  if (user === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  accountSection: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
});
