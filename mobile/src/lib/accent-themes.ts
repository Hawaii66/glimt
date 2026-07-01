export type AccentThemeId = "midnight";

export type AccentTheme = {
  id: AccentThemeId;
  label: string;
  gradientColors: readonly [string, string, string];
};

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: "midnight",
    label: "Midnight",
    gradientColors: ["#0E0D0C", "#1B1817", "#262220"],
  },
];

export const DEFAULT_ACCENT_THEME_ID: AccentThemeId = "midnight";

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

export function getAccentTheme(id: AccentThemeId | (string & {})): AccentTheme {
  const resolvedId = resolveAccentThemeId(id);
  return (
    ACCENT_THEMES.find((theme) => theme.id === resolvedId) ??
    ACCENT_THEMES[0]!
  );
}
