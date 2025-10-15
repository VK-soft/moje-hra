// _layout.tsx
import { themeColors, TimerProvider, useTimer } from "@/components/TimerContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";

function TabsLayout() {
  const { settings } = useTimer();
  const [tabBarBg, setTabBarBg] = useState("#11998e");

  useEffect(() => {
    if (settings && settings.theme && themeColors[settings.theme]) {
      const colors = themeColors[settings.theme];
      const bottomColor = colors[colors.length - 1];
      setTabBarBg(bottomColor);
    }
  }, [settings]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarStyle: {
          backgroundColor: tabBarBg,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
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
  );
}

export default function RootLayout() {
  return (
    <TimerProvider>
      <TabsLayout />
    </TimerProvider>
  );
}