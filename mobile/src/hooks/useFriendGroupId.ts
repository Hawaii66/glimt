import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function useFriendGroupId(friendUserId: string | undefined) {
  const groupId = useQuery(
    api.friends.getGroupForFriend,
    friendUserId ? { friendUserId: friendUserId as Id<"users"> } : "skip",
  );

  return {
    groupId: groupId ?? undefined,
    isLoading: friendUserId !== undefined && groupId === undefined,
  };
}
