/**
 * Glimt brand palette — "Analog Darkroom" (see IDEA.md).
 * Edit palette values here; semantic theme tokens below map them for UI use.
 */
export const palette = {
  background: {
    primary: '#0E0D0C',
    secondary: '#1B1817',
  },
  highlight: {
    safetyOrange: '#FF7F00',
    deepAmber: '#E65C00',
  },
  text: {
    cream: '#F2EFEA',
    filmGray: '#8C847E',
    deepCharcoal: '#12100F',
  },
  grid: {
    none: '#262220',
    key: '#5E2B00',
    active: '#B35300',
    legendary: '#FF7F00',
  },
} as const;

export type ThemeColorName = keyof typeof Colors;

const Colors = {
  text: palette.text.cream,
  textSecondary: palette.text.filmGray,
  textOnAccent: palette.text.deepCharcoal,
  background: palette.background.primary,
  backgroundSecondary: palette.background.secondary,
  tint: palette.highlight.safetyOrange,
  accent: palette.highlight.deepAmber,
  tabIconDefault: palette.text.filmGray,
  tabIconSelected: palette.highlight.safetyOrange,
  separator: palette.grid.none,
  link: palette.highlight.safetyOrange,
} as const;

export default Colors;
