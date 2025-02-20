import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const shifts = [
  { day: "Lun", driver: "John Doe", phone: "+32476123456" },
  { day: "Mar", driver: "Jane Smith", phone: "+32476234567" },
  { day: "Mer", driver: "Mike Johnson", phone: "+32476345678" },
  { day: "Jeu", driver: "Emily Davis", phone: "+32476456789" },
  { day: "Ven", driver: "Paul Brown", phone: "+32476567890" },
  { day: "Sam", driver: "Lisa White", phone: "+32476678901" },
  { day: "Dim", driver: "Tom Black", phone: "+32476789012" },
];

const PlanningDetails = ({ currentDay }: { currentDay: string }) => {
  const currentIndex = shifts.findIndex((shift) => shift.day === currentDay);

  if (currentIndex === -1) return null; // Sécurité si le jour n'existe pas

  const currentDriver = shifts[currentIndex];
  const prevDriver = shifts[currentIndex - 1] || shifts[shifts.length - 1]; // Si Lundi, le précédent est Dimanche
  const nextDriver = shifts[currentIndex + 1] || shifts[0]; // Si Dimanche, le suivant est Lundi

  const contactNextDriver = () => {
    const whatsappUrl = `https://wa.me/${nextDriver.phone.replace("+", "")}`;
    Linking.openURL(whatsappUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Shift</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Jour :</Text>
        <Text style={styles.value}>{currentDriver.day}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Chauffeur Actuel :</Text>
        <Text style={styles.value}>{currentDriver.driver}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Chauffeur Précédent :</Text>
        <Text style={styles.value}>{prevDriver.driver}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Chauffeur Suivant :</Text>
        <Text style={styles.value}>{nextDriver.driver}</Text>
      </View>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={contactNextDriver}
      >
        <FontAwesome name="whatsapp" size={24} color="white" />
        <Text style={styles.whatsappText}>Contacter {nextDriver.driver}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: "center",
  },
  whatsappText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default PlanningDetails;
