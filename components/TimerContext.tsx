// context/TimerContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type TimerSettings = {
  roundDuration: number; // v sekundách
  breakDuration: number; // v sekundách
  rounds: number;        // počet kol
};

type TimerContextType = {
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  resetSettings: () => void;
};

const defaultSettings: TimerSettings = {
  roundDuration: 3 * 60, // 25 minut default
  breakDuration: 1 * 60,  // 5 minut default
  rounds: 3,              // 4 kola default
};

const STORAGE_KEY = "timerSettings";

const TimerContext = createContext<TimerContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
});

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);

  // načtení ze storage při startu
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setSettings(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Nepodařilo se načíst nastavení", e);
      }
    };
    loadSettings();
  }, []);

  // ukládání při změně
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch((e) =>
      console.error("Nepodařilo se uložit nastavení", e)
    );
  }, [settings]);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <TimerContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
