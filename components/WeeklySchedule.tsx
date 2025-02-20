import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // ✅ Import correct des icônes

const WeeklySchedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Fonction pour calculer les dates de la semaine en fonction de l'offset
  const getWeekDates = () => {
    const today = new Date();
    const currentMonday = new Date(
      today.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7)
    );
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + i);
      return {
        day: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i],
        date: date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
      };
    });
  };

  const weekDates = getWeekDates();

  // Shifts du chauffeur (exemple statique, peut être lié à une API)
  const shifts = {
    Lun: "Matin",
    Mar: "Nuit",
    Mer: "Matin",
    Jeu: "Nuit",
    Ven: "Matin",
    Sam: "Repos",
    Dim: "Nuit",
  };

  return (
    <View style={styles.container}>
      {/* Navigation entre les semaines */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setWeekOffset(weekOffset - 1)}
          style={styles.navButton}
        >
          <FontAwesome name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Planning des Shifts</Text>

        <TouchableOpacity
          onPress={() => setWeekOffset(weekOffset + 1)}
          style={styles.navButton}
        >
          <FontAwesome name="chevron-right" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Affichage des shifts */}
      <View style={styles.scheduleGrid}>
        {weekDates.map(({ day, date }) => (
          <View key={day} style={styles.dayContainer}>
            <Text style={styles.dayText}>
              {day} - {date}
            </Text>
            <Text
              style={[
                styles.shiftText,
                getShiftStyle(shifts[day as keyof typeof shifts]),
              ]}
            >
              {shifts[day as keyof typeof shifts]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Fonction pour styliser les shifts (jour = jaune foncé, nuit = violet, repos = gris)
const getShiftStyle = (shift: string) => {
  switch (shift) {
    case "Matin":
      return { backgroundColor: "#FFB300", color: "white" }; // Jaune foncé
    case "Nuit":
      return { backgroundColor: "#673AB7", color: "white" }; // Violet
    case "Repos":
      return { backgroundColor: "#B0BEC5", color: "white" }; // Gris
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  navButton: {
    padding: 10, // Ajout de padding pour bien toucher les flèches
  },
  scheduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayContainer: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  shiftText: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default WeeklySchedule;
