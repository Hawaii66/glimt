import { isJourneyToday } from "@glimt/date";

import { isMeetLocked } from "@/lib/format-journey-date";
import type { JourneyDay } from "@/lib/journey-types";

export function resolveJourneyLockState(
  journey: JourneyDay,
  journalToday: string,
): {
  calendarLocked: boolean;
  meetLocked: boolean;
  rowLocked: boolean;
  canNavigateToDay: boolean;
  showUnlockButton: boolean;
} {
  const calendarLocked = isJourneyToday(journey.date, journalToday);
  const meetLocked = isMeetLocked(journey);
  const rowLocked = calendarLocked || meetLocked;

  return {
    calendarLocked,
    meetLocked,
    rowLocked,
    canNavigateToDay: !rowLocked,
    showUnlockButton: meetLocked && !calendarLocked,
  };
}
