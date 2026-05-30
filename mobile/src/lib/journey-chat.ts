import type { DailyJourney, DailyJourneyGlimt } from "@/lib/glimt-mock-data";
import { getMockJourneysForFriend } from "@/lib/glimt-mock-data";

export type JourneyChatSender = "yours" | "theirs";

export type JourneyChatMessage = {
  id: string;
  sender: JourneyChatSender;
  photoUrl: string;
  caption?: string;
  sentAt: string;
};

export function getFirstChatMessage(
  journey: DailyJourney,
): JourneyChatMessage | undefined {
  const messages = buildJourneyChatMessages(journey);
  return messages[0];
}

export function getFirstGlimt(
  glimts?: DailyJourneyGlimt[],
): DailyJourneyGlimt | undefined {
  if (!glimts?.length) {
    return undefined;
  }
  return glimts[glimts.length - 1];
}

export function getJourneyByDate(
  friendId: string,
  date: string,
): DailyJourney | undefined {
  return getMockJourneysForFriend(friendId).find(
    (journey) => journey.date === date,
  );
}

export function buildJourneyChatMessages(
  journey: DailyJourney,
): JourneyChatMessage[] {
  const messages: JourneyChatMessage[] = [];

  journey.yours?.forEach((glimt, index) => {
    messages.push({
      id: `yours-${index}-${glimt.sentAt}`,
      sender: "yours",
      photoUrl: glimt.photoUrl,
      caption: glimt.caption,
      sentAt: glimt.sentAt,
    });
  });

  journey.theirs?.forEach((glimt, index) => {
    messages.push({
      id: `theirs-${index}-${glimt.sentAt}`,
      sender: "theirs",
      photoUrl: glimt.photoUrl,
      caption: glimt.caption,
      sentAt: glimt.sentAt,
    });
  });

  return messages.sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}
