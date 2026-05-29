export type FriendGlimt = {
  id: string;
  displayName: string;
  username: string;
  photoUrl: string;
  avatarUrl: string;
};

export type FriendRequest = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
};

export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: "request-1",
    displayName: "Casey Kim",
    username: "caseyk",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-request-1",
  },
  {
    id: "request-2",
    displayName: "Morgan Blake",
    username: "morganb",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-request-2",
  },
];

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
