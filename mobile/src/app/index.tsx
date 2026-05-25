import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomeScreen() {

  const data = useQuery(api.test.test, {
    name: "John",
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glimt</Text>
      <Text style={styles.subtitle}>Scaffolding ready — build the MVP here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
});
