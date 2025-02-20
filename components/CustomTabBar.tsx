import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import LogoutButton from "../components/LogoutButton";

type ScreenName = "RouteInput" | "PreviousRoutes" | "Planning";

interface CustomTabBarProps {
  activeTab: ScreenName;
}

const handleLogout = () => {
  console.log("Déconnexion réussie !");
  // Ici tu peux ajouter ton code pour la déconnexion
  // Exemple : navigation.navigate("Login") ou enlever le token utilisateur
};

export default function CustomTabBar({ activeTab }: CustomTabBarProps) {
  const navigation = useNavigation();

  const handlePress = (screen: ScreenName) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screen }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress("PreviousRoutes")}
      >
        <FontAwesome
          name="history"
          size={30}
          color={activeTab === "PreviousRoutes" ? "#FFD700" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress("RouteInput")}
      >
        <FontAwesome
          name="road"
          size={30}
          color={activeTab === "RouteInput" ? "#FFD700" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress("Planning")}
      >
        <FontAwesome
          name="calendar"
          size={30}
          color={activeTab === "Planning" ? "#FFD700" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("Planning")}>
        <LogoutButton onLogout={handleLogout} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    alignItems: "center",
  },
});
