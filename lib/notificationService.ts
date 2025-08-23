import notifee, { AndroidImportance } from "@notifee/react-native";

// Spuštění notifikace
export async function sendNotification(title: string, body: string) {
  // Android channel (musí být vytvořený)
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction: { id: "default" },
      importance: AndroidImportance.HIGH,
    },
    ios: {
      sound: "default",
    },
  });
}
