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

type FriendProfileSource = {
  id: Id<"users">;
  displayName: string;
  username: string;
  avatarUrl: string;
  accentTheme?: string;
};

function toFriendProfile(source: FriendProfileSource): FriendProfile {
  return {
    id: source.id,
    displayName: source.displayName,
    username: source.username,
    avatarUrl: source.avatarUrl,
    accentId: resolveAccentThemeId(
      source.accentTheme as AccentThemeId | undefined,
    ),
  };
}

export function useFriendProfile(friendId: string | undefined) {
  const friends = useQuery(api.friends.listFriends);
  const result = useQuery(
    api.friends.getFriend,
    friendId ? { friendUserId: friendId as Id<"users"> } : "skip",
  );

  const cachedFriend = friendId
    ? friends?.find((friend) => friend.id === friendId)
    : undefined;

  if (result !== undefined) {
    if (result === null) {
      return { friend: undefined, isLoading: false };
    }
    return { friend: toFriendProfile(result), isLoading: false };
  }

  if (cachedFriend) {
    return { friend: toFriendProfile(cachedFriend), isLoading: false };
  }

  return { friend: undefined, isLoading: friends === undefined };
}
