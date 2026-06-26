import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { View } from "react-native";

import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
} from "@/lib/glimt-tile-styles";

import {
  LOCKED_CONNECTOR_SIZE,
  tileShadowStyle,
  type LockVariant,
} from "./constants";
import { GlimtCountLabel } from "./GlimtCountLabel";
import { styles } from "./styles";

export function LockedDayConnector({
  tileSize,
  accentColor,
  variant,
}: {
  tileSize: number;
  accentColor: string;
  variant: LockVariant;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.lockedConnector,
        {
          top: tileSize / 2 - LOCKED_CONNECTOR_SIZE / 2,
          transform: [{ translateX: -LOCKED_CONNECTOR_SIZE / 2 }],
          borderColor: accentColor,
        },
      ]}
    >
      <SymbolView
        name={variant === "meet" ? "lock.fill" : "gift.fill"}
        size={18}
        tintColor={accentColor}
      />
    </View>
  );
}

export function LockedGlimtTile({
  tileSize,
  tilt,
  count,
  variant,
}: {
  tileSize: number;
  tilt: `${number}deg`;
  count: number;
  variant: LockVariant;
}) {
  const innerRadius = TILE_CORNER_RADIUS - TILE_BORDER_WIDTH;
  const compactBorderWidth = Math.max(4, TILE_BORDER_WIDTH - 2);
  const photoSize = tileSize - compactBorderWidth * 2;

  return (
    <View
      style={[
        styles.previewTileWrapper,
        tileShadowStyle(0),
        {
          width: tileSize,
          height: tileSize,
          transform: [{ rotate: tilt }],
        },
      ]}
    >
      <View
        style={[
          styles.previewTile,
          {
            width: tileSize,
            height: tileSize,
            borderRadius: TILE_CORNER_RADIUS,
            padding: compactBorderWidth,
            backgroundColor: PHOTO_BORDER_COLOR,
          },
        ]}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F3F2F8"]}
          style={[
            styles.lockedTile,
            {
              width: photoSize,
              height: photoSize,
              borderRadius: innerRadius,
            },
          ]}
        >
          {count > 0 ? <GlimtCountLabel count={count} /> : null}
          <SymbolView
            name={variant === "meet" ? "questionmark" : "sparkles"}
            size={variant === "meet" ? 28 : 22}
            tintColor="rgba(100, 100, 120, 0.5)"
          />
        </LinearGradient>
      </View>
    </View>
  );
}
