import Colors, { palette } from '@/constants/Colors';

export type AppColors = {
  background: string;
  text: string;
  textMuted: string;
  surface: string;
  surfaceBorder: string;
  fill: string;
};

export function useAppColors(): AppColors {
  return {
    background: Colors.background,
    text: Colors.text,
    textMuted: Colors.textSecondary,
    surface: Colors.backgroundSecondary,
    surfaceBorder: palette.grid.none,
    fill: palette.background.secondary,
  };
}
