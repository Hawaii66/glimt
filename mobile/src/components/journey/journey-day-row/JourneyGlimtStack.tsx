import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { JourneyGlimtImage } from "@/components/journey/JourneyGlimtImage";
import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
} from "@/lib/glimt-tile-styles";
import { getEarliestGlimt, sortGlimtsChronological } from "@/lib/journey-chat";
import type { JourneyGlimt } from "@/lib/journey-types";
import { useAppColors } from "@/lib/theme";

import {
  STACK_OFFSET,
  stackRotation,
  tileShadowStyle,
  type ImageSize,
  type LockVariant,
} from "./constants";
import { GlimtCountLabel } from "./GlimtCountLabel";
import { LockedGlimtTile } from "./LockedGlimtTile";
import { styles } from "./styles";

function GlimtPhotoTile({
  glimt,
  tileSize,
  tilt,
  stackIndex = 0,
  showCount,
  enableZoom = false,
  onImageLoad,
}: {
  glimt: JourneyGlimt;
  tileSize: number;
  tilt: `${number}deg`;
  stackIndex?: number;
  showCount?: number;
  enableZoom?: boolean;
  onImageLoad?: (size: ImageSize) => void;
}) {
  const tile = (
    <View
      style={StyleSheet.flatten([
        styles.previewTileWrapper,
        tileShadowStyle(stackIndex),
        {
          width: tileSize,
          height: tileSize,
          transform: [{ rotate: tilt }],
        },
      ])}
    >
      <View style={[styles.tileContent, { width: tileSize, height: tileSize }]}>
        <JourneyGlimtImage
          photoUrl={glimt.photoUrl}
          size={tileSize}
          onLoad={onImageLoad}
        />
        {showCount !== undefined ? <GlimtCountLabel count={showCount} /> : null}
      </View>
    </View>
  );

  if (enableZoom) {
    return <Link.AppleZoom>{tile}</Link.AppleZoom>;
  }

  return tile;
}

function EmptyGlimtTile({
  tileSize,
  tilt,
  count,
}: {
  tileSize: number;
  tilt: `${number}deg`;
  count: number;
}) {
  const colors = useAppColors();
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
        <View
          style={[
            styles.emptyTile,
            {
              width: photoSize,
              height: photoSize,
              borderRadius: innerRadius,
              backgroundColor: colors.fill,
            },
          ]}
        >
          <GlimtCountLabel count={count} />
          <SymbolView
            name="person.crop.square"
            size={28}
            tintColor={colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

export function JourneyGlimtStack({
  glimts,
  tileSize,
  baseTilt,
  locked = false,
  lockVariant = "calendar",
  zoomPhotoUrl,
  onZoomImageLoad,
}: {
  glimts?: JourneyGlimt[];
  tileSize: number;
  baseTilt: number;
  locked?: boolean;
  lockVariant?: LockVariant;
  zoomPhotoUrl?: string;
  onZoomImageLoad?: (size: ImageSize) => void;
}) {
  const colors = useAppColors();
  const sortedGlimts = glimts?.length ? sortGlimtsChronological(glimts) : [];
  const count = sortedGlimts.length;
  const stackHeight =
    count > 1 ? tileSize + (count - 1) * STACK_OFFSET : tileSize;
  const horizontalNudge = baseTilt > 0 ? 1 : -1;
  const topGlimt = getEarliestGlimt(glimts);

  if (locked) {
    return (
      <View style={styles.previewColumn}>
        <LockedGlimtTile
          tileSize={tileSize}
          tilt={`${baseTilt}deg`}
          count={count}
          variant={lockVariant}
        />
      </View>
    );
  }

  if (count === 0) {
    return (
      <View style={styles.previewColumn}>
        <EmptyGlimtTile tileSize={tileSize} tilt={`${baseTilt}deg`} count={0} />
        <Text
          style={[styles.caption, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          No glimts
        </Text>
      </View>
    );
  }

  const previewCaption = topGlimt?.caption;
  const captionText = previewCaption ?? "No caption";

  return (
    <View style={styles.previewColumn}>
      <View style={[styles.stack, { width: tileSize, height: stackHeight }]}>
        {sortedGlimts.map((glimt, index) => {
          const isTop = index === 0;
          const stackLayer = count - 1 - index;
          const isZoomSource = isTop && zoomPhotoUrl === glimt.photoUrl;
          return (
            <View
              key={`${glimt.photoUrl}-${index}`}
              style={StyleSheet.flatten([
                styles.stackLayer,
                {
                  top: stackLayer * STACK_OFFSET,
                  left: stackLayer * horizontalNudge * 3,
                  zIndex: stackLayer,
                },
              ])}
            >
              <GlimtPhotoTile
                glimt={glimt}
                tileSize={tileSize}
                tilt={stackRotation(baseTilt, stackLayer, count)}
                stackIndex={stackLayer}
                showCount={isTop ? count : undefined}
                enableZoom={isZoomSource}
                onImageLoad={isZoomSource ? onZoomImageLoad : undefined}
              />
            </View>
          );
        })}
      </View>
      <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>
        {captionText}
      </Text>
    </View>
  );
}
