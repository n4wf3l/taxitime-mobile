import React from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const LogoutButton = ({ onLogout }: { onLogout: () => void }) => {
  const confirmLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Oui", onPress: onLogout },
    ]);
  };

  return (
    <View>
      <TouchableOpacity onPress={confirmLogout} style={styles.button}>
        <Icon name="sign-out-alt" size={15} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#B22222",
    padding: 10,
    borderRadius: 30,
    elevation: 3, // Ombre Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default LogoutButton;
