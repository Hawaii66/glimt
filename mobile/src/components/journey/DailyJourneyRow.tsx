import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { JourneyGlimtImage } from "@/components/journey/JourneyGlimtImage";
import { getAccentTheme } from "@/lib/accent-themes";
import { formatJourneyDate, isJourneyLocked } from "@/lib/format-journey-date";
import type { DailyJourneyGlimt } from "@/lib/glimt-mock-data";
import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
} from "@/lib/glimt-tile-styles";
import { getFirstGlimt } from "@/lib/journey-chat";
import { useAppColors } from "@/lib/theme";
import { useAccentThemeStore } from "@/stores/accentThemeStore";

type DailyJourneyRowProps = {
  friendId: string;
  friendAvatarUrl: string;
  friendDisplayName: string;
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  tileSize: number;
};

const INWARD_TILT = 1;
const LOCKED_CONNECTOR_SIZE = 36;
const STACK_OFFSET = 8;
const COUNT_INSET = 2;
const AVATAR_CHIP_SIZE = 28;

const BACK_ROTATION_OFFSETS = [-3, -1.5, -4, -2] as const;

type ImageSize = { width: number; height: number };

function stackRotation(
  baseTilt: number,
  index: number,
  total: number,
): `${number}deg` {
  if (index === total - 1) {
    return `${baseTilt}deg`;
  }
  const offset = BACK_ROTATION_OFFSETS[index] ?? -2;
  return `${baseTilt + offset}deg`;
}

function tileShadowStyle(index: number) {
  return Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 + index },
      shadowOpacity: 0.1 + index * 0.04,
      shadowRadius: 3 + index,
    },
    android: {
      elevation: 2 + index,
    },
    default: {},
  });
}

function GlimtCountLabel({ count }: { count: number }) {
  return (
    <View style={styles.countLabel}>
      <Text style={styles.countLabelText}>{count}</Text>
    </View>
  );
}

function LockedDayConnector({
  tileSize,
  accentColor,
}: {
  tileSize: number;
  accentColor: string;
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
      <SymbolView name="gift.fill" size={18} tintColor={accentColor} />
    </View>
  );
}

function LockedGlimtTile({
  tileSize,
  tilt,
  count,
}: {
  tileSize: number;
  tilt: `${number}deg`;
  count: number;
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
          <GlimtCountLabel count={count} />
          <SymbolView
            name="sparkles"
            size={22}
            tintColor="rgba(100, 100, 120, 0.5)"
          />
        </LinearGradient>
      </View>
    </View>
  );
}

function GlimtPhotoTile({
  glimt,
  tileSize,
  tilt,
  stackIndex = 0,
  showCount,
  enableZoom = false,
  onImageLoad,
}: {
  glimt: DailyJourneyGlimt;
  tileSize: number;
  tilt: `${number}deg`;
  stackIndex?: number;
  showCount?: number;
  enableZoom?: boolean;
  onImageLoad?: (size: ImageSize) => void;
}) {
  const tile = (
    <View
      style={[
        styles.previewTileWrapper,
        tileShadowStyle(stackIndex),
        {
          width: tileSize,
          height: tileSize,
          transform: [{ rotate: tilt }],
        },
      ]}
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

function JourneyGlimtStack({
  glimts,
  tileSize,
  baseTilt,
  locked = false,
  onTopImageLoad,
}: {
  glimts?: DailyJourneyGlimt[];
  tileSize: number;
  baseTilt: number;
  locked?: boolean;
  onTopImageLoad?: (size: ImageSize) => void;
}) {
  const colors = useAppColors();
  const count = glimts?.length ?? 0;
  const stackHeight =
    count > 1 ? tileSize + (count - 1) * STACK_OFFSET : tileSize;
  const horizontalNudge = baseTilt > 0 ? 1 : -1;
  const topGlimt = getFirstGlimt(glimts);

  if (locked) {
    return (
      <View style={styles.previewColumn}>
        <LockedGlimtTile
          tileSize={tileSize}
          tilt={`${baseTilt}deg`}
          count={count}
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
          No glimt
        </Text>
      </View>
    );
  }

  const latestCaption = topGlimt?.caption;
  const captionText = latestCaption ?? "No caption";

  return (
    <View style={styles.previewColumn}>
      <View style={[styles.stack, { width: tileSize, height: stackHeight }]}>
        {glimts!.map((glimt, index) => {
          const isTop = index === count - 1;
          return (
            <View
              key={`${glimt.photoUrl}-${index}`}
              style={[
                styles.stackLayer,
                {
                  top: index * STACK_OFFSET,
                  left: index * horizontalNudge * 3,
                  zIndex: index,
                },
              ]}
            >
              <GlimtPhotoTile
                glimt={glimt}
                tileSize={tileSize}
                tilt={stackRotation(baseTilt, index, count)}
                stackIndex={index}
                showCount={isTop ? count : undefined}
                enableZoom={isTop}
                onImageLoad={isTop ? onTopImageLoad : undefined}
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

function JourneyRowContent({
  friendAvatarUrl,
  friendDisplayName,
  date,
  yours,
  theirs,
  tileSize,
  locked,
  colors,
  accentColor,
  onYoursImageLoad,
  onTheirsImageLoad,
}: {
  friendAvatarUrl: string;
  friendDisplayName: string;
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  tileSize: number;
  locked: boolean;
  colors: ReturnType<typeof useAppColors>;
  accentColor: string;
  onYoursImageLoad: (size: ImageSize) => void;
  onTheirsImageLoad: (size: ImageSize) => void;
}) {
  const dateHeader = (
    <View style={styles.dateHeader}>
      <View style={styles.dateHeaderLeft}>
        {!locked ? (
          <Link.AppleZoom>
            <View style={styles.avatarChip}>
              <Image
                source={{ uri: friendAvatarUrl }}
                style={styles.avatarChipImage}
              />
            </View>
          </Link.AppleZoom>
        ) : (
          <View style={styles.avatarChip}>
            <Image
              source={{ uri: friendAvatarUrl }}
              style={styles.avatarChipImage}
            />
          </View>
        )}
        <View style={styles.dateHeaderText}>
          <Text style={[styles.dateLabel, { color: colors.text }]}>
            {formatJourneyDate(date)}
          </Text>
          {!locked ? (
            <Text style={[styles.friendName, { color: colors.textMuted }]}>
              {friendDisplayName}
            </Text>
          ) : null}
        </View>
      </View>
      {locked ? (
        <View style={[styles.lockedBadge, { backgroundColor: colors.fill }]}>
          <SymbolView name="lock.fill" size={11} tintColor={colors.textMuted} />
          <Text style={[styles.lockedBadgeText, { color: colors.textMuted }]}>
            Opens tomorrow
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      {dateHeader}

      <View style={[styles.tilesArea, { minHeight: tileSize }]}>
        <View style={styles.previewRow}>
          <JourneyGlimtStack
            glimts={yours}
            tileSize={tileSize}
            baseTilt={INWARD_TILT}
            locked={locked}
            onTopImageLoad={onYoursImageLoad}
          />
          <JourneyGlimtStack
            glimts={theirs}
            tileSize={tileSize}
            baseTilt={-INWARD_TILT}
            locked={locked}
            onTopImageLoad={onTheirsImageLoad}
          />
        </View>

        {locked ? (
          <LockedDayConnector tileSize={tileSize} accentColor={accentColor} />
        ) : null}
      </View>

      {locked ? (
        <View style={styles.lockedMessage}>
          <Text style={[styles.lockedBody, { color: colors.textMuted }]}>
            Today's glimts stay sealed until the day is done.
          </Text>
        </View>
      ) : null}
    </>
  );
}

export function DailyJourneyRow({
  friendId,
  friendAvatarUrl,
  friendDisplayName,
  date,
  yours,
  theirs,
  tileSize,
}: DailyJourneyRowProps) {
  const colors = useAppColors();
  const locked = isJourneyLocked(date, yours, theirs);
  const accentId = useAccentThemeStore((state) => state.accentId);
  const accentColor = getAccentTheme(accentId).gradientColors[0];
  const [pressed, setPressed] = useState(false);
  const [yoursImageSize, setYoursImageSize] = useState<ImageSize | null>(null);
  const [theirsImageSize, setTheirsImageSize] = useState<ImageSize | null>(
    null,
  );

  const rowStyle = StyleSheet.flatten([
    styles.row,
    locked && styles.rowLocked,
    {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceBorder,
      opacity: pressed && !locked ? 0.92 : 1,
    },
  ]);

  const content = (
    <JourneyRowContent
      friendAvatarUrl={friendAvatarUrl}
      friendDisplayName={friendDisplayName}
      date={date}
      yours={yours}
      theirs={theirs}
      tileSize={tileSize}
      locked={locked}
      colors={colors}
      accentColor={accentColor}
      onYoursImageLoad={setYoursImageSize}
      onTheirsImageLoad={setTheirsImageSize}
    />
  );

  if (locked) {
    return (
      <Pressable disabled style={rowStyle}>
        {content}
      </Pressable>
    );
  }

  return (
    <Link
      href={{
        pathname: "/(app)/friend/[friendId]/day/[date]",
        params: {
          friendId,
          date,
          yoursWidth: yoursImageSize?.width?.toString(),
          yoursHeight: yoursImageSize?.height?.toString(),
          theirsWidth: theirsImageSize?.width?.toString(),
          theirsHeight: theirsImageSize?.height?.toString(),
        },
      }}
      asChild
    >
      <Pressable
        style={rowStyle}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        {content}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  rowLocked: {
    borderWidth: 1.5,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dateHeaderText: {
    flex: 1,
    gap: 2,
  },
  avatarChip: {
    width: AVATAR_CHIP_SIZE,
    height: AVATAR_CHIP_SIZE,
    borderRadius: AVATAR_CHIP_SIZE / 2,
    overflow: "hidden",
  },
  avatarChipImage: {
    width: "100%",
    height: "100%",
  },
  dateLabel: {
    fontSize: 17,
    fontWeight: "700",
  },
  friendName: {
    fontSize: 13,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lockedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tilesArea: {
    position: "relative",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  previewColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  countLabel: {
    position: "absolute",
    right: COUNT_INSET,
    bottom: COUNT_INSET,
    zIndex: 2,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 3,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  countLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  stack: {
    position: "relative",
    alignSelf: "center",
  },
  stackLayer: {
    position: "absolute",
  },
  previewTileWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewTile: {
    overflow: "hidden",
  },
  tileContent: {
    position: "relative",
    overflow: "hidden",
  },
  emptyTile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lockedTile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lockedConnector: {
    position: "absolute",
    left: "50%",
    zIndex: 10,
    width: LOCKED_CONNECTOR_SIZE,
    height: LOCKED_CONNECTOR_SIZE,
    borderRadius: LOCKED_CONNECTOR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  caption: {
    fontSize: 14,
    textAlign: "center",
    width: "100%",
  },
  lockedMessage: {
    alignItems: "center",
    paddingTop: 4,
  },
  lockedBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
