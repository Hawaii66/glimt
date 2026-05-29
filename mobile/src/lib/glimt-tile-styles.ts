import {
  DEFAULT_ACCENT_THEME_ID,
  getAccentTheme,
} from "@/lib/accent-themes";

export const WIDGET_GRADIENT_COLORS = getAccentTheme(
  DEFAULT_ACCENT_THEME_ID,
).gradientColors;

export const PHOTO_BORDER_COLOR = "#FFFFFF";

export const TILE_CORNER_RADIUS = 18;
export const TILE_BORDER_WIDTH = 8;
export const AVATAR_SIZE = 40;
export const AVATAR_OFFSET = -10;
export const TILE_SCALE = 0.95;

export function tileRotation(index: number): `${number}deg` {
  return `${Math.pow(-1, index + 1) * 2}deg`;
}
