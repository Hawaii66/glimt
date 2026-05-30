import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useEffect, useRef } from "react";

import type { DailyJourney, DailyJourneyGlimt } from "@/lib/journey-types";

type JournalEntry = {
  photoUrl: string;
  caption?: string;
  sentAt: number;
};

type JournalDay = {
  date: string;
  meetLocked: boolean;
  togetherUnlockedAt: number | null;
  yours: JournalEntry[];
  theirs: JournalEntry[];
};

function mapEntry(entry: JournalEntry): DailyJourneyGlimt {
  return {
    photoUrl: entry.photoUrl,
    caption: entry.caption,
    sentAt: new Date(entry.sentAt).toISOString(),
  };
}

function mapJournalDay(day: JournalDay): DailyJourney {
  return {
    date: day.date,
    yours: day.yours.length > 0 ? day.yours.map(mapEntry) : undefined,
    theirs: day.theirs.length > 0 ? day.theirs.map(mapEntry) : undefined,
    meetLock: day.meetLocked,
    unlockedAt: day.togetherUnlockedAt ?? undefined,
  };
}

export function useFriendJourney(
  groupId: Id<"friendGroups"> | null | undefined,
) {
  const syncMeetLocks = useMutation(api.journals.syncMeetLocksForGroup);
  const syncedGroupIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!groupId || syncedGroupIdRef.current === groupId) {
      return;
    }

    syncedGroupIdRef.current = groupId;
    void syncMeetLocks({ groupId }).catch(() => {
      syncedGroupIdRef.current = null;
    });
  }, [groupId, syncMeetLocks]);

  const days = useQuery(
    api.journals.listDays,
    groupId ? { groupId } : "skip",
  );

  const journeys = days?.map(mapJournalDay) ?? [];
  const isLoading = groupId !== undefined && groupId !== null && days === undefined;

  return {
    journeys,
    isLoading,
  };
}

export function useFriendJourneyDay(
  groupId: Id<"friendGroups"> | null | undefined,
  date: string | undefined,
) {
  const day = useQuery(
    api.journals.getDay,
    groupId && date ? { groupId, date } : "skip",
  );

  return {
    journey: day ? mapJournalDay(day) : undefined,
    isLoading:
      groupId !== undefined &&
      groupId !== null &&
      date !== undefined &&
      day === undefined,
  };
}
