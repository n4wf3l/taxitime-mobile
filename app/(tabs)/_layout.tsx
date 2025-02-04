import { Tabs } from "expo-router";
import React from "react";
import { IconSymbol } from "@/components/ui/IconSymbol"; // Assurez-vous que ce chemin est correct
import TabBarBackground from "@/components/ui/TabBarBackground"; // Assurez-vous que ce chemin est correct
import { Colors } from "@/constants/Colors"; // Assurez-vous que ce chemin est correct
import { useColorScheme } from "@/hooks/useColorScheme"; // Assurez-vous que ce chemin est correct

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: route.name === "index" ? { display: "none" } : {}, // Cacher pour index seulement
      })}
    >
      <Tabs.Screen
        name="index" // Écran d'accueil
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore" // Écran d'exploration
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="RouteInput" // Lien vers RouteInput
        options={{
          title: "Route Input",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
