import type { DailyJourney, DailyJourneyGlimt } from "@/lib/journey-types";

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

/** Earliest glimt on a side — top of the journey row stack. */
export function getEarliestGlimt(
  glimts?: DailyJourneyGlimt[],
): DailyJourneyGlimt | undefined {
  if (!glimts?.length) {
    return undefined;
  }
  return sortGlimtsChronological(glimts)[0];
}

/** Oldest-first ordering by send time. */
export function sortGlimtsChronological(
  glimts: DailyJourneyGlimt[],
): DailyJourneyGlimt[] {
  return [...glimts].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
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
