export type FriendGlimt = {
  id: string;
  displayName: string;
  username: string;
  photoUrl: string;
  avatarUrl: string;
};

export const MOCK_FRIEND_GLIMTS: FriendGlimt[] = [
  {
    id: "friend-1",
    displayName: "Alex Rivera",
    username: "alexr",
    photoUrl: "https://picsum.photos/seed/glimt-widget-1/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-1",
  },
  {
    id: "friend-2",
    displayName: "Jordan Lee",
    username: "jordanl",
    photoUrl: "https://picsum.photos/seed/glimt-widget-2/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-2",
  },
  {
    id: "friend-3",
    displayName: "Sam Chen",
    username: "samc",
    photoUrl: "https://picsum.photos/seed/glimt-widget-3/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-3",
  },
  {
    id: "friend-4",
    displayName: "Taylor Brooks",
    username: "taylorb",
    photoUrl: "https://picsum.photos/seed/glimt-widget-4/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-4",
  },
];
