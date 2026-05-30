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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { GlimtTile } from "@/components/glimt/GlimtTile";
import { getAccentTheme } from "@/lib/accent-themes";
import { MOCK_FRIEND_GLIMTS } from "@/lib/glimt-mock-data";
import { APP_CAPTURE, APP_SETTINGS, appFriendJourney } from "@/lib/routes";
import { useAccentThemeStore } from "@/stores/accentThemeStore";

const HORIZONTAL_PADDING = 24;
const NUM_COLUMNS = 2;
const TILE_HORIZONTAL_GAP = 16;
const TILE_VERTICAL_GAP = 24;
const BOTTOM_BAR_PADDING = 24;

export default function HomeScreen() {
  const router = useRouter();
  const accentId = useAccentThemeStore((state) => state.accentId);
  const gradientColors = getAccentTheme(accentId).gradientColors;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const tileSize =
    (contentWidth - TILE_HORIZONTAL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

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
        data={MOCK_FRIEND_GLIMTS}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 8 },
        ]}
        renderItem={({ item, index }) => (
          <Pressable
            style={[
              styles.listItem,
              index % NUM_COLUMNS === 0 && styles.listItemLeft,
            ]}
            onPress={() => router.push(appFriendJourney(item.id))}
            accessibilityRole="button"
            accessibilityLabel={`Open journey with ${item.displayName}`}
          >
            <GlimtTile
              photoUrl={item.photoUrl}
              avatarUrl={item.avatarUrl}
              index={index}
              size={tileSize}
            />
          </Pressable>
        )}
      />

      <SafeAreaView
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + BOTTOM_BAR_PADDING },
        ]}
        edges={[]}
      >
        <Pressable
          style={styles.captureButton}
          onPress={() => router.push(APP_CAPTURE)}
        >
          <Text style={styles.captureButtonText}>Take a picture</Text>
        </Pressable>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
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
  listItem: {
    marginBottom: TILE_VERTICAL_GAP,
    alignItems: "center",
  },
  listItemLeft: {
    marginRight: TILE_HORIZONTAL_GAP,
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
