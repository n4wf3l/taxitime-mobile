import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  Platform,
} from "react-native";
import CustomTabBar from "../components/CustomTabBar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import WeeklySchedule from "../components/WeeklySchedule";
import PlanningDetails from "../components/PlanningDetails";

interface Schedule {
  id: string;
  driver: string;
  time: string;
  route: string;
}

const handleLogout = () => {
  console.log("Déconnexion réussie !");
  // Ici tu peux ajouter ton code pour la déconnexion
  // Exemple : navigation.navigate("Login") ou enlever le token utilisateur
};

const schedules: Schedule[] = [];

export default function Planning() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [description, setDescription] = useState("");
  const navigation = useNavigation();
  const [startDate, setStartDate] = useState(new Date()); // ✅ Ajout de l'état
  const [endDate, setEndDate] = useState(new Date()); // ✅ Ajout de l'état

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate); // ✅ Utilisation correcte
    }
    setShowStartPicker(false);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (selectedDate < startDate) {
        alert("La date de fin ne peut pas être avant la date de début !");
      } else {
        setEndDate(selectedDate); // ✅ Utilisation correcte
      }
    }
    setShowEndPicker(false);
  };

  const openModal = (type: string) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      alert("Veuillez ajouter une description.");
      return;
    }

    console.log("Demande envoyée :", {
      type: modalType,
      description,
    });

    // Ici, tu peux ajouter l'envoi vers un backend ou une API

    alert("Demande envoyée avec succès !");
    setModalVisible(false); // Ferme la modal après l'envoi
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Ton contenu principal */}
        <Text style={styles.title}>Feuille de route</Text>
        {/* ... le reste du code */}
      </View>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.scheduleItem}>
            <Text style={styles.driverName}>{item.driver}</Text>
            <Text style={styles.scheduleTime}>{item.time}</Text>
            <Text style={styles.route}>{item.route}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, { marginTop: 80 }]}>Planning</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => openModal("congé")}
              >
                <Text style={styles.buttonText}>Demande de congé</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => openModal("travail")}
              >
                <Text style={styles.buttonText}>Demande de travail</Text>
              </TouchableOpacity>
            </View>
            <WeeklySchedule />
            <PlanningDetails currentDay={""} />
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      <CustomTabBar activeTab="Planning" />

      {/* Modal de demande */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "congé"
                ? "Demande de Congé"
                : "Demande de Travail"}
            </Text>

            <Text style={styles.modalText}>
              {modalType === "congé"
                ? "Formulaire de demande de congé."
                : "Formulaire de demande de travail."}
            </Text>

            {/* Sélection de la plage de dates */}
            <Text style={styles.label}>Du :</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleStartDateChange}
              />
            )}

            <Text style={styles.label}>Au :</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>{formatDate(endDate)}</Text>
            </TouchableOpacity>

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleEndDateChange}
              />
            )}

            {/* Champ pour la description */}
            <Text style={styles.label}>Description :</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ajoutez une description..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.buttonRow}>
              <Button title="Fermer" onPress={() => setModalVisible(false)} />
              <Button title="Envoyer" onPress={handleSubmit} color="#007BFF" />
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ flex: 1 }}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  calendarContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginHorizontal: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 60,
  },
  scheduleItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scheduleTime: {
    fontSize: 16,
    color: "#555",
  },
  route: {
    fontSize: 14,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});
