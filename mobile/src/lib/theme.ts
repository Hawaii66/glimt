import { useColorScheme } from "react-native";

export type AppColors = {
  background: string;
  text: string;
  textMuted: string;
};

const light: AppColors = {
  background: "#FFFFFF",
  text: "#111111",
  textMuted: "rgba(17, 17, 17, 0.7)",
};

const dark: AppColors = {
  background: "#000000",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.7)",
};

export function useAppColors(): AppColors {
  return useColorScheme() === "dark" ? dark : light;
}
