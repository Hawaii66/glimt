import { dayBeforeIsoDate, isJourneyToday } from "@glimt/date";

import type { JourneyDay } from "@/lib/journey-types";

export function isCalendarLocked(
  isoDate: string,
  journalToday: string,
): boolean {
  return isJourneyToday(isoDate, journalToday);
}

export function isMeetLocked(
  journey: Pick<JourneyDay, "meetLocked" | "unlockedAt">,
): boolean {
  return Boolean(journey.meetLocked && !journey.unlockedAt);
}

export function isRowLocked(
  journey: Pick<JourneyDay, "meetLocked" | "unlockedAt">,
  isoDate: string,
  journalToday: string,
): boolean {
  if (isCalendarLocked(isoDate, journalToday)) {
    return true;
  }
  return isMeetLocked(journey);
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
