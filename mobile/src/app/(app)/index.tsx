import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_SETTINGS } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";

export default function HomeScreen() {
  const colors = useAppColors();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Pressable
          style={[
            styles.settingsButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
          onPress={() => router.push(APP_SETTINGS)}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <SymbolView
            name="line.3.horizontal"
            size={20}
            tintColor={colors.text}
            weight="semibold"
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Glimt</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Welcome to Glimt!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
  },
});
