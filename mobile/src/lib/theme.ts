export type AppColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  surfaceBorder: string;
  fill: string;
  accent: string;
  accentSecondary: string;
  textOnAccent: string;
};

/** Analog darkroom palette from IDEA.md — dark mode only. */
export const APP_COLORS: AppColors = {
  background: "#0E0D0C",
  surface: "#1B1817",
  text: "#F2EFEA",
  textMuted: "#8C847E",
  surfaceBorder: "#262220",
  fill: "#1B1817",
  accent: "#FF7F00",
  accentSecondary: "#E65C00",
  textOnAccent: "#12100F",
};

export function useAppColors(): AppColors {
  return APP_COLORS;
}
