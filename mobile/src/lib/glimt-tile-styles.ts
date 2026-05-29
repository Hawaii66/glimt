export const WIDGET_GRADIENT_COLORS = ["#FF6B35", "#FFB347", "#FF8C42"] as const;

export const PHOTO_BORDER_COLOR = "#FFFFFF";

export const TILE_CORNER_RADIUS = 18;
export const TILE_BORDER_WIDTH = 8;
export const AVATAR_SIZE = 40;
export const AVATAR_OFFSET = -10;
export const TILE_SCALE = 0.95;

export function tileRotation(index: number): `${number}deg` {
  return `${Math.pow(-1, index + 1) * 2}deg`;
}
