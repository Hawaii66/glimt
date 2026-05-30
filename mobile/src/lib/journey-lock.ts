import {
  isCalendarLocked,
  isMeetLocked,
  isRowLocked,
} from "@/lib/format-journey-date";
import type { JourneyDay } from "@/lib/journey-types";

export function resolveJourneyLockState(
  journey: JourneyDay,
  now = new Date(),
): {
  calendarLocked: boolean;
  meetLocked: boolean;
  rowLocked: boolean;
  canNavigateToDay: boolean;
  showUnlockButton: boolean;
} {
  const calendarLocked = isCalendarLocked(journey.date, now);
  const meetLocked = !calendarLocked && isMeetLocked(journey);
  const rowLocked = isRowLocked(journey, journey.date, now);

  return {
    calendarLocked,
    meetLocked,
    rowLocked,
    canNavigateToDay: !rowLocked,
    showUnlockButton: meetLocked,
  };
}
