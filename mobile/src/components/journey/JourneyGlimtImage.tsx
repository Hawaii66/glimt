import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
} from "@/lib/glimt-tile-styles";

type JourneyGlimtImageProps = {
  photoUrl: string;
  size: number;
  borderWidth?: number;
  onLoad?: (size: { width: number; height: number }) => void;
};

export function JourneyGlimtImage({
  photoUrl,
  size,
  borderWidth = Math.max(4, TILE_BORDER_WIDTH - 2),
  onLoad,
}: JourneyGlimtImageProps) {
  const innerRadius = TILE_CORNER_RADIUS - borderWidth;
  const photoSize = size - borderWidth * 2;

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: TILE_CORNER_RADIUS,
          padding: borderWidth,
          backgroundColor: PHOTO_BORDER_COLOR,
        },
      ]}
    >
      <Image
        source={{ uri: photoUrl }}
        style={[
          styles.photo,
          {
            width: photoSize,
            height: photoSize,
            borderRadius: innerRadius,
          },
        ]}
        contentFit="cover"
        onLoad={
          onLoad
            ? (event) =>
                onLoad({
                  width: event.source.width,
                  height: event.source.height,
                })
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  photo: {
    overflow: "hidden",
  },
});
