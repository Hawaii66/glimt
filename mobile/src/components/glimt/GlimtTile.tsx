import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
  TILE_SCALE,
  tileRotationDegrees,
} from "@/lib/glimt-tile-styles";

type GlimtTileProps = {
  photoUrl: string;
  index: number;
  size?: number;
};

export function GlimtTile({ photoUrl, index, size = 280 }: GlimtTileProps) {
  const borderWidth = TILE_BORDER_WIDTH;
  const innerRadius = TILE_CORNER_RADIUS - borderWidth;
  const rotation = `${tileRotationDegrees(index)}deg`;

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
          styles.borderVisible,
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
});
