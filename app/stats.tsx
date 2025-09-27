// stats.tsx
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";
import { themeColors, useTimer } from "../components/TimerContext";

export default function StatsScreen() {
  const { settings, updateSettings } = useTimer();

  return (
    <LinearGradient
      colors={themeColors[settings.theme]}
      style={styles.container}
    >
      <Text>Statistiky</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});