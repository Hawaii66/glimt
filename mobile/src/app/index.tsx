import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/lib/theme";

export default function HomeScreen() {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Glimt</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Scaffolding ready — build the MVP here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
