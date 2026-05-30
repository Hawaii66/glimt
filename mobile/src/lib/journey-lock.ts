import {
  isCalendarLocked,
  isMeetLocked,
  isRowLocked,
  todayIsoDate,
} from "@/lib/format-journey-date";
import type { DailyJourney } from "@/lib/glimt-mock-data";
import { getMockJourneysForFriend } from "@/lib/glimt-mock-data";
import { useMockUnlockStore } from "@/stores/mockUnlockStore";

export function resolveJourneyLockState(
  journey: DailyJourney,
  _friendId: string,
  runtimeUnlocked: boolean,
  now = new Date(),
): {
  calendarLocked: boolean;
  meetLocked: boolean;
  rowLocked: boolean;
  canNavigateToDay: boolean;
  showUnlockButton: boolean;
} {
  const merged: DailyJourney = runtimeUnlocked
    ? { ...journey, unlockedAt: journey.unlockedAt ?? Date.now() }
    : journey;

  const calendarLocked = isCalendarLocked(journey.date, now);
  const meetLocked = !calendarLocked && isMeetLocked(merged);
  const rowLocked = isRowLocked(merged, journey.date, now);

  return {
    calendarLocked,
    meetLocked,
    rowLocked,
    canNavigateToDay: !rowLocked,
    showUnlockButton: meetLocked,
  };
}

export function getMockJourneysWithUnlocks(friendId: string): DailyJourney[] {
  const journeys = getMockJourneysForFriend(friendId);
  const { isUnlocked } = useMockUnlockStore.getState();
  return journeys.map((journey) => {
    if (isUnlocked(friendId, journey.date)) {
      return {
        ...journey,
        unlockedAt: journey.unlockedAt ?? Date.now(),
      };
    }
    return journey;
  });
}

export function isFriendLockedToday(friendId: string, now = new Date()): boolean {
  const today = todayIsoDate(now);
  const journeys = getMockJourneysWithUnlocks(friendId);
  const todayJourney = journeys.find((j) => j.date === today);
  const runtimeUnlocked = useMockUnlockStore
    .getState()
    .isUnlocked(friendId, today);

  if (!todayJourney) {
    return isCalendarLocked(today, now);
  }

  const { rowLocked } = resolveJourneyLockState(
    todayJourney,
    friendId,
    runtimeUnlocked,
    now,
  );
  return rowLocked;
}
