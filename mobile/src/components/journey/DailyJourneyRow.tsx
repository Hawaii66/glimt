import {
  MeetDayInfoButton,
  MeetDayInfoModal,
} from "@/components/journey/MeetDayInfoModal";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { JourneyGlimtImage } from "@/components/journey/JourneyGlimtImage";
import { UserAvatar } from "@/components/UserAvatar";
import { getAccentTheme, type AccentThemeId } from "@/lib/accent-themes";
import { formatJourneyDate } from "@/lib/format-journey-date";
import type { DailyJourney, DailyJourneyGlimt } from "@/lib/journey-types";
import {
  PHOTO_BORDER_COLOR,
  TILE_BORDER_WIDTH,
  TILE_CORNER_RADIUS,
} from "@/lib/glimt-tile-styles";
import {
  getEarliestGlimt,
  getFirstChatMessage,
  sortGlimtsChronological,
} from "@/lib/journey-chat";
import { resolveJourneyLockState } from "@/lib/journey-lock";
import { MEET_DAY_LABEL, MEET_DAY_LOCKED_MESSAGE } from "@/lib/meet-day";
import { appFriendTogetherDayUnlock } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";

type DailyJourneyRowProps = {
  friendId: string;
  friendAccentId: AccentThemeId;
  friendAvatarUrl: string;
  friendDisplayName: string;
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  meetLock?: boolean;
  unlockedAt?: number;
  tileSize: number;
};

type LockVariant = "calendar" | "meet";

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

function LockedGlimtTile({
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

function JourneyGlimtStack({
  glimts,
  tileSize,
  baseTilt,
  locked = false,
  lockVariant = "calendar",
  zoomPhotoUrl,
  onZoomImageLoad,
}: {
  glimts?: DailyJourneyGlimt[];
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

function JourneyRowContent({
  friendId,
  friendAvatarUrl,
  friendDisplayName,
  date,
  yours,
  theirs,
  tileSize,
  calendarLocked,
  meetLocked,
  rowLocked,
  showUnlockButton,
  colors,
  accentColor,
  zoomPhotoUrl,
  onZoomImageLoad,
}: {
  friendId: string;
  friendAvatarUrl: string;
  friendDisplayName: string;
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  tileSize: number;
  calendarLocked: boolean;
  meetLocked: boolean;
  rowLocked: boolean;
  showUnlockButton: boolean;
  colors: ReturnType<typeof useAppColors>;
  accentColor: string;
  zoomPhotoUrl?: string;
  onZoomImageLoad: (size: ImageSize) => void;
}) {
  const lockVariant: LockVariant = meetLocked ? "meet" : "calendar";
  const [infoVisible, setInfoVisible] = useState(false);
  const dateHeader = (
    <View style={styles.dateHeader}>
      <View style={styles.dateHeaderLeft}>
        <UserAvatar
          imageUri={friendAvatarUrl || null}
          displayName={friendDisplayName}
          size={AVATAR_CHIP_SIZE}
          style={styles.avatarChip}
          backgroundColor={colors.fill}
        />
        <View style={styles.dateHeaderText}>
          <Text style={[styles.dateLabel, { color: colors.text }]}>
            {formatJourneyDate(date)}
          </Text>
          {!rowLocked ? (
            <Text style={[styles.friendName, { color: colors.textMuted }]}>
              {friendDisplayName}
            </Text>
          ) : null}
        </View>
      </View>
      {calendarLocked ? (
        <View style={[styles.lockedBadge, { backgroundColor: colors.fill }]}>
          <SymbolView name="lock.fill" size={11} tintColor={colors.textMuted} />
          <Text style={[styles.lockedBadgeText, { color: colors.textMuted }]}>
            Opens tomorrow
          </Text>
        </View>
      ) : null}
      {meetLocked ? (
        <View style={styles.meetLockedHeaderRight}>
          <View style={[styles.lockedBadge, { backgroundColor: colors.fill }]}>
            <SymbolView
              name="lock.fill"
              size={11}
              tintColor={colors.textMuted}
            />
            <Text style={[styles.lockedBadgeText, { color: colors.textMuted }]}>
              {MEET_DAY_LABEL}
            </Text>
          </View>
          <MeetDayInfoButton onPress={() => setInfoVisible(true)} />
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      <MeetDayInfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
      />
      {dateHeader}

      <View style={[styles.tilesArea, { minHeight: tileSize }]}>
        <View style={styles.previewRow}>
          <JourneyGlimtStack
            glimts={theirs}
            tileSize={tileSize}
            baseTilt={INWARD_TILT}
            locked={rowLocked}
            lockVariant={lockVariant}
            zoomPhotoUrl={zoomPhotoUrl}
            onZoomImageLoad={onZoomImageLoad}
          />
          <JourneyGlimtStack
            glimts={yours}
            tileSize={tileSize}
            baseTilt={-INWARD_TILT}
            locked={rowLocked}
            lockVariant={lockVariant}
            zoomPhotoUrl={zoomPhotoUrl}
            onZoomImageLoad={onZoomImageLoad}
          />
        </View>

        {rowLocked ? (
          <LockedDayConnector
            tileSize={tileSize}
            accentColor={accentColor}
            variant={lockVariant}
          />
        ) : null}
      </View>

      {calendarLocked ? (
        <View style={styles.lockedMessage}>
          <Text style={[styles.lockedBody, { color: colors.textMuted }]}>
            Today&apos;s glimts stay sealed until the day is done.
          </Text>
        </View>
      ) : null}
      {meetLocked ? (
        <View style={styles.lockedMessage}>
          <Text style={[styles.lockedBody, { color: colors.textMuted }]}>
            {MEET_DAY_LOCKED_MESSAGE}
          </Text>
        </View>
      ) : null}
      {showUnlockButton ? (
        <Link href={appFriendTogetherDayUnlock(friendId, date)} asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.unlockButton,
              { backgroundColor: accentColor },
            ])}
            accessibilityRole="button"
            accessibilityLabel="Unlock meet to view day"
          >
            <SymbolView name="lock.open.fill" size={16} tintColor="#FFFFFF" />
            <Text style={styles.unlockButtonText}>Unlock</Text>
          </Pressable>
        </Link>
      ) : null}
    </>
  );
}

export function DailyJourneyRow({
  friendId,
  friendAccentId,
  friendAvatarUrl,
  friendDisplayName,
  date,
  yours,
  theirs,
  meetLock,
  unlockedAt,
  tileSize,
}: DailyJourneyRowProps) {
  const colors = useAppColors();
  const journey: DailyJourney = {
    date,
    yours,
    theirs,
    meetLock,
    unlockedAt,
  };
  const { calendarLocked, meetLocked, rowLocked, canNavigateToDay } =
    resolveJourneyLockState(journey);
  const accentColor = getAccentTheme(friendAccentId).gradientColors[0];
  const [pressed, setPressed] = useState(false);
  const [zoomImageSize, setZoomImageSize] = useState<ImageSize | null>(null);
  const firstMessage = canNavigateToDay
    ? getFirstChatMessage({ date, yours, theirs })
    : undefined;
  const zoomPhotoUrl = firstMessage?.photoUrl;

  const rowStyle = StyleSheet.flatten([
    styles.row,
    rowLocked && styles.rowLocked,
    {
      backgroundColor: colors.fill,
      borderColor: colors.surfaceBorder,
      opacity: pressed && canNavigateToDay ? 0.92 : 1,
    },
  ]);

  const content = (
    <JourneyRowContent
      friendId={friendId}
      friendAvatarUrl={friendAvatarUrl}
      friendDisplayName={friendDisplayName}
      date={date}
      yours={yours}
      theirs={theirs}
      tileSize={tileSize}
      calendarLocked={calendarLocked}
      meetLocked={meetLocked}
      rowLocked={rowLocked}
      showUnlockButton={meetLocked}
      colors={colors}
      accentColor={accentColor}
      zoomPhotoUrl={zoomPhotoUrl}
      onZoomImageLoad={setZoomImageSize}
    />
  );

  if (!canNavigateToDay) {
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
          zoomWidth: zoomImageSize?.width?.toString(),
          zoomHeight: zoomImageSize?.height?.toString(),
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
  avatarChip: {},
  dateLabel: {
    fontSize: 17,
    fontWeight: "700",
  },
  friendName: {
    fontSize: 13,
  },
  meetLockedHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexShrink: 1,
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
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
