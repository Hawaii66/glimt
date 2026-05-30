export type JourneyGlimt = {
  photoUrl: string;
  caption?: string;
  sentAt: string;
};

export type JourneyDay = {
  date: string;
  yours?: JourneyGlimt[];
  theirs?: JourneyGlimt[];
  meetLock?: boolean;
  unlockedAt?: number;
};

/** @deprecated Use JourneyGlimt */
export type DailyJourneyGlimt = JourneyGlimt;

/** @deprecated Use JourneyDay */
export type DailyJourney = JourneyDay;
