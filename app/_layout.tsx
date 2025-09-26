// _layout.tsx
import { TimerProvider } from "@/components/TimerContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <TimerProvider>
      <Tabs
        screenOptions={{
          headerShown: false, // bez horního navigačního baru
          tabBarActiveTintColor: "#000",
          tabBarStyle: {
            backgroundColor: "transparent",
            position: "absolute",
            borderTopWidth: 0, // odstraní čáru nahoře
            elevation: 0, // Android stín
          },
        }}
      >
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: "Timer",
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name={focused ? "timer" : "timer-outline"} 
                size={30} 
              /> 
            ),
          }} 
        />
        <Tabs.Screen 
          name="settings" 
          options={{ 
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name={focused ? "settings" : "settings-outline"} 
                size={30} 
              /> 
            ),
          }} 
        />
        <Tabs.Screen 
          name="stats" 
          options={{ 
            title: "Stats",
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name={focused ? "bar-chart" : "bar-chart-outline"} 
                size={30} 
              /> 
            ),
          }} 
        />
      </Tabs>
    </TimerProvider>
  );
}
