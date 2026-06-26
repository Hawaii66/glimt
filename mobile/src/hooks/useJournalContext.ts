import { useQuery } from "convex/react";
import { useMemo } from "react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function useJournalContext(friendUserId?: string) {
  const context = useQuery(api.journals.getJournalContext);

  const friendContext = useMemo(() => {
    if (!friendUserId || !context) {
      return null;
    }

    return (
      context.todayByGroup.find(
        (entry) => entry.friendUserId === (friendUserId as Id<"users">),
      ) ?? null
    );
  }, [context, friendUserId]);

  const journalTodayByFriendId = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of context?.todayByGroup ?? []) {
      map.set(entry.friendUserId, entry.today);
    }
    return map;
  }, [context]);

  return {
    context,
    friendContext,
    journalTodayByFriendId,
    isLoading: context === undefined,
  };
}
