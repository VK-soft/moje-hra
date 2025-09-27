import { createContext, ReactNode, useContext, useState } from "react";

type Theme = "green" | "blue" | "red" | "yellow";

type TimerSettings = {
  roundDuration: number;
  breakDuration: number;
  rounds: number;
  theme: Theme;
};

type TimerState = {
  remainingTime: number;
  currentRound: number;
  isRunning: boolean;
  isBreak: boolean;
  statusMessage: string | null; // Completed!
  currentFact: string;          // aktuální fakt pro pauzu
};

type TimerContextType = {
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;

  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void; // volá se každou sekundu
};

const FACTS = [
  "25 minutes of focus increases productivity by 40%.",
  "Short breaks improve long-term memory.",
  "The brain can focus intensively only for a limited time.",
  "Regular breaks reduce stress and fatigue.",
  "Pomodoro technique helps fight procrastination.",
];

const defaultSettings: TimerSettings = {
  roundDuration: 3 * 60,
  breakDuration: 60,
  rounds: 3,
  theme: "green",
};

const defaultTimerState: TimerState = {
  remainingTime: defaultSettings.roundDuration,
  currentRound: 1,
  isRunning: false,
  isBreak: false,
  statusMessage: null,
  currentFact: FACTS[0],
};

const TimerContext = createContext<TimerContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  timerState: defaultTimerState,
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimer: () => {},
  tick: () => {},
});

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const startTimer = () => setTimerState(prev => ({ ...prev, isRunning: true, statusMessage: null }));
  const pauseTimer = () => setTimerState(prev => ({ ...prev, isRunning: false }));

  const resetTimer = () => {
    setTimerState({
      remainingTime: settings.roundDuration,
      currentRound: 1,
      isRunning: false,
      isBreak: false,
      statusMessage: null,
      currentFact: FACTS[0],
    });
  };

  const tick = () => {
    setTimerState(prev => {
      if (!prev.isRunning) return prev;

      if (prev.remainingTime <= 1) {
        if (!prev.isBreak) {
          if (prev.currentRound >= settings.rounds) {
            // poslední kolo dokončeno
            return { ...prev, isRunning: false, remainingTime: 0, statusMessage: "Completed!" };
          } else {
            // přechod na pauzu → vybere náhodný fakt
            const randomFact = FACTS[Math.floor(Math.random() * FACTS.length)];
            return {
              ...prev,
              isBreak: true,
              remainingTime: settings.breakDuration,
              currentFact: randomFact,
            };
          }
        } else {
          // konec pauzy → další kolo
          return {
            ...prev,
            isBreak: false,
            currentRound: prev.currentRound + 1,
            remainingTime: settings.roundDuration,
          };
        }
      }

      return { ...prev, remainingTime: prev.remainingTime - 1 };
    });
  };

  return (
    <TimerContext.Provider
      value={{
        settings,
        updateSettings,
        timerState,
        startTimer,
        pauseTimer,
        resetTimer,
        tick,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);

// barvy témat
export const themeColors: Record<Theme, string[]> = {
  green: ["#11998e", "#38ef7d"],
  blue: ["#2193b0", "#6dd5ed"],
  red: ["#cb2d3e", "#ef473a"],
  yellow: ["#f7971e", "#ffd200"],
};
