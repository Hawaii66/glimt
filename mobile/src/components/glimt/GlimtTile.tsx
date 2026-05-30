import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";

import { UserAvatar } from "@/components/UserAvatar";
import {
  AVATAR_OFFSET,
  AVATAR_SIZE,
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
  TILE_SCALE,
  tileRotation,
} from "@/lib/glimt-tile-styles";

type GlimtTileProps = {
  photoUrl: string;
  avatarUrl?: string;
  displayName: string;
  index: number;
  size?: number;
};

export function GlimtTile({
  photoUrl,
  avatarUrl,
  displayName,
  index,
  size = 280,
}: GlimtTileProps) {
  const innerRadius = TILE_CORNER_RADIUS - TILE_BORDER_WIDTH;
  const rotation = tileRotation(index);

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
          {
            width: size,
            height: size,
            borderRadius: TILE_CORNER_RADIUS,
            padding: TILE_BORDER_WIDTH,
          },
        ]}
      >
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.photo,
            {
              width: size - TILE_BORDER_WIDTH * 2,
              height: size - TILE_BORDER_WIDTH * 2,
              borderRadius: innerRadius,
            },
          ]}
          contentFit="cover"
        />
      </View>

      <View
        style={[
          styles.avatarContainer,
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
          size={AVATAR_SIZE - 2}
          backgroundColor="#F5F0EB"
          initialsColor="#6B6560"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
  },
  border: {
    backgroundColor: PHOTO_BORDER_COLOR,
    overflow: "hidden",
  },
  photo: {
    overflow: "hidden",
  },
  avatarContainer: {
    position: "absolute",
    backgroundColor: PHOTO_BORDER_COLOR,
    padding: 1,
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
});
