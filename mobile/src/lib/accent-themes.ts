export type AccentThemeId =
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "teal";

export type AccentTheme = {
  id: AccentThemeId;
  label: string;
  gradientColors: readonly [string, string, string];
};

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: "orange",
    label: "Orange",
    gradientColors: ["#FF6B35", "#FFB347", "#FF8C42"],
  },
  {
    id: "blue",
    label: "Blue",
    gradientColors: ["#2563EB", "#60A5FA", "#38BDF8"],
  },
  {
    id: "green",
    label: "Green",
    gradientColors: ["#16A34A", "#4ADE80", "#86EFAC"],
  },
  {
    id: "purple",
    label: "Purple",
    gradientColors: ["#7C3AED", "#A78BFA", "#C4B5FD"],
  },
  {
    id: "pink",
    label: "Pink",
    gradientColors: ["#DB2777", "#F472B6", "#F9A8D4"],
  },
  {
    id: "teal",
    label: "Teal",
    gradientColors: ["#0D9488", "#2DD4BF", "#5EEAD4"],
  },
];

export const DEFAULT_ACCENT_THEME_ID: AccentThemeId = "blue";

export function resolveAccentThemeId(
  accentTheme?: AccentThemeId | null,
): AccentThemeId {
  return accentTheme ?? DEFAULT_ACCENT_THEME_ID;
}

export function getAccentTheme(id: AccentThemeId): AccentTheme {
  return (
    ACCENT_THEMES.find((theme) => theme.id === id) ??
    ACCENT_THEMES.find((theme) => theme.id === DEFAULT_ACCENT_THEME_ID) ??
    ACCENT_THEMES[0]!
  );
}
