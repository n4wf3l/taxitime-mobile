import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps, // Import du type
} from "@react-navigation/drawer";

export default function Sidebar(props: DrawerContentComponentProps) {
  // Typage de props
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => props.navigation.navigate("Logout")}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  logoutButton: {
    padding: 15,
    backgroundColor: "#FF5555",
    alignItems: "center",
    margin: 20,
    borderRadius: 5,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
});
