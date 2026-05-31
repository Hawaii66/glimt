import { Text, View } from "react-native";

import { styles } from "./styles";

export function GlimtCountLabel({ count }: { count: number }) {
  return (
    <View style={styles.countLabel}>
      <Text style={styles.countLabelText}>{count}</Text>
    </View>
  );
}
