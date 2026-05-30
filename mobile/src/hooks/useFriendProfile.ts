import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import {
  resolveAccentThemeId,
  type AccentThemeId,
} from "@/lib/accent-themes";

export type FriendProfile = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
  accentId: AccentThemeId;
};

export function useFriendProfile(friendId: string | undefined) {
  const result = useQuery(
    api.friends.getFriend,
    friendId ? { friendUserId: friendId as Id<"users"> } : "skip",
  );

  if (result === undefined) {
    return { friend: undefined, isLoading: true };
  }

  if (result === null) {
    return { friend: undefined, isLoading: false };
  }

  return {
    friend: {
      id: result.id,
      displayName: result.displayName,
      username: result.username,
      avatarUrl: result.avatarUrl,
      accentId: resolveAccentThemeId(
        result.accentTheme as AccentThemeId | undefined,
      ),
    },
    isLoading: false,
  };
}
