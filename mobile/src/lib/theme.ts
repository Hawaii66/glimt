import { useColorScheme } from "react-native";

export type AppColors = {
  background: string;
  text: string;
  textMuted: string;
  surface: string;
  surfaceBorder: string;
  fill: string;
};

const light: AppColors = {
  background: "#FFFFFF",
  text: "#111111",
  textMuted: "rgba(17, 17, 17, 0.65)",
  surface: "#F5F0EB",
  surfaceBorder: "#E5DDD4",
  fill: "#EDE8E2",
};

const dark: AppColors = {
  background: "#000000",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.65)",
  surface: "#1C1917",
  surfaceBorder: "#2E2926",
  fill: "#262320",
};

export function useAppColors(): AppColors {
  return useColorScheme() === "dark" ? dark : light;
}
