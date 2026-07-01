import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { useAppColors } from "@/lib/theme";

export default function SettingsPage() {
  const colors = useAppColors();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.backText, { color: colors.textMuted }]}>
            Back
          </Text>
        </Pressable>
      </View>
      <SettingsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
