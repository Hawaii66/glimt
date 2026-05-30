import type { JourneyDay, JourneyGlimt } from "@/lib/journey-types";

type ApiJournalEntry = {
  photoUrl: string;
  caption?: string;
  sentAt: number;
};

type ApiJournalDay = {
  date: string;
  togetherUnlockedAt: number | null;
  yours: ApiJournalEntry[];
  theirs: ApiJournalEntry[];
};

function toJourneyGlimt(entry: ApiJournalEntry): JourneyGlimt {
  return {
    photoUrl: entry.photoUrl,
    caption: entry.caption,
    sentAt: new Date(entry.sentAt).toISOString(),
  };
}

export function toJourneyDay(apiDay: ApiJournalDay): JourneyDay {
  const yours = apiDay.yours.map(toJourneyGlimt);
  const theirs = apiDay.theirs.map(toJourneyGlimt);

  return {
    date: apiDay.date,
    yours: yours.length > 0 ? yours : undefined,
    theirs: theirs.length > 0 ? theirs : undefined,
    unlockedAt: apiDay.togetherUnlockedAt ?? undefined,
  };
}
