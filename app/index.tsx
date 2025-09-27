import { themeColors, useTimer } from "@/components/TimerContext";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  const { settings, timerState, startTimer, pauseTimer, resetTimer, tick } = useTimer();
  const notificationSent = useRef(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // interval pro tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerState.isRunning && !timerState.statusMessage) {
      if (!notificationSent.current) {
        const endTime = new Date(Date.now() + timerState.remainingTime * 1000);
        const endHours = endTime.getHours().toString().padStart(2, "0");
        const endMinutes = endTime.getMinutes().toString().padStart(2, "0");

        sendNotification(
          timerState.isBreak ? "Break Time" : "Fight Time",
          timerState.isBreak
            ? `Enjoy your short break! Ends at ${endHours}:${endMinutes}`
            : `Time to focus! Ends at ${endHours}:${endMinutes}`
        );
        notificationSent.current = true;
      }

      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.statusMessage]);

  const sendNotification = async (title: string, body: string) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${body}`);
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: "default" },
      trigger: null,
    });
  };

  const handleStartPause = () => {
    timerState.isRunning ? pauseTimer() : startTimer();
  };

  const handleRestart = () => {
    resetTimer();
    notificationSent.current = false;
  };

  const minutes = Math.floor(timerState.remainingTime / 60);
  const seconds = timerState.remainingTime % 60;

  return (
    <LinearGradient colors={themeColors[settings.theme]} style={styles.container}>
      {timerState.statusMessage && (
        <Text style={styles.completedText}>{timerState.statusMessage}</Text>
      )}

      <Text style={styles.title}>{timerState.isBreak ? "Break" : "Fight"}</Text>

      <Progress.Circle
        size={200}
        progress={timerState.remainingTime / (timerState.isBreak ? settings.breakDuration : settings.roundDuration)}
        showsText={true}
        formatText={() => `${minutes}:${seconds.toString().padStart(2, "0")}`}
        color="#fff"
        thickness={10}
        borderWidth={0}
        unfilledColor="rgba(255,255,255,0.2)"
      />

      <View style={styles.roundInfo}>
        <Text style={styles.roundText}>
          Round {timerState.isBreak ? "-" : timerState.currentRound} / {settings.rounds}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStartPause}>
          <Text style={styles.buttonText}>{timerState.isRunning ? "Pause" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      {timerState.isBreak && (
        <Text style={styles.fact}>{timerState.currentFact}</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  completedText: { fontSize: 24, fontWeight: "bold", color: "#FFD700", marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 40 },
  buttonsContainer: { flexDirection: "row", marginTop: 30, gap: 20 },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { fontSize: 18, fontWeight: "600", color: "black" },
  fact: { marginTop: 40, fontSize: 16, color: "#fff", fontStyle: "italic", textAlign: "center" },
  roundInfo: { marginTop: 20 },
  roundText: { fontSize: 20, fontWeight: "600", color: "#fff" },
});
