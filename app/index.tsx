import { useTimer } from "@/components/TimerContext";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const FACTS = [
  "25 minut soustředění zvyšuje produktivitu o 40 %.",
  "Krátké pauzy zlepšují dlouhodobou paměť.",
  "Mozek se dokáže intenzivně soustředit jen omezenou dobu.",
  "Pravidelné pauzy snižují stres a únavu.",
  "Technika pomodoro pomáhá bojovat s prokrastinací.",
];

export default function Home() {
  const { settings } = useTimer();
  const [timeLeft, setTimeLeft] = useState(settings.roundDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentRound, setCurrentRound] = useState(1); // aktuální kolo
  const [fact, setFact] = useState(FACTS[0]);
  const notificationSent = useRef(false);

  // reset časovače při změně nastavení
  useEffect(() => {
    setTimeLeft(isBreak ? settings.breakDuration : settings.roundDuration);
  }, [settings, isBreak]);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined = undefined;

    if (isRunning) {
      if (!notificationSent.current) {
        const endTime = new Date(Date.now() + timeLeft * 1000);
        const endHours = endTime.getHours().toString().padStart(2, "0");
        const endMinutes = endTime.getMinutes().toString().padStart(2, "0");

        sendNotification(
          isBreak ? "Break Time" : "Fight Time",
          isBreak
            ? `Užij si pauzu! Konec ${endHours}:${endMinutes}`
            : `Čas na soustředění! Konec ${endHours}:${endMinutes}`
        );
        notificationSent.current = true;
      }

      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCycleEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isBreak, timeLeft, settings]);

  const handleCycleEnd = () => {
    setIsRunning(false);
    notificationSent.current = false;

    if (!isBreak) {
      // skončilo kolo, začíná pauza
      setIsBreak(true);
      setTimeLeft(settings.breakDuration);
      showRandomFact();
      sendNotification("Kolo dokončeno!", "Teď je čas na pauzu.");
    } else {
      // skončila pauza, začíná další kolo
      if (currentRound < settings.rounds) {
        setIsBreak(false);
        setTimeLeft(settings.roundDuration);
        setCurrentRound((prev) => prev + 1);
        showRandomFact();
        sendNotification("Pauza skončila!", "Zpátky do boje 💪");
      } else {
        // poslední kolo skončilo
        setIsBreak(false);
        setTimeLeft(settings.roundDuration);
        setCurrentRound(1);
        showRandomFact();
        sendNotification("Trénink dokončen!", "Gratuluji, dokončil jsi všechna kola!");
      }
    }
  };

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

  const showRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * FACTS.length);
    setFact(FACTS[randomIndex]);
  };

  const handleRestart = () => {
    setTimeLeft(isBreak ? settings.breakDuration : settings.roundDuration);
    setIsRunning(false);
    notificationSent.current = false;
    setCurrentRound(1);
    showRandomFact();
  };

  const handleStartPause = () => setIsRunning((prev) => !prev);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <LinearGradient colors={["#11998e", "#38ef7d"]} style={styles.container}>
      <Text style={styles.title}>{isBreak ? "Break" : "Fight"}</Text>
      <Text style={styles.roundText}>
        Kolo {currentRound} / {settings.rounds}
      </Text>

      <Progress.Circle
        size={200}
        progress={timeLeft / (isBreak ? settings.breakDuration : settings.roundDuration)}
        showsText={true}
        formatText={() => `${minutes}:${seconds.toString().padStart(2, "0")}`}
        color="#fff"
        thickness={10}
        borderWidth={0}
        unfilledColor="rgba(255,255,255,0.2)"
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStartPause}>
          <Text style={styles.buttonText}>{isRunning ? "Pause" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fact}>{fact}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  roundText: { fontSize: 20, color: "#fff", marginBottom: 20, fontWeight: "600" },
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
});
