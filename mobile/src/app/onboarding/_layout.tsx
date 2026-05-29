import { Stack } from "expo-router";

import { useAppColors } from "@/lib/theme";

export default function OnboardingLayout() {
  const colors = useAppColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
