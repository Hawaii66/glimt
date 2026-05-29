import type { WidgetFamily } from "expo-widgets";

export const WIDGET_GRADIENT = {
  colors: ["#FF6B35", "#FFB347", "#FF8C42"],
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 1, y: 1 },
} as const;

export const PHOTO_BORDER_COLOR = "#FFFFFF";

export type TileMetrics = {
  outerPadding: number;
  cornerRadius: number;
  borderWidth: number;
  avatarSize: number;
  tileGap: number;
};

export function glimtCountForFamily(family: WidgetFamily | string): number {
  switch (family) {
    case "systemSmall":
      return 1;
    case "systemMedium":
      return 2;
    case "systemLarge":
      return 4;
    default:
      return 1;
  }
}

export function tileMetricsForFamily(family: WidgetFamily | string): TileMetrics {
  switch (family) {
    case "systemSmall":
      return {
        outerPadding: 10,
        cornerRadius: 14,
        borderWidth: 2.5,
        avatarSize: 28,
        tileGap: 0,
      };
    case "systemMedium":
      return {
        outerPadding: 8,
        cornerRadius: 12,
        borderWidth: 2,
        avatarSize: 22,
        tileGap: 6,
      };
    case "systemLarge":
      return {
        outerPadding: 6,
        cornerRadius: 10,
        borderWidth: 2,
        avatarSize: 18,
        tileGap: 5,
      };
    default:
      return {
        outerPadding: 10,
        cornerRadius: 14,
        borderWidth: 2.5,
        avatarSize: 28,
        tileGap: 0,
      };
  }
}
