import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { toJourneyDay } from "@/lib/journal-adapters";
import type { JourneyDay } from "@/lib/journey-types";

export function useFriendJourney(friendUserId: string | undefined) {
  const days = useQuery(
    api.journals.listDaysForFriend,
    friendUserId ? { friendUserId: friendUserId as Id<"users"> } : "skip",
  );

  const journeys: JourneyDay[] = days?.map(toJourneyDay) ?? [];

  return {
    journeys,
    isLoading: days === undefined,
  };
}
