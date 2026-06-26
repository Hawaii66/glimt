export const PHOTO_BORDER_COLOR = "#FFFFFF";

export const TILE_CORNER_RADIUS = 18;
export const TILE_BORDER_WIDTH = 8;
export const AVATAR_SIZE = 40;
export const AVATAR_OFFSET = -10;
export const TILE_SCALE = 0.95;

export function tileRotation(index: number): `${number}deg` {
  return `${Math.pow(-1, index + 1) * 2}deg`;
}

export function tileRotationDegrees(
  index: number,
  showRotation: boolean,
): number {
  if (!showRotation) {
    return 0;
  }

  return Math.pow(-1, index + 1) * 2;
}
