import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendshipSettingsContent } from "@/components/settings/FriendshipSettingsContent";
import { useAppColors } from "@/lib/theme";

export default function FriendSettingsPage() {
  const colors = useAppColors();
  const router = useRouter();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.backText, { color: colors.textMuted }]}>
            Back
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          Friendship settings
        </Text>
      </View>
      {friendId ? (
        <FriendshipSettingsContent friendId={friendId} />
      ) : null}
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
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
});
