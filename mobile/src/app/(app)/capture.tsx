import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CaptureScreen } from "@/components/glimt/CaptureScreen";
import { useAppColors } from "@/lib/theme";

export default function CapturePage() {
  const colors = useAppColors();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>
            Cancel
          </Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <CaptureScreen />
      </View>
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
    paddingBottom: 16,
  },
  body: {
    flex: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
