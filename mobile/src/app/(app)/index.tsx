import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlimtTile } from "@/components/glimt/GlimtTile";
import { DEFAULT_ACCENT_THEME_ID, getAccentTheme } from "@/lib/accent-themes";
import { APP_CAPTURE, APP_SETTINGS } from "@/lib/routes";
import { useCaptureStore } from "@/stores/captureStore";

const HORIZONTAL_PADDING = 24;
const NUM_COLUMNS = 2;
const TILE_HORIZONTAL_GAP = 16;
const TILE_VERTICAL_GAP = 24;
const BOTTOM_BAR_PADDING = 24;

export default function HomeScreen() {
  const router = useRouter();
  const glimts = useCaptureStore((state) => state.glimts);
  const gradientColors = getAccentTheme(DEFAULT_ACCENT_THEME_ID).gradientColors;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const tileSize =
    (contentWidth - TILE_HORIZONTAL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const showEmptyState = glimts.length === 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        style={[styles.menuButton, { top: insets.top + 8 }]}
        onPress={() => router.push(APP_SETTINGS)}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <SymbolView
          name="line.3.horizontal"
          size={20}
          tintColor="#FFFFFF"
          weight="semibold"
        />
      </Pressable>

      <FlashList
        data={glimts}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.title}>Glimt</Text>
            <Text style={styles.tagline}>Small everyday moments</Text>
          </View>
        }
        ListEmptyComponent={
          showEmptyState ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nothing new today</Text>
              <Text style={styles.emptyBody}>
                Take a picture to capture your first glimt.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listItem,
              index % NUM_COLUMNS === 0 && styles.listItemLeft,
            ]}
          >
            <GlimtTile photoUrl={item.photoUri} index={index} size={tileSize} />
            {item.caption ? (
              <Text style={styles.caption} numberOfLines={2}>
                {item.caption}
              </Text>
            ) : null}
          </View>
        )}
      />

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + BOTTOM_BAR_PADDING },
        ]}
      >
        <Pressable
          style={styles.captureButton}
          onPress={() => router.push(APP_CAPTURE)}
        >
          <Text style={styles.captureButtonText}>Take a picture</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: "absolute",
    right: HORIZONTAL_PADDING,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 120,
  },
  header: {
    paddingBottom: 28,
    paddingRight: 52,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  listItem: {
    marginBottom: TILE_VERTICAL_GAP,
    alignItems: "center",
    gap: 8,
  },
  listItemLeft: {
    marginRight: TILE_HORIZONTAL_GAP,
  },
  caption: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  emptyState: {
    paddingTop: 48,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyBody: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: BOTTOM_BAR_PADDING,
  },
  captureButton: {
    backgroundColor: "#111111",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
