import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

import { getDeviceTimezone } from "@/lib/format-timezone";
import { api } from "convex/_generated/api";

export function useSyncTimezone(enabled: boolean) {
  const syncTimezone = useMutation(api.users.syncTimezone);
  const lastSyncedTimezone = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timezone = getDeviceTimezone();
    if (lastSyncedTimezone.current === timezone) {
      return;
    }

    lastSyncedTimezone.current = timezone;
    void syncTimezone({ timezone }).catch(() => {
      lastSyncedTimezone.current = null;
    });
  }, [enabled, syncTimezone]);
}
