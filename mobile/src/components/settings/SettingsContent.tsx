import { ScrollView, StyleSheet, Text } from "react-native";

import { SettingsSignOutButton } from "@/components/settings/SettingsAccountSection";
import { SettingsProfileSection } from "@/components/settings/SettingsProfileSection";
import { useAppColors } from "@/lib/theme";

export function SettingsContent() {
  const colors = useAppColors();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>

      <SettingsProfileSection />

      <SettingsSignOutButton />
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
});
