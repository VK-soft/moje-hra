import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { themeColors, useTimer } from "../components/TimerContext";

export default function SettingsScreen() {
  const { settings, updateSettings, resetTimer } = useTimer(); // <-- resetTimer je nyní součástí TimerContext

  const [modalVisible, setModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<"round" | "break" | "rounds" | null>(null);

  const openPicker = (type: "round" | "break" | "rounds") => {
    setPickerType(type);
    setModalVisible(true);
  };

  const closePicker = () => {
    setModalVisible(false);
    setPickerType(null);
    resetTimer(); // automaticky resetuje timer po uložení
  };

  return (
    <LinearGradient colors={themeColors[settings.theme]} style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Round duration */}
      <TouchableOpacity
        style={styles.settingGroup}
        onPress={() => openPicker("round")}
      >
        <Text style={styles.label}>
          ⏱️ Round duration: {Math.floor(settings.roundDuration / 60)}m{" "}
          {settings.roundDuration % 60}s
        </Text>
      </TouchableOpacity>

      {/* Break duration */}
      <TouchableOpacity
        style={styles.settingGroup}
        onPress={() => openPicker("break")}
      >
        <Text style={styles.label}>
          ☕ Break: {Math.floor(settings.breakDuration / 60)}m{" "}
          {settings.breakDuration % 60}s
        </Text>
      </TouchableOpacity>

      {/* Number of rounds */}
      <TouchableOpacity
        style={styles.settingGroup}
        onPress={() => openPicker("rounds")}
      >
        <Text style={styles.label}>🔁 Rounds: {settings.rounds}</Text>
      </TouchableOpacity>

      {/* Theme */}
      <Text style={[styles.label, { marginTop: 30 }]}>🎨 Theme</Text>
      <View style={styles.themes}>
        {(["green", "blue", "red", "yellow"] as const).map((theme) => (
          <TouchableOpacity
            key={theme}
            style={[
              styles.themeButton,
              settings.theme === theme && styles.activeButton,
            ]}
            onPress={() => updateSettings({ theme })}
          >
            <Text style={styles.buttonText}>{theme.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal with pickers */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Round picker */}
            {pickerType === "round" && (
              <View style={styles.pickerRow}>
                <Picker
                  selectedValue={Math.floor(settings.roundDuration / 60)}
                  style={{ flex: 1 }}
                  onValueChange={(val) =>
                    updateSettings({
                      roundDuration: val * 60 + (settings.roundDuration % 60),
                    })
                  }
                >
                  {Array.from({ length: 61 }, (_, i) => (
                    <Picker.Item key={i} label={`${i} min`} value={i} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={settings.roundDuration % 60}
                  style={{ flex: 1 }}
                  onValueChange={(val) =>
                    updateSettings({
                      roundDuration: Math.floor(settings.roundDuration / 60) * 60 + val,
                    })
                  }
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={`${i} s`} value={i} />
                  ))}
                </Picker>
              </View>
            )}

            {/* Break picker */}
            {pickerType === "break" && (
              <View style={styles.pickerRow}>
                <Picker
                  selectedValue={Math.floor(settings.breakDuration / 60)}
                  style={{ flex: 1 }}
                  onValueChange={(val) =>
                    updateSettings({
                      breakDuration: val * 60 + (settings.breakDuration % 60),
                    })
                  }
                >
                  {Array.from({ length: 61 }, (_, i) => (
                    <Picker.Item key={i} label={`${i} min`} value={i} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={settings.breakDuration % 60}
                  style={{ flex: 1 }}
                  onValueChange={(val) =>
                    updateSettings({
                      breakDuration: Math.floor(settings.breakDuration / 60) * 60 + val,
                    })
                  }
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={`${i} s`} value={i} />
                  ))}
                </Picker>
              </View>
            )}

            {/* Rounds picker */}
            {pickerType === "rounds" && (
              <Picker
                selectedValue={settings.rounds}
                onValueChange={(val) => updateSettings({ rounds: val })}
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <Picker.Item key={i + 1} label={`${i + 1}`} value={i + 1} />
                ))}
              </Picker>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={closePicker}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "white" },

  settingGroup: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  label: { fontSize: 16, color: "white", textAlign: "center" },

  themes: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 10 },
  themeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    margin: 8,
    borderRadius: 10,
  },
  activeButton: { borderWidth: 2, borderColor: "white" },
  buttonText: { color: "white", fontWeight: "600" },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  pickerRow: { flexDirection: "row", justifyContent: "center" },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#1E88E5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
