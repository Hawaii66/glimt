import { StyleSheet, View } from "react-native";

import { SettingsContent } from "@/components/settings/SettingsContent";

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <SettingsContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
