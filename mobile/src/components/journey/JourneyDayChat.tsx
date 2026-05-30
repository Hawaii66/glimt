import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JourneyGlimtImage } from "@/components/journey/JourneyGlimtImage";
import { getAccentTheme } from "@/lib/accent-themes";
import { formatGlimtSentTime } from "@/lib/format-glimt-time";
import { formatJourneyDate } from "@/lib/format-journey-date";
import type { DailyJourneyGlimt } from "@/lib/glimt-mock-data";
import {
  buildJourneyChatMessages,
  getFirstGlimt,
  type JourneyChatMessage,
} from "@/lib/journey-chat";
import { useAppColors } from "@/lib/theme";
import { useAccentThemeStore } from "@/stores/accentThemeStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

const CHAT_IMAGE_SIZE = 220;
const AVATAR_SIZE = 28;
const BUBBLE_MAX_WIDTH_RATIO = 0.72;

type JourneyDayChatProps = {
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  friendDisplayName: string;
  friendAvatarUrl: string;
  yoursImageWidth?: number;
  yoursImageHeight?: number;
  theirsImageWidth?: number;
  theirsImageHeight?: number;
};

function ChatHeader({
  friendDisplayName,
  friendAvatarUrl,
  dateLabel,
}: {
  friendDisplayName: string;
  friendAvatarUrl: string;
  dateLabel: string;
}) {
  const colors = useAppColors();

  return (
    <View style={styles.chatHeader}>
      <Link.AppleZoomTarget>
        <View style={styles.chatHeaderAvatarWrap}>
          <Image
            source={{ uri: friendAvatarUrl }}
            style={[
              styles.chatHeaderAvatar,
              { borderColor: colors.surfaceBorder },
            ]}
          />
        </View>
      </Link.AppleZoomTarget>
      <Text style={[styles.chatHeaderName, { color: colors.text }]}>
        {friendDisplayName}
      </Text>
      <Text style={[styles.chatHeaderDate, { color: colors.textMuted }]}>
        {dateLabel}
      </Text>
    </View>
  );
}

function ChatMessageBubble({
  message,
  isZoomTarget,
  friendAvatarUrl,
  currentUserAvatarUrl,
  bubbleMaxWidth,
  yoursBubbleColor,
}: {
  message: JourneyChatMessage;
  isZoomTarget: boolean;
  friendAvatarUrl: string;
  currentUserAvatarUrl?: string | null;
  bubbleMaxWidth: number;
  yoursBubbleColor: string;
}) {
  const colors = useAppColors();
  const isYours = message.sender === "yours";
  const captionText = message.caption?.trim() || "No caption";
  const timeText = formatGlimtSentTime(message.sentAt);

  const imageContent = (
    <JourneyGlimtImage photoUrl={message.photoUrl} size={CHAT_IMAGE_SIZE} />
  );

  return (
    <View
      style={[
        styles.messageRow,
        isYours ? styles.messageRowYours : styles.messageRowTheirs,
      ]}
    >
      {!isYours ? (
        <Image
          source={{ uri: friendAvatarUrl }}
          style={styles.messageAvatar}
        />
      ) : null}

      <View
        style={[
          styles.messageColumn,
          { maxWidth: bubbleMaxWidth },
          isYours ? styles.messageColumnYours : styles.messageColumnTheirs,
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isYours ? yoursBubbleColor : colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
        >
          {isZoomTarget ? (
            <Link.AppleZoomTarget>{imageContent}</Link.AppleZoomTarget>
          ) : (
            imageContent
          )}
          <Text
            style={[
              styles.caption,
              { color: isYours ? "#FFFFFF" : colors.text },
            ]}
          >
            {captionText}
          </Text>
        </View>
        <Text
          style={[
            styles.time,
            { color: colors.textMuted },
            isYours ? styles.timeYours : styles.timeTheirs,
          ]}
        >
          {timeText}
        </Text>
      </View>

      {isYours && currentUserAvatarUrl ? (
        <Image
          source={{ uri: currentUserAvatarUrl }}
          style={styles.messageAvatar}
        />
      ) : isYours ? (
        <View style={styles.messageAvatarPlaceholder} />
      ) : null}
    </View>
  );
}

export function JourneyDayChat({
  date,
  yours,
  theirs,
  friendDisplayName,
  friendAvatarUrl,
}: JourneyDayChatProps) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { width: windowWidth } = useWindowDimensions();
  const accentId = useAccentThemeStore((state) => state.accentId);
  const yoursBubbleColor = getAccentTheme(accentId).gradientColors[0];
  const bubbleMaxWidth = windowWidth * BUBBLE_MAX_WIDTH_RATIO;
  const user = useQuery(api.users.current);
  const storeAvatarUri = useOnboardingStore((state) => state.localAvatarUri);
  const currentUserAvatarUrl = user?.avatarUrl ?? storeAvatarUri;

  const messages = buildJourneyChatMessages({ date, yours, theirs });
  const yoursZoomPhoto = getFirstGlimt(yours)?.photoUrl;
  const theirsZoomPhoto = getFirstGlimt(theirs)?.photoUrl;
  const dateLabel = formatJourneyDate(date);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ChatHeader
        friendDisplayName={friendDisplayName}
        friendAvatarUrl={friendAvatarUrl}
        dateLabel={dateLabel}
      />

      {messages.length === 0 ? (
        <View style={styles.emptyChat}>
          <Text style={[styles.emptyChatText, { color: colors.textMuted }]}>
            No glimts shared this day.
          </Text>
        </View>
      ) : (
        messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            isZoomTarget={
              message.photoUrl === yoursZoomPhoto ||
              message.photoUrl === theirsZoomPhoto
            }
            friendAvatarUrl={friendAvatarUrl}
            currentUserAvatarUrl={currentUserAvatarUrl}
            bubbleMaxWidth={bubbleMaxWidth}
            yoursBubbleColor={yoursBubbleColor}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  chatHeader: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  chatHeaderAvatarWrap: {
    marginBottom: 4,
  },
  chatHeaderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: "700",
  },
  chatHeaderDate: {
    fontSize: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "100%",
  },
  messageRowYours: {
    justifyContent: "flex-end",
  },
  messageRowTheirs: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  messageAvatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  messageColumn: {
    gap: 4,
  },
  messageColumnYours: {
    alignItems: "flex-end",
  },
  messageColumnTheirs: {
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    gap: 8,
    overflow: "hidden",
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  timeYours: {
    textAlign: "right",
  },
  timeTheirs: {
    textAlign: "left",
  },
  emptyChat: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyChatText: {
    fontSize: 15,
  },
});
