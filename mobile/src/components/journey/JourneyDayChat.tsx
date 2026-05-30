import { useQuery } from "convex/react";
import { Link } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JourneyGlimtImage } from "@/components/journey/JourneyGlimtImage";
import { UserAvatar } from "@/components/UserAvatar";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { getAccentTheme, type AccentThemeId } from "@/lib/accent-themes";
import { formatGlimtSentTime } from "@/lib/format-glimt-time";
import { formatJourneyDate } from "@/lib/format-journey-date";
import type { DailyJourneyGlimt } from "@/lib/glimt-mock-data";
import {
  buildJourneyChatMessages,
  getFirstChatMessage,
  type JourneyChatMessage,
} from "@/lib/journey-chat";
import { useAppColors } from "@/lib/theme";
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
  friendAccentId: AccentThemeId;
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
      <View style={styles.chatHeaderAvatarWrap}>
        <UserAvatar
          imageUri={friendAvatarUrl || null}
          displayName={friendDisplayName}
          size={56}
          backgroundColor={colors.fill}
          borderColor={colors.surfaceBorder}
          borderWidth={1}
        />
      </View>
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
  friendDisplayName,
  currentUserAvatarUrl,
  currentUserDisplayName,
  bubbleMaxWidth,
  yoursBubbleColor,
  theirsBubbleColor,
}: {
  message: JourneyChatMessage;
  isZoomTarget: boolean;
  friendAvatarUrl: string;
  friendDisplayName: string;
  currentUserAvatarUrl?: string | null;
  currentUserDisplayName: string;
  bubbleMaxWidth: number;
  yoursBubbleColor: string;
  theirsBubbleColor: string;
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
        <UserAvatar
          imageUri={friendAvatarUrl || null}
          displayName={friendDisplayName}
          size={AVATAR_SIZE}
          backgroundColor={colors.fill}
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
              backgroundColor: isYours ? yoursBubbleColor : theirsBubbleColor,
              borderColor: "transparent",
            },
          ]}
        >
          {isZoomTarget ? (
            <Link.AppleZoomTarget>{imageContent}</Link.AppleZoomTarget>
          ) : (
            imageContent
          )}
          <Text style={[styles.caption, { color: "#FFFFFF" }]}>
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

      {isYours ? (
        <UserAvatar
          imageUri={currentUserAvatarUrl}
          displayName={currentUserDisplayName}
          size={AVATAR_SIZE}
          backgroundColor={colors.fill}
        />
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
  friendAccentId,
}: JourneyDayChatProps) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { width: windowWidth } = useWindowDimensions();
  const { accentTheme } = useCurrentUserAccentTheme();
  const yoursBubbleColor = getAccentTheme(accentTheme).gradientColors[0];
  const theirsBubbleColor = getAccentTheme(friendAccentId).gradientColors[0];
  const bubbleMaxWidth = windowWidth * BUBBLE_MAX_WIDTH_RATIO;
  const user = useQuery(api.users.current);
  const storeAvatarUri = useOnboardingStore((state) => state.localAvatarUri);
  const storeDisplayName = useOnboardingStore((state) => state.displayName);
  const currentUserAvatarUrl = user?.avatarUrl ?? storeAvatarUri;
  const currentUserDisplayName = user?.name ?? storeDisplayName ?? "";

  const messages = buildJourneyChatMessages({ date, yours, theirs });
  const firstMessage = getFirstChatMessage({ date, yours, theirs });
  const dateLabel = formatJourneyDate(date);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.fill }]}
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
            isZoomTarget={message.id === firstMessage?.id}
            friendAvatarUrl={friendAvatarUrl}
            friendDisplayName={friendDisplayName}
            currentUserAvatarUrl={currentUserAvatarUrl}
            currentUserDisplayName={currentUserDisplayName}
            bubbleMaxWidth={bubbleMaxWidth}
            yoursBubbleColor={yoursBubbleColor}
            theirsBubbleColor={theirsBubbleColor}
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
    width: "100%",
  },
  messageRowYours: {
    justifyContent: "flex-end",
  },
  messageRowTheirs: {
    justifyContent: "flex-start",
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
