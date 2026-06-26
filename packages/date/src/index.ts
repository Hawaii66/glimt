import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const FALLBACK_TIMEZONE = "UTC";

export function validateIanaTimezone(timezone: string): string {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

export function resolveUserTimezone(timezone: string | undefined): string {
  if (!timezone) {
    return FALLBACK_TIMEZONE;
  }
  return validateIanaTimezone(timezone);
}

export function dayDateFromTimestamp(
  timestamp: number,
  timezone: string,
): string {
  validateIanaTimezone(timezone);
  return formatInTimeZone(new Date(timestamp), timezone, "yyyy-MM-dd");
}

export function todayIsoDate(now = Date.now(), timezone: string): string {
  return dayDateFromTimestamp(now, timezone);
}

export function tomorrowIsoDate(now = Date.now(), timezone: string): string {
  validateIanaTimezone(timezone);
  const zoned = toZonedTime(new Date(now), timezone);
  return formatInTimeZone(addDays(zoned, 1), timezone, "yyyy-MM-dd");
}

export function isDayEnded(
  date: string,
  now = Date.now(),
  timezone: string,
): boolean {
  return date < todayIsoDate(now, timezone);
}

export function isJourneyToday(
  isoDate: string,
  journalToday: string,
): boolean {
  return isoDate === journalToday;
}

export function localHour(now = Date.now(), timezone: string): number {
  validateIanaTimezone(timezone);
  return Number(formatInTimeZone(new Date(now), timezone, "H"));
}

export function localMinute(now = Date.now(), timezone: string): number {
  validateIanaTimezone(timezone);
  return Number(formatInTimeZone(new Date(now), timezone, "m"));
}

export function startOfLocalDayTimestamp(
  isoDate: string,
  timezone: string,
): number {
  validateIanaTimezone(timezone);
  return fromZonedTime(`${isoDate}T00:00:00`, timezone).getTime();
}

export function dayBeforeIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
