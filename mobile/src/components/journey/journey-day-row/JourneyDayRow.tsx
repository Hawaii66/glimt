import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { getAccentTheme, type AccentThemeId } from "@/lib/accent-themes";
import { getFirstChatMessage } from "@/lib/journey-chat";
import { resolveJourneyLockState } from "@/lib/journey-lock";
import type { JourneyDay, JourneyGlimt } from "@/lib/journey-types";
import { useAppColors } from "@/lib/theme";

import { type ImageSize } from "./constants";
import { JourneyRowContent } from "./JourneyRowContent";
import { styles } from "./styles";

type JourneyDayRowProps = {
  friendId: string;
  friendAccentId: AccentThemeId;
  friendAvatarUrl: string;
  friendDisplayName: string;
  date: string;
  journalToday: string;
  yours?: JourneyGlimt[];
  theirs?: JourneyGlimt[];
  meetLocked?: boolean;
  unlockedAt?: number;
  tileSize: number;
};

export function JourneyDayRow({
  friendId,
  friendAccentId,
  friendAvatarUrl,
  friendDisplayName,
  date,
  journalToday,
  yours,
  theirs,
  meetLocked: dayMeetLocked,
  unlockedAt,
  tileSize,
}: JourneyDayRowProps) {
  const colors = useAppColors();
  const journey: JourneyDay = {
    date,
    yours,    meetLocked: dayMeetLocked,
  };
  const {
    calendarLocked,
    meetLocked,
    rowLocked,
    canNavigateToDay,
    showUnlockButton,
  } = resolveJourneyLockState(journey, journalToday);
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
      journalToday={journalToday}
      yours={yours}
      theirs={theirs}
      tileSize={tileSize}
      calendarLocked={calendarLocked}
      meetLocked={meetLocked}
      rowLocked={rowLocked}
      showUnlockButton={showUnlockButton}
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
