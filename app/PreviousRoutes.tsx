import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Importer les icônes
import CustomTabBar from "../components/CustomTabBar";
import { useNavigation } from "@react-navigation/native";

export default function PreviousRoutes() {
  const navigation = useNavigation();
  const routes = [
    {
      recette: 253,
      date: "12/01/2024",
      startTime: "08:00",
      endTime: "10:00",
      licensePlate: "ABC-123",
      km: 120,
    },
    {
      recette: 300,
      date: "15/01/2024",
      startTime: "09:00",
      endTime: "11:30",
      licensePlate: "XYZ-456",
      km: 150,
    },
    {
      recette: 180,
      date: "20/01/2024",
      startTime: "07:30",
      endTime: "09:45",
      licensePlate: "LMN-789",
      km: 100,
    },
    {
      recette: 253,
      date: "12/01/2024",
      startTime: "08:00",
      endTime: "10:00",
      licensePlate: "ABC-123",
      km: 120,
    },
    {
      recette: 300,
      date: "15/01/2024",
      startTime: "09:00",
      endTime: "11:30",
      licensePlate: "XYZ-456",
      km: 150,
    },
    {
      recette: 180,
      date: "20/01/2024",
      startTime: "07:30",
      endTime: "09:45",
      licensePlate: "LMN-789",
      km: 100,
    },
  ];

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { marginTop: 80 }]}>
          Historique des shifts
        </Text>

        {routes.map((route, index) => (
          <View key={index} style={styles.routeCard}>
            <Text style={styles.routeTitle}>
              Recette : {route.recette}€ (Brut)
            </Text>
            <Text style={styles.routeDate}>Date: {route.date}</Text>
            <View style={styles.routeInfo}>
              <View style={styles.infoItem}>
                <MaterialIcons name="access-time" size={20} color="#555" />
                <Text style={styles.infoText}>
                  {route.startTime} - {route.endTime}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="directions-car" size={20} color="#555" />
                <Text style={styles.infoText}>{route.licensePlate}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="map" size={20} color="#555" />
                <Text style={styles.infoText}>{route.km} km</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <CustomTabBar activeTab="PreviousRoutes" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60, // Pour ne pas chevaucher la barre d'onglets
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  routeCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "90%",
    alignSelf: "center", // Centrer la carte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  routeDate: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  routeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
});
