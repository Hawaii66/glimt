import {
  MeetDayInfoButton,
  MeetDayInfoModal,
} from "@/components/journey/MeetDayInfoModal";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UserAvatar } from "@/components/UserAvatar";
import { formatJourneyDate } from "@/lib/format-journey-date";
import type { JourneyGlimt } from "@/lib/journey-types";
import {
  MEET_DAY_LABEL,
  MEET_DAY_LOCKED_MESSAGE,
  TODAY_AND_MEET_LOCKED_MESSAGE,
} from "@/lib/meet-day";
import { appFriendTogetherDayUnlock } from "@/lib/routes";
import { useAppColors } from "@/lib/theme";

import { AVATAR_CHIP_SIZE, INWARD_TILT, type ImageSize, type LockVariant } from "./constants";
import { JourneyGlimtStack } from "./JourneyGlimtStack";
import { LockedDayConnector } from "./LockedGlimtTile";
import { styles } from "./styles";

export function JourneyRowContent({
  friendId,
  friendAvatarUrl,
  friendDisplayName,
  date,
  journalToday,
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
  journalToday: string;
  yours?: JourneyGlimt[];
  theirs?: JourneyGlimt[];
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
  const lockVariant: LockVariant = calendarLocked
    ? "calendar"
    : meetLocked
      ? "meet"
      : "calendar";
  const showTodayBadge = calendarLocked && !meetLocked;
  const lockedMessage = calendarLocked
    ? meetLocked
      ? TODAY_AND_MEET_LOCKED_MESSAGE
      : "Today's glimts stay sealed until the day is done."
    : meetLocked
      ? MEET_DAY_LOCKED_MESSAGE
      : null;
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
            {formatJourneyDate(date, journalToday)}
          </Text>
          {!rowLocked ? (
            <Text style={[styles.friendName, { color: colors.textMuted }]}>
              {friendDisplayName}
            </Text>
          ) : null}
        </View>
      </View>
      {showTodayBadge || meetLocked ? (
        <View style={styles.lockBadges}>
          {showTodayBadge ? (
            <View
              style={[styles.lockedBadge, { backgroundColor: colors.fill }]}
            >
              <SymbolView
                name="lock.fill"
                size={11}
                tintColor={colors.textMuted}
              />
              <Text
                style={[styles.lockedBadgeText, { color: colors.textMuted }]}
              >
                Opens tomorrow
              </Text>
            </View>
          ) : null}
          {meetLocked ? (
            <View style={styles.meetLockedHeaderRight}>
              <View
                style={[styles.lockedBadge, { backgroundColor: colors.fill }]}
              >
                <SymbolView
                  name="lock.fill"
                  size={11}
                  tintColor={colors.textMuted}
                />
                <Text
                  style={[styles.lockedBadgeText, { color: colors.textMuted }]}
                >
                  {MEET_DAY_LABEL}
                </Text>
              </View>
              <MeetDayInfoButton onPress={() => setInfoVisible(true)} />
            </View>
          ) : null}
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

      {lockedMessage ? (
        <View style={styles.lockedMessage}>
          <Text style={[styles.lockedBody, { color: colors.textMuted }]}>
            {lockedMessage}
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
