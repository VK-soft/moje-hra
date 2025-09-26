// app/settings.tsx
import { useTimer } from "@/components/TimerContext";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function SettingsScreen() {
  const { settings, updateSettings } = useTimer();

  return (
    <LinearGradient
      colors={["#11998e", "#38ef7d"]}
      style={styles.container}
    >
      <Text style={styles.title}>Nastavení</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Délka kola (minuty):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={(settings.roundDuration / 60).toString()}
          onChangeText={(text) => {
            const minutes = parseInt(text) || 0;
            updateSettings({ roundDuration: minutes * 60 });
          }}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Délka pauzy (sekundy):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={settings.breakDuration.toString()}
          onChangeText={(text) => {
            const seconds = parseInt(text) || 0;
            updateSettings({ breakDuration: seconds });
          }}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Počet kol:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={settings.rounds.toString()}
          onChangeText={(text) => {
            const rounds = parseInt(text) || 1;
            updateSettings({ rounds });
          }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 40 },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 18, color: "#fff", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
  },
});
