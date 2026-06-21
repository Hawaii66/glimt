import { useMutation, useQuery } from "convex/react";

import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import {
  refreshFriendGlimtWidget,
} from "@/lib/widget-refresh";
import {
  resolveWidgetDisplayPreferences,
  type WidgetDisplayPreferences,
} from "convex/lib/widgetDisplayPreferences";
import { api } from "convex/_generated/api";

export function useWidgetDisplayPreferences() {
  const user = useQuery(api.users.current);
  const setPreferencesMutation = useMutation(
    api.users.setWidgetDisplayPreferences,
  );
  const { accentTheme } = useCurrentUserAccentTheme();

  const preferences = resolveWidgetDisplayPreferences(
    user?.widgetDisplayPreferences,
  );

  const setPreference = <K extends keyof WidgetDisplayPreferences>(
    key: K,
    value: WidgetDisplayPreferences[K],
  ) => {
    if (!user) {
      return;
    }

    const next = { ...preferences, [key]: value };
    void setPreferencesMutation({ preferences: next });
    void refreshFriendGlimtWidget(accentTheme, next);
  };

  return { preferences, setPreference };
}
