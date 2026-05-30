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

export type DailyJourneyGlimt = {
  photoUrl: string;
  caption?: string;
};

export type DailyJourney = {
  date: string;
  yours?: DailyJourneyGlimt[];
  theirs?: DailyJourneyGlimt[];
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

function isoDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

const MOCK_JOURNEYS_BY_FRIEND: Record<string, DailyJourney[]> = {
  "friend-1": [
    {
      date: isoDateDaysAgo(0),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-1-0/400/400",
          caption: "Morning coffee",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-0a/400/400",
          caption: "Sunrise run",
        },
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-0b/400/400",
          caption: "Second cup",
        },
      ],
    },
    {
      date: isoDateDaysAgo(1),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-1-1a/400/400",
          caption: "Late lunch",
        },
        {
          photoUrl: "https://picsum.photos/seed/journey-you-1-1b/400/400",
          caption: "Evening walk",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-1/400/400",
          caption: "New book",
        },
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-1-2/400/400",
          caption: "Rainy day",
        },
      ],
    },
    {
      date: isoDateDaysAgo(3),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-1-3/400/400",
          caption: "Walk home",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-3/400/400",
          caption: "Studio time",
        },
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-3b/400/400",
          caption: "Late studio",
        },
      ],
    },
    {
      date: isoDateDaysAgo(4),
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-4/400/400",
          caption: "Dinner out",
        },
      ],
    },
    {
      date: isoDateDaysAgo(5),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-1-5/400/400",
          caption: "Weekend vibes",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-1-5/400/400",
          caption: "Farmers market",
        },
      ],
    },
  ],
  "friend-2": [
    { date: isoDateDaysAgo(0) },
    {
      date: isoDateDaysAgo(1),
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-2-1/400/400",
          caption: "Homemade pasta",
        },
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-2-2a/400/400",
          caption: "Golden hour",
        },
        {
          photoUrl: "https://picsum.photos/seed/journey-you-2-2b/400/400",
          caption: "Street lights",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-2-2/400/400",
          caption: "Park bench",
        },
      ],
    },
    {
      date: isoDateDaysAgo(3),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-2-3/400/400",
          caption: "Quick snack",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-2-3/400/400",
          caption: "Cloudy sky",
        },
      ],
    },
    {
      date: isoDateDaysAgo(4),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-2-4/400/400",
          caption: "Movie night",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-2-4/400/400",
          caption: "Popcorn",
        },
      ],
    },
  ],
  "friend-3": [
    { date: isoDateDaysAgo(0) },
    {
      date: isoDateDaysAgo(1),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-3-1/400/400",
          caption: "Gym session",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-3-1a/400/400",
          caption: "Smoothie bowl",
        },
        {
          photoUrl: "https://picsum.photos/seed/journey-they-3-1b/400/400",
          caption: "Coffee after",
        },
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-3-2/400/400",
          caption: "Commute view",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-3-2/400/400",
          caption: "Sketch break",
        },
      ],
    },
    {
      date: isoDateDaysAgo(3),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-3-3/400/400",
          caption: "Tea time",
        },
      ],
    },
    {
      date: isoDateDaysAgo(4),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-3-4/400/400",
          caption: "Night walk",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-3-4/400/400",
          caption: "City lights",
        },
      ],
    },
    {
      date: isoDateDaysAgo(6),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-3-6/400/400",
          caption: "Lazy Sunday",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-3-6/400/400",
          caption: "Brunch spot",
        },
      ],
    },
  ],
  "friend-4": [
    { date: isoDateDaysAgo(0) },
    {
      date: isoDateDaysAgo(1),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-4-1/400/400",
          caption: "Work break",
        },
        {
          photoUrl: "https://picsum.photos/seed/journey-you-4-1b/400/400",
          caption: "Desk plant",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-4-1/400/400",
          caption: "Ice cream",
        },
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-4-2/400/400",
          caption: "Reading nook",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-4-2/400/400",
          caption: "Record store",
        },
      ],
    },
    {
      date: isoDateDaysAgo(3),
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-4-3/400/400",
          caption: "Sunset drive",
        },
      ],
    },
    {
      date: isoDateDaysAgo(5),
      yours: [
        {
          photoUrl: "https://picsum.photos/seed/journey-you-4-5/400/400",
          caption: "Baking day",
        },
      ],
      theirs: [
        {
          photoUrl: "https://picsum.photos/seed/journey-they-4-5/400/400",
          caption: "Fresh bread",
        },
      ],
    },
  ],
};

export function getFriendById(friendId: string): FriendGlimt | undefined {
  return MOCK_FRIEND_GLIMTS.find((friend) => friend.id === friendId);
}

export function getMockJourneysForFriend(friendId: string): DailyJourney[] {
  return MOCK_JOURNEYS_BY_FRIEND[friendId] ?? [];
}
