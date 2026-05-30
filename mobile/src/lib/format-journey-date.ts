import type { DailyJourney } from "@/lib/glimt-mock-data";
import type { DailyJourneyGlimt } from "@/lib/glimt-mock-data";

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function todayIsoDate(now = new Date()): string {
  const d = startOfDay(now);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isJourneyToday(isoDate: string, now = new Date()): boolean {
  const date = parseIsoDate(isoDate);
  const today = startOfDay(now);
  const target = startOfDay(date);
  return today.getTime() === target.getTime();
}

export function isJourneyComplete(
  yours?: DailyJourneyGlimt[],
  theirs?: DailyJourneyGlimt[],
): boolean {
  return Boolean(yours?.length && theirs?.length);
}

export function isCalendarLocked(isoDate: string, now = new Date()): boolean {
  return isJourneyToday(isoDate, now);
}

export function isMeetLocked(
  journey: Pick<DailyJourney, "meetLock" | "unlockedAt">,
): boolean {
  return Boolean(journey.meetLock && !journey.unlockedAt);
}

export function isRowLocked(
  journey: Pick<DailyJourney, "meetLock" | "unlockedAt">,
  isoDate: string,
  now = new Date(),
): boolean {
  if (isCalendarLocked(isoDate, now)) {
    return true;
  }
  return isMeetLocked(journey);
}

/** @deprecated Use isRowLocked with journey metadata */
export function isJourneyLocked(
  isoDate: string,
  _yours?: DailyJourneyGlimt[],
  _theirs?: DailyJourneyGlimt[],
  now = new Date(),
): boolean {
  return isCalendarLocked(isoDate, now);
}

export function formatJourneyDate(isoDate: string, now = new Date()): string {
  const date = parseIsoDate(isoDate);
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
