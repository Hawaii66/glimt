import type { AccentThemeId } from "@/lib/accent-themes";
import type { JourneyDay, JourneyGlimt } from "@/lib/journey-types";

export type { JourneyDay, JourneyGlimt };
export type DailyJourneyGlimt = JourneyGlimt;
export type DailyJourney = JourneyDay;

export type FriendGlimt = {
  id: string;
  displayName: string;
  username: string;
  photoUrl: string;
  avatarUrl: string;
  accentId: AccentThemeId;
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
    accentId: "blue",
  },
  {
    id: "friend-2",
    displayName: "Jordan Lee",
    username: "jordanl",
    photoUrl: "https://picsum.photos/seed/glimt-widget-2/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-2",
    accentId: "purple",
  },
  {
    id: "friend-3",
    displayName: "Sam Chen",
    username: "samc",
    photoUrl: "https://picsum.photos/seed/glimt-widget-3/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-3",
    accentId: "ocean",
  },
  {
    id: "friend-4",
    displayName: "Taylor Brooks",
    username: "taylorb",
    photoUrl: "https://picsum.photos/seed/glimt-widget-4/400/400",
    avatarUrl: "https://i.pravatar.cc/128?u=glimt-friend-4",
    accentId: "pink",
  },
];

function isoDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function sentAtOnDate(
  isoDate: string,
  hours: number,
  minutes: number,
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

function glimt(
  isoDate: string,
  hours: number,
  minutes: number,
  photoUrl: string,
  caption: string,
): DailyJourneyGlimt {
  return {
    photoUrl,
    caption,
    sentAt: sentAtOnDate(isoDate, hours, minutes),
  };
}

const MOCK_JOURNEYS_BY_FRIEND: Record<string, DailyJourney[]> = {
  "friend-1": [
    {
      date: isoDateDaysAgo(0),
      yours: [
        glimt(
          isoDateDaysAgo(0),
          8,
          15,
          "https://picsum.photos/seed/journey-you-1-0/400/400",
          "Morning coffee",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(0),
          9,
          40,
          "https://picsum.photos/seed/journey-they-1-0a/400/400",
          "Sunrise run",
        ),
        glimt(
          isoDateDaysAgo(0),
          11,
          5,
          "https://picsum.photos/seed/journey-they-1-0b/400/400",
          "Second cup",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(1),
      yours: [
        glimt(
          isoDateDaysAgo(1),
          12,
          30,
          "https://picsum.photos/seed/journey-you-1-1a/400/400",
          "Late lunch",
        ),
        glimt(
          isoDateDaysAgo(1),
          18,
          45,
          "https://picsum.photos/seed/journey-you-1-1b/400/400",
          "Evening walk",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(1),
          15,
          10,
          "https://picsum.photos/seed/journey-they-1-1/400/400",
          "New book",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        glimt(
          isoDateDaysAgo(2),
          14,
          0,
          "https://picsum.photos/seed/journey-you-1-2/400/400",
          "Rainy day",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(3),
      yours: [
        glimt(
          isoDateDaysAgo(3),
          17,
          20,
          "https://picsum.photos/seed/journey-you-1-3/400/400",
          "Walk home",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(3),
          10,
          0,
          "https://picsum.photos/seed/journey-they-1-3/400/400",
          "Studio time",
        ),
        glimt(
          isoDateDaysAgo(3),
          21,
          30,
          "https://picsum.photos/seed/journey-they-1-3b/400/400",
          "Late studio",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(4),
      theirs: [
        glimt(
          isoDateDaysAgo(4),
          19,
          15,
          "https://picsum.photos/seed/journey-they-1-4/400/400",
          "Dinner out",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(5),
      yours: [
        glimt(
          isoDateDaysAgo(5),
          11,
          0,
          "https://picsum.photos/seed/journey-you-1-5/400/400",
          "Weekend vibes",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(5),
          10,
          30,
          "https://picsum.photos/seed/journey-they-1-5/400/400",
          "Farmers market",
        ),
      ],
    },
  ],
  "friend-2": [
    { date: isoDateDaysAgo(0) },
    {
      date: isoDateDaysAgo(1),
      theirs: [
        glimt(
          isoDateDaysAgo(1),
          18,
          0,
          "https://picsum.photos/seed/journey-they-2-1/400/400",
          "Homemade pasta",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        glimt(
          isoDateDaysAgo(2),
          17,
          30,
          "https://picsum.photos/seed/journey-you-2-2a/400/400",
          "Golden hour",
        ),
        glimt(
          isoDateDaysAgo(2),
          20,
          15,
          "https://picsum.photos/seed/journey-you-2-2b/400/400",
          "Street lights",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(2),
          19,
          0,
          "https://picsum.photos/seed/journey-they-2-2/400/400",
          "Park bench",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(3),
      yours: [
        glimt(
          isoDateDaysAgo(3),
          15,
          45,
          "https://picsum.photos/seed/journey-you-2-3/400/400",
          "Quick snack",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(3),
          16,
          30,
          "https://picsum.photos/seed/journey-they-2-3/400/400",
          "Cloudy sky",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(4),
      yours: [
        glimt(
          isoDateDaysAgo(4),
          21,
          0,
          "https://picsum.photos/seed/journey-you-2-4/400/400",
          "Movie night",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(4),
          21,
          30,
          "https://picsum.photos/seed/journey-they-2-4/400/400",
          "Popcorn",
        ),
      ],
    },
  ],
  "friend-3": [
    { date: isoDateDaysAgo(0) },
    {
      date: isoDateDaysAgo(1),
      yours: [
        glimt(
          isoDateDaysAgo(1),
          7,
          0,
          "https://picsum.photos/seed/journey-you-3-1/400/400",
          "Gym session",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(1),
          8,
          30,
          "https://picsum.photos/seed/journey-they-3-1a/400/400",
          "Smoothie bowl",
        ),
        glimt(
          isoDateDaysAgo(1),
          9,
          15,
          "https://picsum.photos/seed/journey-they-3-1b/400/400",
          "Coffee after",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        glimt(
          isoDateDaysAgo(2),
          8,
          15,
          "https://picsum.photos/seed/journey-you-3-2/400/400",
          "Commute view",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(2),
          12,
          0,
          "https://picsum.photos/seed/journey-they-3-2/400/400",
          "Sketch break",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(3),
      yours: [
        glimt(
          isoDateDaysAgo(3),
          16,
          0,
          "https://picsum.photos/seed/journey-you-3-3/400/400",
          "Tea time",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(4),
      yours: [
        glimt(
          isoDateDaysAgo(4),
          22,
          0,
          "https://picsum.photos/seed/journey-you-3-4/400/400",
          "Night walk",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(4),
          22,
          30,
          "https://picsum.photos/seed/journey-they-3-4/400/400",
          "City lights",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(6),
      yours: [
        glimt(
          isoDateDaysAgo(6),
          11,
          30,
          "https://picsum.photos/seed/journey-you-3-6/400/400",
          "Lazy Sunday",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(6),
          12,
          0,
          "https://picsum.photos/seed/journey-they-3-6/400/400",
          "Brunch spot",
        ),
      ],
    },
  ],
  "friend-4": [
    { date: isoDateDaysAgo(0) },
    {
      date: isoDateDaysAgo(1),
      yours: [
        glimt(
          isoDateDaysAgo(1),
          12,
          0,
          "https://picsum.photos/seed/journey-you-4-1/400/400",
          "Work break",
        ),
        glimt(
          isoDateDaysAgo(1),
          14,
          30,
          "https://picsum.photos/seed/journey-you-4-1b/400/400",
          "Desk plant",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(1),
          13,
          15,
          "https://picsum.photos/seed/journey-they-4-1/400/400",
          "Ice cream",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(2),
      yours: [
        glimt(
          isoDateDaysAgo(2),
          19,
          0,
          "https://picsum.photos/seed/journey-you-4-2/400/400",
          "Reading nook",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(2),
          15,
          0,
          "https://picsum.photos/seed/journey-they-4-2/400/400",
          "Record store",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(3),
      theirs: [
        glimt(
          isoDateDaysAgo(3),
          18,
          45,
          "https://picsum.photos/seed/journey-they-4-3/400/400",
          "Sunset drive",
        ),
      ],
    },
    {
      date: isoDateDaysAgo(5),
      yours: [
        glimt(
          isoDateDaysAgo(5),
          10,
          0,
          "https://picsum.photos/seed/journey-you-4-5/400/400",
          "Baking day",
        ),
      ],
      theirs: [
        glimt(
          isoDateDaysAgo(5),
          11,
          0,
          "https://picsum.photos/seed/journey-they-4-5/400/400",
          "Fresh bread",
        ),
      ],
    },
  ],
};

const MOCK_TEMPLATE_IDS = ["friend-1", "friend-2", "friend-3", "friend-4"] as const;

function getMockTemplateKey(friendId: string): (typeof MOCK_TEMPLATE_IDS)[number] {
  let hash = 0;
  for (let i = 0; i < friendId.length; i++) {
    hash = (hash + friendId.charCodeAt(i)) % MOCK_TEMPLATE_IDS.length;
  }
  return MOCK_TEMPLATE_IDS[hash]!;
}

export function getMockPhotoUrlForFriend(friendId: string): string {
  const template = MOCK_FRIEND_GLIMTS.find(
    (friend) => friend.id === getMockTemplateKey(friendId),
  );
  return template?.photoUrl ?? `https://picsum.photos/seed/${friendId}/400/400`;
}

export function getMockJourneysForFriend(friendId: string): DailyJourney[] {
  return MOCK_JOURNEYS_BY_FRIEND[getMockTemplateKey(friendId)] ?? [];
}
