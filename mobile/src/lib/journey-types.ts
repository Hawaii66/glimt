export type DailyJourneyGlimt = {
  photoUrl: string;
  caption?: string;
  sentAt: string;
};

export type DailyJourney = {
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
  meetLock?: boolean;
  unlockedAt?: number;
};
