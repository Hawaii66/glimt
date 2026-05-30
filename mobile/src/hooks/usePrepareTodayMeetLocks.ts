import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useEffect, useRef } from "react";

/** Ensures today's journal day exists per friend group and rolls meet-lock once. */
export function usePrepareTodayMeetLocks(enabled: boolean) {
  const prepareToday = useMutation(api.journals.prepareTodayMeetLocksOnAppOpen);
  const preparedRef = useRef(false);

  useEffect(() => {
    if (!enabled || preparedRef.current) {
      return;
    }

    preparedRef.current = true;
    void prepareToday({}).catch(() => {
      preparedRef.current = false;
    });
  }, [enabled, prepareToday]);
}
