import { Platform } from "react-native";
import { endActivity, startActivity, updateActivity } from "react-native-live-activity";

let activityId: string | null = null;

export const startFocusActivity = async (duration: number, isBreak: boolean) => {
  if (Platform.OS !== "ios") return;
  const endDate = new Date(Date.now() + duration * 1000);

  activityId = await startActivity({
    name: "focus_timer",
    attributes: { state: isBreak ? "Break" : "Focus" },
    content: {
      title: isBreak ? "Break Time" : "Focus Time",
      body: `Zbývá ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`,
      startDate: new Date(),
      endDate,
    },
  });
};

export const updateFocusActivity = async (timeLeft: number, isBreak: boolean) => {
  if (Platform.OS !== "ios" || !activityId) return;

  await updateActivity(activityId, {
    content: {
      body: `Zbývá ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`,
    },
  });
};

export const endFocusActivity = async () => {
  if (Platform.OS !== "ios" || !activityId) return;
  await endActivity(activityId);
  activityId = null;
};
