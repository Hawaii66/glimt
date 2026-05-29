import { BottomSheet } from "@expo/ui";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/lib/theme";

type CaptureSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
};

export function CaptureSheet({ isPresented, onDismiss }: CaptureSheetProps) {
  const colors = useAppColors();

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Capture coming soon
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          This is where you will take and post a glimt.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 8,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
