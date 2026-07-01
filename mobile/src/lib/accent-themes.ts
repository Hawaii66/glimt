export type AccentThemeId =
  | "blue"
  | "pink"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "cyan"
  | "sunset"
  | "black"
  | "white"
  | "gray"
  | "polka"
  | "christmas"
  | "midnight"
  | "neon"
  | "ocean"
  | "candy"
  | "sakura"
  | "coffee"
  | "rainbow";

export type AccentTheme = {
  id: AccentThemeId;
  label: string;
  gradientColors: readonly [string, string, string];
};

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: "blue",
    label: "Blue",
    gradientColors: ["#1D4ED8", "#60A5FA", "#93C5FD"],
  },
  {
    id: "pink",
    label: "Pink",
    gradientColors: ["#DB2777", "#F472B6", "#FBCFE8"],
  },
  {
    id: "green",
    label: "Green",
    gradientColors: ["#15803D", "#4ADE80", "#BBF7D0"],
  },
  {
    id: "purple",
    label: "Purple",
    gradientColors: ["#6D28D9", "#A78BFA", "#DDD6FE"],
  },
  {
    id: "orange",
    label: "Orange",
    gradientColors: ["#EA580C", "#FB923C", "#FED7AA"],
  },
  {
    id: "red",
    label: "Red",
    gradientColors: ["#B91C1C", "#EF4444", "#FCA5A5"],
  },
  {
    id: "cyan",
    label: "Cyan",
    gradientColors: ["#0E7490", "#22D3EE", "#A5F3FC"],
  },
  {
    id: "sunset",
    label: "Sunset",
    gradientColors: ["#F97316", "#EF4444", "#EC4899"],
  },
  {
    id: "black",
    label: "Black",
    gradientColors: ["#000000", "#171717", "#404040"],
  },
  {
    id: "white",
    label: "White",
    gradientColors: ["#D4D4D4", "#FFFFFF", "#F5F5F5"],
  },
  {
    id: "gray",
    label: "Gray",
    gradientColors: ["#1F2937", "#6B7280", "#D1D5DB"],
  },
  {
    id: "polka",
    label: "Polka",
    gradientColors: ["#DC2626", "#FFFFFF", "#DC2626"],
  },
  {
    id: "christmas",
    label: "Christmas",
    gradientColors: ["#B91C1C", "#F9FAFB", "#15803D"],
  },
  {
    id: "midnight",
    label: "Midnight",
    gradientColors: ["#020617", "#1E3A8A", "#581C87"],
  },
  {
    id: "neon",
    label: "Neon",
    gradientColors: ["#22C55E", "#06B6D4", "#D946EF"],
  },
  {
    id: "ocean",
    label: "Ocean",
    gradientColors: ["#0C4A6E", "#0284C7", "#67E8F9"],
  },
  {
    id: "candy",
    label: "Candy",
    gradientColors: ["#F472B6", "#FDE047", "#67E8F9"],
  },
  {
    id: "sakura",
    label: "Sakura",
    gradientColors: ["#F9A8D4", "#FFF1F2", "#FB7185"],
  },
  {
    id: "coffee",
    label: "Coffee",
    gradientColors: ["#3E2723", "#795548", "#BCAAA4"],
  },
  {
    id: "rainbow",
    label: "Rainbow",
    gradientColors: ["#EF4444", "#EAB308", "#8B5CF6"],
  },
];

export const DEFAULT_ACCENT_THEME_ID: AccentThemeId = "blue";

const ACCENT_THEME_IDS = new Set(ACCENT_THEMES.map((theme) => theme.id));

function normalizeAccentThemeId(
  accentTheme?: string | null,
): AccentThemeId | null {
  if (!accentTheme) {
    return null;
  }

  if (ACCENT_THEME_IDS.has(accentTheme as AccentThemeId)) {
    return accentTheme as AccentThemeId;
  }

  return null;
}

export function resolveAccentThemeId(
  accentTheme?: string | null,
): AccentThemeId {
  return normalizeAccentThemeId(accentTheme) ?? DEFAULT_ACCENT_THEME_ID;
}

export function getAccentTheme(id: AccentThemeId | (string&{})): AccentTheme {
  const resolvedId = resolveAccentThemeId(id);
  return (
    ACCENT_THEMES.find((theme) => theme.id === resolvedId) ??
    ACCENT_THEMES.find((theme) => theme.id === DEFAULT_ACCENT_THEME_ID) ??
    ACCENT_THEMES[0]!
  );
}
