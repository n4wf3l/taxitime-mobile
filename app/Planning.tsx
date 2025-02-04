import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import CustomTabBar from "../components/CustomTabBar";

interface Schedule {
  id: string;
  driver: string;
  time: string;
  route: string;
}

const schedules: Schedule[] = [
  {
    id: "1",
    driver: "John Doe",
    time: "08:00 AM - 10:00 AM",
    route: "Route A",
  },
  {
    id: "2",
    driver: "Jane Smith",
    time: "10:30 AM - 12:30 PM",
    route: "Route B",
  },
  {
    id: "3",
    driver: "Mike Johnson",
    time: "01:00 PM - 03:00 PM",
    route: "Route C",
  },
  {
    id: "4",
    driver: "Emily Davis",
    time: "03:30 PM - 05:30 PM",
    route: "Route D",
  },
];

const renderItem = ({ item }: { item: Schedule }) => (
  <View style={styles.scheduleItem}>
    <Text style={styles.driverName}>{item.driver}</Text>
    <Text style={styles.scheduleTime}>{item.time}</Text>
    <Text style={styles.route}>{item.route}</Text>
  </View>
);

export default function Planning() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");

  const openModal = (type: string) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Planning</Text>
            <Text style={styles.subtitle}>Upcoming Driver Schedules</Text>

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

            <View style={styles.calendarContainer}>
              <Text style={styles.calendarTitle}>Calendrier</Text>
              <View style={styles.weekContainer}>
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                  (day) => (
                    <View key={day} style={styles.dayContainer}>
                      <Text style={styles.dayText}>{day}</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      <CustomTabBar activeTab="Planning" />

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
            <Button title="Fermer" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 20,
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
