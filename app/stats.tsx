// stats.tsx
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

export default function StatsScreen() {
  return (
    <LinearGradient
      colors={["#11998e", "#38ef7d"]}
      style={styles.container}
    >
      <Text>Statistiky</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});