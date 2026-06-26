import { useMutation, useQuery } from "convex/react";

import {
  resolveAccentThemeId,
  type AccentThemeId,
} from "@/lib/accent-themes";
import { api } from "convex/_generated/api";

export function useCurrentUserAccentTheme() {
  const user = useQuery(api.users.current);
  const setAccentThemeMutation = useMutation(api.users.setAccentTheme);

  const accentTheme = resolveAccentThemeId(
    user?.accentTheme as AccentThemeId | undefined,
  );

  const setAccentTheme = (accentTheme: AccentThemeId) => {
    if (!user) {
      return;
    }
    void setAccentThemeMutation({ accentTheme });
  };

  return { accentTheme, setAccentTheme };
}
