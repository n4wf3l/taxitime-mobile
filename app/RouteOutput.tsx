import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomTabBar from "../components/CustomTabBar";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// types.ts
export type RootStackParamList = {
  Login: undefined;
  RouteInput: undefined;
  RouteOutput: undefined;
  PreviousRoutes: undefined;
  Planning: undefined;
};

export default function RouteOutput() {
  const [numeroLicence, setNumeroLicence] = useState("");
  const [nombrePrises, setNombrePrises] = useState("");
  const [kmEnCharge, setKmEnCharge] = useState("");
  const [chutes, setChutes] = useState("");
  const [kmTotaux, setKmTotaux] = useState("");
  const [ticketPhoto, setTicketPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // État pour le temps écoulé
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // Démarrer le chronomètre
    setTimerInterval(
      setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000)
    );

    // Nettoyer l'intervalle à la désactivation du composant
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const handlePhotoUpload = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission d'accès à la caméra refusée !");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setTicketPhoto(imageUri);
      await uploadImage(imageUri); // Appel à la fonction d'upload
    }
  };

  const uploadImage = async (uri: string) => {
    if (!uri) {
      console.error("❌ Invalid URI received, stopping upload.");
      Alert.alert("Erreur: URI de l'image non valide.");
      return;
    }

    console.log("📤 Uploading image to backend:", uri);
    setIsProcessing(true);

    let formData = new FormData();

    try {
      formData.append("file", {
        uri,
        name: "ticket.jpg",
        type: "image/jpeg",
      } as any);

      console.log("🚀 Sending image to backend...");

      let serverResponse = await fetch("http://192.168.0.14:3000/ocr/process", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!serverResponse.ok) {
        throw new Error(`❌ Server Error: ${serverResponse.status}`);
      }

      let data;
      try {
        data = await serverResponse.json();
      } catch (jsonError) {
        throw new Error("❌ Invalid JSON response from server");
      }

      console.log("✅ Received OCR data:", data);
      setNumeroLicence(data.noLicence || "");
      setNombrePrises(data.courses || "");
      setKmEnCharge(data.distCharge || "");
      setKmTotaux(data.distTotale || "");
      setChutes(data.nbreChutes || "");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "❌ Une erreur inconnue s'est produite.";
      console.error("🚨 Upload Error:", error);
      Alert.alert("Erreur", `Échec du traitement de l'image : ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndShift = () => {
    // Vérification des champs requis
    if (
      !numeroLicence ||
      !nombrePrises ||
      !kmEnCharge ||
      !chutes ||
      !kmTotaux
    ) {
      Alert.alert(
        "Erreur",
        "Veuillez remplir tous les champs du ticket de route avant de terminer le shift."
      );
      return;
    }

    Alert.alert("Shift terminé", "Votre shift a été terminé avec succès.");
    navigation.navigate("PreviousRoutes"); // Naviguer vers PreviousRoutes
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { marginTop: 80 }]}>Fin de Shift</Text>

        {/* Affichage du chronomètre */}
        <Text style={styles.timerText}>{formatElapsedTime(elapsedTime)}</Text>

        <TextInput
          style={styles.input}
          value={numeroLicence}
          onChangeText={setNumeroLicence}
          placeholder="Numéro de licence"
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          value={nombrePrises}
          onChangeText={setNombrePrises}
          placeholder="Nombre de prises"
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          value={kmEnCharge}
          onChangeText={setKmEnCharge}
          placeholder="KM en charge"
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          value={chutes}
          onChangeText={setChutes}
          placeholder="Chutes"
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          value={kmTotaux}
          onChangeText={setKmTotaux}
          placeholder="KM totaux"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePhotoUpload}
        >
          <Icon name="camera" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Ticket de route</Text>
        </TouchableOpacity>

        {isProcessing && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{ margin: 10 }}
          />
        )}

        {ticketPhoto && (
          <Image source={{ uri: ticketPhoto }} style={styles.image} />
        )}

        <TouchableOpacity style={styles.endButton} onPress={handleEndShift}>
          <Text style={styles.validateText}>Terminer le Shift</Text>
        </TouchableOpacity>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: "center",
    borderRadius: 8,
  },
  endButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  validateText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
