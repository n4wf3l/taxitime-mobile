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
import * as Location from "expo-location";
import CustomTabBar from "../components/CustomTabBar";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types"; // Assurez-vous que le chemin est correct

const tessOptions = {
  whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  blacklist: "!@#$%^&*()_+={}[]|;:'\"<>,.?/~`",
};

export default function RouteInput() {
  const [chauffeur, setChauffeur] = useState("Chauffeur");
  const [dateUtilisation, setDateUtilisation] = useState(
    new Date().toLocaleDateString()
  );
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); // Utilisez le type ici
  const [heureDebut, setHeureDebut] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [kmDebut, setKmDebut] = useState("");
  const [ticketPhoto, setTicketPhoto] = useState<string | null>(null);
  const [numeroLicence, setNumeroLicence] = useState("");
  const [nombrePrises, setNombrePrises] = useState("");
  const [kmEnCharge, setKmEnCharge] = useState("");
  const [chutes, setChutes] = useState("");
  const [kmTotaux, setKmTotaux] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState({
    avant: null,
    arriere: null,
    gauche: null,
    droit: null,
  });

  useEffect(() => {
    const updateHour = () => {
      setHeureDebut(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    const interval = setInterval(updateHour, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePhotoCapture = async (side: string) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission refusée",
        "Activez l'accès à la caméra dans les paramètres."
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log(`📸 Photo prise pour ${side}:`, imageUri);
      setPhotos((prevPhotos) => ({
        ...prevPhotos,
        [side]: imageUri,
      }));
    }
  };

  const handlePhotoUpload = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission d'accès à la caméra refusée !");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log("Photo taken, URI:", imageUri);

      if (!imageUri) {
        alert("Erreur: L'URI de l'image est invalide.");
        return;
      }

      setTicketPhoto(imageUri);
      await uploadImage(imageUri);
    } else {
      console.log("Photo capture was canceled.");
    }
  };

  const uploadImage = async (uri: string) => {
    if (!uri) {
      console.error("❌ Invalid URI received, stopping upload.");
      alert("Erreur: URI de l'image non valide.");
      return;
    }

    console.log("📤 Uploading image to backend:", uri);
    setIsProcessing(true);

    let formData = new FormData();

    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      console.log("✅ Image successfully converted to blob.");

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

  const handleStartShift = async () => {
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission de localisation refusée !");
      setIsLoading(false);
      return;
    }

    // Naviguer vers RouteOutput
    navigation.navigate("RouteOutput");
    setIsLoading(false); // Arrêtez le chargement après la navigation
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { marginTop: 80 }]}>Feuille de route</Text>

        <TextInput
          style={styles.input}
          value={chauffeur}
          onChangeText={setChauffeur}
          placeholder="Chauffeur"
        />

        <TextInput
          style={styles.input}
          value={dateUtilisation}
          editable={false}
        />
        <TextInput style={styles.input} value={heureDebut} editable={false} />

        <TextInput
          style={[styles.input, { color: "black" }]}
          value={kmDebut}
          onChangeText={setKmDebut}
          placeholder="KM début"
          keyboardType="numeric"
          placeholderTextColor="#D1D5DB"
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
          <Image
            source={{ uri: ticketPhoto }}
            style={{
              marginLeft: 100,
              width: 200,
              height: 200,
              marginVertical: 10,
            }}
          />
        )}

        <TextInput
          style={styles.input}
          value={numeroLicence}
          onChangeText={setNumeroLicence}
          placeholder="Numéro de licence"
          keyboardType="numeric"
          placeholderTextColor="#D1D5DB"
        />

        <TextInput
          style={styles.input}
          value={nombrePrises}
          onChangeText={setNombrePrises}
          placeholder="Nombre de prises"
          keyboardType="numeric"
          placeholderTextColor="#D1D5DB"
        />

        <TextInput
          style={styles.input}
          value={kmEnCharge}
          onChangeText={setKmEnCharge}
          placeholder="KM en charge"
          keyboardType="numeric"
          placeholderTextColor="#D1D5DB"
        />

        <TextInput
          style={styles.input}
          value={chutes}
          onChangeText={setChutes}
          placeholder="Chutes"
          keyboardType="numeric"
          placeholderTextColor="#D1D5DB"
        />

        <TextInput
          style={styles.input}
          value={kmTotaux}
          onChangeText={setKmTotaux}
          placeholder="KM totaux"
          keyboardType="numeric"
          placeholderTextColor="#D1D5DB"
        />

        {/* Photos des coins du véhicule */}
        <View style={styles.photoContainer}>
          {Object.entries(photos).map(([side, uri]) => (
            <TouchableOpacity
              key={side}
              style={styles.photoButton}
              onPress={() => handlePhotoCapture(side)}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.photo} />
              ) : (
                <>
                  <Icon
                    name={
                      side === "gauche"
                        ? "arrow-left"
                        : side === "droit"
                        ? "arrow-right"
                        : "car"
                    }
                    size={30}
                    color="rgba(231, 185, 33, 0.99)"
                  />
                  <Text style={styles.buttonText}>
                    {side === "avant"
                      ? "Avant"
                      : side === "arriere"
                      ? "Arrière"
                      : side === "gauche"
                      ? "Côté Gauche"
                      : "Côté Droit"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.infoText}>
          <Icon name="camera" size={14} color="#555" /> Appuyez sur un bouton
          pour prendre une photo
        </Text>

        <TouchableOpacity
          style={styles.validateButton}
          onPress={handleStartShift}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.validateText}>Commencer le shift</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CustomTabBar activeTab="RouteInput" />
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
  photoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  photoButton: {
    width: "48%", // 2 photos par ligne
    height: 140,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginTop: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#777",
    marginTop: 10,
  },
  validateButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  validateText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
