import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { getAccentTheme } from "@/lib/accent-themes";
import { formatJourneyDate, isJourneyLocked } from "@/lib/format-journey-date";
import type { DailyJourneyGlimt } from "@/lib/glimt-mock-data";
import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
} from "@/lib/glimt-tile-styles";
import { useAppColors } from "@/lib/theme";
import { useAccentThemeStore } from "@/stores/accentThemeStore";

type DailyJourneyRowProps = {
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  tileSize: number;
  onPress?: () => void;
};

const INWARD_TILT = 1;
const LOCKED_CONNECTOR_SIZE = 36;
const STACK_OFFSET = 8;
const COUNT_INSET = 2;

const BACK_ROTATION_OFFSETS = [-3, -1.5, -4, -2] as const;

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
}: {
  glimt: DailyJourneyGlimt;
  tileSize: number;
  tilt: `${number}deg`;
  stackIndex?: number;
  showCount?: number;
}) {
  const innerRadius = TILE_CORNER_RADIUS - TILE_BORDER_WIDTH;
  const compactBorderWidth = Math.max(4, TILE_BORDER_WIDTH - 2);
  const photoSize = tileSize - compactBorderWidth * 2;

  return (
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
            styles.tileContent,
            {
              width: photoSize,
              height: photoSize,
              borderRadius: innerRadius,
            },
          ]}
        >
          <Image
            source={{ uri: glimt.photoUrl }}
            style={[
              styles.previewPhoto,
              {
                width: photoSize,
                height: photoSize,
                borderRadius: innerRadius,
              },
            ]}
            contentFit="cover"
          />
          {showCount !== undefined ? (
            <GlimtCountLabel count={showCount} />
          ) : null}
        </View>
      </View>
    </View>
  );
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
}: {
  glimts?: DailyJourneyGlimt[];
  tileSize: number;
  baseTilt: number;
  locked?: boolean;
}) {
  const colors = useAppColors();
  const count = glimts?.length ?? 0;
  const stackHeight =
    count > 1 ? tileSize + (count - 1) * STACK_OFFSET : tileSize;
  const horizontalNudge = baseTilt > 0 ? 1 : -1;

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

  const latestCaption = glimts![count - 1]?.caption;
  const captionText = latestCaption ?? "No caption";

  return (
    <View style={styles.previewColumn}>
      <View style={[styles.stack, { width: tileSize, height: stackHeight }]}>
        {glimts!.map((glimt, index) => (
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
              showCount={index === count - 1 ? count : undefined}
            />
          </View>
        ))}
      </View>
      <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>
        {captionText}
      </Text>
    </View>
  );
}

export function DailyJourneyRow({
  date,
  yours,
  theirs,
  tileSize,
  onPress,
}: DailyJourneyRowProps) {
  const colors = useAppColors();
  const locked = isJourneyLocked(date, yours, theirs);
  const accentId = useAccentThemeStore((state) => state.accentId);
  const accentColor = getAccentTheme(accentId).gradientColors[0];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || locked}
      style={({ pressed }) => [
        styles.row,
        locked && styles.rowLocked,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
          opacity: pressed && onPress && !locked ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.dateHeader}>
        <Text style={[styles.dateLabel, { color: colors.text }]}>
          {formatJourneyDate(date)}
        </Text>
        {locked ? (
          <View style={[styles.lockedBadge, { backgroundColor: colors.fill }]}>
            <SymbolView
              name="lock.fill"
              size={11}
              tintColor={colors.textMuted}
            />
            <Text style={[styles.lockedBadgeText, { color: colors.textMuted }]}>
              Opens tomorrow
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.tilesArea, { minHeight: tileSize }]}>
        <View style={styles.previewRow}>
          <JourneyGlimtStack
            glimts={yours}
            tileSize={tileSize}
            baseTilt={INWARD_TILT}
            locked={locked}
          />
          <JourneyGlimtStack
            glimts={theirs}
            tileSize={tileSize}
            baseTilt={-INWARD_TILT}
            locked={locked}
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
    </Pressable>
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
  dateLabel: {
    fontSize: 17,
    fontWeight: "700",
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
    overflow: "hidden",
  },
  previewPhoto: {
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
