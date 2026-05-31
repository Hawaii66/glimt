import { Platform } from "react-native";

export type LockVariant = "calendar" | "meet";

export type ImageSize = { width: number; height: number };

export const INWARD_TILT = 1;
export const LOCKED_CONNECTOR_SIZE = 36;
export const STACK_OFFSET = 8;
export const COUNT_INSET = 2;
export const AVATAR_CHIP_SIZE = 28;

export const BACK_ROTATION_OFFSETS = [-3, -1.5, -4, -2] as const;

export function stackRotation(
  baseTilt: number,
  index: number,
  total: number,
): `${number}deg` {
  if (index === total - 1) {
    return `${baseTilt}deg`;
  }
  const offset = BACK_ROTATION_OFFSETS[index] ?? -2;
  return `${baseTilt + offset}deg`;
}

export function tileShadowStyle(index: number) {
  return Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 + index },
      shadowOpacity: 0.1 + index * 0.04,
      shadowRadius: 3 + index,
    },
    android: {
      elevation: 2 + index,
    },
    default: {},
  });
}
