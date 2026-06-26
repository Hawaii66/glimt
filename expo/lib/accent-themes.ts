export type AccentThemeId = 'midnight';

export type AccentTheme = {
  id: AccentThemeId;
  label: string;
  gradientColors: readonly [string, string, string];
};

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: 'midnight',
    label: 'Midnight',
    gradientColors: ['#020617', '#1E3A8A', '#581C87'],
  },
];

export const DEFAULT_ACCENT_THEME_ID: AccentThemeId = 'midnight';

export function getAccentTheme(id: AccentThemeId = DEFAULT_ACCENT_THEME_ID): AccentTheme {
  return ACCENT_THEMES.find((theme) => theme.id === id) ?? ACCENT_THEMES[0]!;
}
