import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Platform, StyleSheet, Text, View } from "react-native";

import { UserAvatar } from "@/components/UserAvatar";
import {
  AVATAR_OFFSET,
  AVATAR_SIZE,
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
  TILE_SCALE,
  tileRotationDegrees,
} from "@/lib/glimt-tile-styles";
import {
  resolveWidgetDisplayPreferences,
  type WidgetDisplayPreferences,
} from "convex/lib/widgetDisplayPreferences";

type GlimtTileProps = {
  photoUrl: string;
  avatarUrl?: string;
  displayName: string;
  index: number;
  size?: number;
  showMeetDayBadge?: boolean;
  displayPreferences?: WidgetDisplayPreferences;
};

export function GlimtTile({
  photoUrl,
  avatarUrl,
  displayName,
  index,
  size = 280,
  showMeetDayBadge = false,
  displayPreferences,
}: GlimtTileProps) {
  const { showWhiteBorder, showRotation, showAvatar } =
    resolveWidgetDisplayPreferences(displayPreferences);
  const borderWidth = showWhiteBorder ? TILE_BORDER_WIDTH : 0;
  const innerRadius = TILE_CORNER_RADIUS - borderWidth;
  const rotation = `${tileRotationDegrees(index, showRotation)}deg`;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          transform: [{ rotate: rotation }, { scale: TILE_SCALE }],
        },
      ]}
    >
      <View
        style={[
          styles.border,
          showWhiteBorder && styles.borderVisible,
          {
            width: size,
            height: size,
            borderRadius: TILE_CORNER_RADIUS,
            padding: borderWidth,
          },
        ]}
      >
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.photo,
            {
              width: size - borderWidth * 2,
              height: size - borderWidth * 2,
              borderRadius: innerRadius,
            },
          ]}
          contentFit="cover"
        />
      </View>

      {showAvatar ? (
        <View
          style={[
            styles.avatarContainer,
            showWhiteBorder && styles.avatarBorderVisible,
            {
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              right: -AVATAR_OFFSET,
              bottom: -AVATAR_OFFSET,
              borderRadius: AVATAR_SIZE / 2,
            },
          ]}
        >
          <UserAvatar
            imageUri={avatarUrl}
            displayName={displayName}
            size={AVATAR_SIZE - (showWhiteBorder ? 2 : 0)}
            backgroundColor="#F5F0EB"
            initialsColor="#6B6560"
          />
        </View>
      ) : null}

      {showMeetDayBadge ? (
        <View style={styles.meetBadge}>
          <SymbolView name="lock.fill" size={10} tintColor="#FFFFFF" />
          <Text style={styles.meetBadgeText}>Meet</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
  },
  border: {
    overflow: "hidden",
  },
  borderVisible: {
    backgroundColor: PHOTO_BORDER_COLOR,
  },
  photo: {
    overflow: "hidden",
  },
  meetBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  meetBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarContainer: {
    position: "absolute",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#777",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  avatarBorderVisible: {
    backgroundColor: PHOTO_BORDER_COLOR,
    padding: 1,
  },
});
