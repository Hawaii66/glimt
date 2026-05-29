import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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

import { CaptureSheet } from "@/components/glimt/CaptureSheet";
import { GlimtTile } from "@/components/glimt/GlimtTile";
import { MOCK_FRIEND_GLIMTS } from "@/lib/glimt-mock-data";
import { WIDGET_GRADIENT_COLORS } from "@/lib/glimt-tile-styles";

const HORIZONTAL_PADDING = 24;
const NUM_COLUMNS = 2;
const TILE_HORIZONTAL_GAP = 16;
const TILE_VERTICAL_GAP = 24;
const BOTTOM_BAR_PADDING = 24;

export default function HomeScreen() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const tileSize =
    (contentWidth - TILE_HORIZONTAL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...WIDGET_GRADIENT_COLORS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <FlashList
        data={MOCK_FRIEND_GLIMTS}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 8 },
        ]}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listItem,
              index % NUM_COLUMNS === 0 && styles.listItemLeft,
            ]}
          >
            <GlimtTile
              photoUrl={item.photoUrl}
              avatarUrl={item.avatarUrl}
              index={index}
              size={tileSize}
            />
          </View>
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
          onPress={() => setCaptureOpen(true)}
        >
          <Text style={styles.captureButtonText}>Take a picture</Text>
        </Pressable>
      </SafeAreaView>

      <CaptureSheet
        isPresented={captureOpen}
        onDismiss={() => setCaptureOpen(false)}
      />
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
