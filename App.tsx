import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RouteInput from "./app/RouteInput";
import PreviousRoutes from "./app/PreviousRoutes";
import Planning from "./app/Planning";
import Index from "./app/(tabs)/index"; // Page de connexion

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Index} />
        <Stack.Screen name="RouteInput" component={RouteInput} />
        <Stack.Screen name="PreviousRoutes" component={PreviousRoutes} />
        <Stack.Screen name="Planning" component={Planning} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
