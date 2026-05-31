import {
  dayBeforeIsoDate,
  isJourneyToday as isSameJournalDay,
} from "@glimt/date";

import type { JourneyDay, JourneyGlimt } from "@/lib/journey-types";

export function isJourneyToday(
  isoDate: string,
  journalToday: string,
): boolean {
  return isSameJournalDay(isoDate, journalToday);
}

export function isJourneyComplete(
  yours?: JourneyGlimt[],
  theirs?: JourneyGlimt[],
): boolean {
  return Boolean(yours?.length && theirs?.length);
}

export function isCalendarLocked(
  isoDate: string,
  journalToday: string,
): boolean {
  return isJourneyToday(isoDate, journalToday);
}

export function isMeetLocked(
  journey: Pick<JourneyDay, "meetLock" | "unlockedAt">,
): boolean {
  return Boolean(journey.meetLock && !journey.unlockedAt);
}

export function isRowLocked(
  journey: Pick<JourneyDay, "meetLock" | "unlockedAt">,
  isoDate: string,
  journalToday: string,
): boolean {
  if (isCalendarLocked(isoDate, journalToday)) {
    return true;
  }
  return isMeetLocked(journey);
}

/** @deprecated Use isRowLocked with journey metadata */
export function isJourneyLocked(
  isoDate: string,
  journalToday: string,
): boolean {
  return isCalendarLocked(isoDate, journalToday);
}

export function formatJourneyDate(
  isoDate: string,
  journalToday: string,
): string {
  if (isoDate === journalToday) {
    return "Today";
  }

  const yesterday = dayBeforeIsoDate(journalToday);
  if (isoDate === yesterday) {
    return "Yesterday";
  }

  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
