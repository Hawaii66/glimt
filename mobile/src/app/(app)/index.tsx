import { Text, View } from "react-native";

import { useAppColors } from "@/lib/theme";

export default function HomeScreen() {
  const colors = useAppColors();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text }}>Welcome to Glimt!</Text>
    </View>
  );
}
