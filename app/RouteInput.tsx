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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import TesseractOcr from "react-native-tesseract-ocr";
import CustomTabBar from "../components/CustomTabBar";

const tessOptions = {
  whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  blacklist: "!@#$%^&*()_+={}[]|;:'\"<>,.?/~`",
};

export default function RouteInput() {
  const [chauffeur, setChauffeur] = useState("Chauffeur");
  const [dateUtilisation, setDateUtilisation] = useState(
    new Date().toLocaleDateString()
  );
  const [heureDebut, setHeureDebut] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [kmDebut, setKmDebut] = useState("");
  const [ticketPhoto, setTicketPhoto] = useState<string | null>(null);
  const [nombrePrises, setNombrePrises] = useState("");
  const [kmEnCharge, setKmEnCharge] = useState("");
  const [chutes, setChutes] = useState("");
  const [kmTotaux, setKmTotaux] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePhotoUpload = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission d'accès à la caméra refusée !");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: true,
    });

    if (
      result &&
      !result.canceled &&
      result.assets &&
      result.assets.length > 0
    ) {
      const imageUri = result.assets[0].uri;
      setTicketPhoto(imageUri);
      await extractTextFromImage(imageUri); // Extraction directe après la photo
    }
  };

  const extractTextFromImage = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      const text = await TesseractOcr.recognize(imageUri, "eng", tessOptions);
      console.log("Texte extrait :", text); // Debugging

      // Regex pour extraire les données
      const prisesMatch = text.match(/Prises\s*[:\-]?\s*(\d+)/i);
      const kmEnChargeMatch = text.match(/KM\s*en\s*charge\s*[:\-]?\s*(\d+)/i);
      const chutesMatch = text.match(/Chutes\s*[:\-]?\s*(\d+)/i);
      const kmTotauxMatch = text.match(/KM\s*totaux\s*[:\-]?\s*(\d+)/i);

      if (prisesMatch) setNombrePrises(prisesMatch[1]);
      if (kmEnChargeMatch) setKmEnCharge(kmEnChargeMatch[1]);
      if (chutesMatch) setChutes(chutesMatch[1]);
      if (kmTotauxMatch) setKmTotaux(kmTotauxMatch[1]);

      if (!prisesMatch && !kmEnChargeMatch && !chutesMatch && !kmTotauxMatch) {
        alert("Impossible d'extraire les données attendues.");
      }
    } catch (err) {
      console.error("Erreur OCR:", err);
      alert("Erreur lors de la reconnaissance du texte.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = () => {
    console.log("Validation effectuée");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Feuille de route</Text>

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
          style={styles.input}
          value={kmDebut}
          onChangeText={setKmDebut}
          placeholder="KM début"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePhotoUpload}
        >
          <Text style={styles.uploadButtonText}>Prendre une photo</Text>
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
          style={styles.validateButton}
          onPress={handleValidate}
        >
          <Text style={styles.validateText}>Valider</Text>
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
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: "center",
    borderRadius: 8,
  },
  validateButton: {
    backgroundColor: "#28a745",
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
