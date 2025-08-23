import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // bez horního navigačního baru
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Nastavení" }} />
      <Tabs.Screen name="stats" options={{ title: "Statistiky" }} />
    </Tabs>
  );
}
