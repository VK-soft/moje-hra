// ...existing code...
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const themeColors = {
  green: ['#11998e', '#38ef7d'],
  blue: ['#2193b0', '#6dd5ed'],
  red: ['#cb2d3e', '#ef473a'],
  yellow: ['#f7971e', '#ffd200'],
};

type Theme = keyof typeof themeColors;

interface Settings {
  roundDuration: number;
  breakDuration: number;
  rounds: number;
  theme: Theme;
}

interface TimerState {
  isRunning: boolean;
  isBreak: boolean;
  currentRound: number;
  remainingTime: number;
  statusMessage: string;
  currentFact: string;
}

interface Workout {
  id: string;
  date: number;
  roundDuration: number;
  breakDuration: number;
  totalRounds: number;
  completedRounds: number;
  totalTime: number; // in seconds
  difficulty?: 'easy' | 'medium' | 'hard';
  notes?: string;
}

interface TimerContextType {
  settings: Settings;
  timerState: TimerState;
  workouts: Workout[];
  updateSettings: (newSettings: Partial<Settings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  saveWorkout: (difficulty?: 'easy' | 'medium' | 'hard', notes?: string, completedRoundsOverride?: number) => void;
  deleteWorkout: (id: string) => void;
  updateWorkoutDifficulty: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const facts = [
  "Boxing burns up to 800 calories per hour! 🔥",
  "Muhammad Ali's famous shuffle wasn't just for show - it helped with footwork.",
  "A boxer's punch can generate up to 1,300 pounds of force!",
  "Shadow boxing improves coordination and muscle memory.",
  "Professional boxers train 4-6 hours daily on average.",
];

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    roundDuration: 180,
    breakDuration: 60,
    rounds: 3,
    theme: 'green',
  });

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isBreak: false,
    currentRound: 1,
    remainingTime: 180,
    statusMessage: '',
    currentFact: facts[0],
  });

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);

  // Load settings and workouts from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      const savedWorkouts = await AsyncStorage.getItem('workouts');
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setTimerState(prev => ({ ...prev, remainingTime: parsed.roundDuration }));
      }
      
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const saveWorkoutsToStorage = async (workoutsToSave: Workout[]) => {
    try {
      await AsyncStorage.setItem('workouts', JSON.stringify(workoutsToSave));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);

    // If timer is not running and not in break and we're on the first round,
    // update remainingTime so UI reflects new round duration immediately.
    setTimerState(prev => {
      if (!prev.isRunning && !prev.isBreak && prev.currentRound === 1) {
        return { ...prev, remainingTime: updated.roundDuration };
      }
      return prev;
    });
  };

  const startTimer = () => {
    if (!workoutStartTime) {
      setWorkoutStartTime(Date.now());
    }
    setTimerState(prev => ({ ...prev, isRunning: true, statusMessage: '' }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimerState({
      isRunning: false,
      isBreak: false,
      currentRound: 1,
      remainingTime: settings.roundDuration,
      statusMessage: '',
      currentFact: facts[Math.floor(Math.random() * facts.length)],
    });
    setWorkoutStartTime(null);
  };

  // saveWorkout now accepts optional completedRoundsOverride so callers (tick) can pass the correct completedRounds
  const saveWorkout = async (difficulty?: 'easy' | 'medium' | 'hard', notes?: string, completedRoundsOverride?: number) => {
    if (!workoutStartTime) return;

    const totalTime = Math.floor((Date.now() - workoutStartTime) / 1000);
    
    const workout: Workout = {
      id: Date.now().toString(),
      date: Date.now(),
      roundDuration: settings.roundDuration,
      breakDuration: settings.breakDuration,
      totalRounds: settings.rounds,
      completedRounds: completedRoundsOverride ?? timerState.currentRound,
      totalTime,
      difficulty,
      notes,
    };

    const updatedWorkouts = [workout, ...workouts];
    setWorkouts(updatedWorkouts);
    await saveWorkoutsToStorage(updatedWorkouts);
    setWorkoutStartTime(null);
  };

  const deleteWorkout = async (id: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    setWorkouts(updatedWorkouts);
    await saveWorkoutsToStorage(updatedWorkouts);
  };

  const updateWorkoutDifficulty = async (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const updatedWorkouts = workouts.map(w => 
      w.id === id ? { ...w, difficulty } : w
    );
    setWorkouts(updatedWorkouts);
    await saveWorkoutsToStorage(updatedWorkouts);
  };

  const tick = () => {
    // We'll set this flag inside the state updater so we can trigger saveWorkout after update.
    let shouldSave = false;
    let saveCompletedRounds: number | undefined = undefined;

    setTimerState(prev => {
      // If still time left, just decrement
      if (prev.remainingTime > 1) {
        return { ...prev, remainingTime: prev.remainingTime - 1 };
      }

      // Time hit zero (or 1 -> finishing tick)
      if (!prev.isBreak) {
        // Round finished
        if (prev.currentRound >= settings.rounds) {
          // All rounds completed -> stop timer and mark to save workout
          shouldSave = true;
          saveCompletedRounds = settings.rounds;
          return {
            ...prev,
            isRunning: false,
            remainingTime: 0,
            statusMessage: 'Workout Complete! Great job!',
          };
        } else {
          // Start break
          return {
            ...prev,
            isBreak: true,
            remainingTime: settings.breakDuration,
            currentFact: facts[Math.floor(Math.random() * facts.length)],
          };
        }
      } else {
        // Break finished, start next round
        return {
          ...prev,
          isBreak: false,
          currentRound: prev.currentRound + 1,
          remainingTime: settings.roundDuration,
        };
      }
    });

    if (shouldSave) {
      // fire-and-forget, no need to await in tick
      saveWorkout(undefined, undefined, saveCompletedRounds);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        settings,
        timerState,
        workouts,
        updateSettings,
        startTimer,
        pauseTimer,
        resetTimer,
        tick,
        saveWorkout,
        deleteWorkout,
        updateWorkoutDifficulty,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
}
// ...existing code...