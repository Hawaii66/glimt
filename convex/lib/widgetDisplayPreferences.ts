import { v } from "convex/values";

export const widgetDisplayPreferencesValidator = v.object({
  showWhiteBorder: v.boolean(),
  showRotation: v.boolean(),
  showAvatar: v.boolean(),
});

export type WidgetDisplayPreferences = {
  showWhiteBorder: boolean;
  showRotation: boolean;
  showAvatar: boolean;
};

export const DEFAULT_WIDGET_DISPLAY_PREFERENCES: WidgetDisplayPreferences = {
  showWhiteBorder: true,
  showRotation: true,
  showAvatar: true,
};

export function resolveWidgetDisplayPreferences(
  stored?: WidgetDisplayPreferences | null,
): WidgetDisplayPreferences {
  if (!stored) {
    return DEFAULT_WIDGET_DISPLAY_PREFERENCES;
  }

  return {
    showWhiteBorder: stored.showWhiteBorder,
    showRotation: stored.showRotation,
    showAvatar: stored.showAvatar,
  };
}
