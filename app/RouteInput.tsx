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
import TesseractOcr from "react-native-tesseract-ocr";
import CustomTabBar from "../components/CustomTabBar";
import Icon from "react-native-vector-icons/FontAwesome"; // Importer l'icône

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
  const [shiftStarted, setShiftStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Nouvel état pour les photos des coins du véhicule
  const [cornerPhotos, setCornerPhotos] = useState<string[]>(
    Array(4).fill(null)
  );

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

  useEffect(() => {
    if (shiftStarted) {
      setTimerInterval(
        setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000)
      );
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [shiftStarted]);

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
      await extractTextFromImage(imageUri);
    }
  };

  const handleCornerPhotoUpload = async (index: number) => {
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
      const updatedPhotos = [...cornerPhotos];
      updatedPhotos[index] = imageUri; // Mettre à jour l'image pour le coin correspondant
      setCornerPhotos(updatedPhotos);
    }
  };

  const extractTextFromImage = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      const text = await TesseractOcr.recognize(imageUri, "eng", tessOptions);
      console.log("Texte extrait :", text);

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

  const handleStartShift = async () => {
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission de localisation refusée !");
      setIsLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      console.log("Localisation de début :", location);

      const { latitude, longitude } = location.coords;

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const street = address[0]?.street || "Adresse inconnue";
      const city = address[0]?.city || "Ville inconnue";
      const postalCode = address[0]?.postalCode || "Code postal inconnu";
      const houseNumber = address[0]?.name || "Numéro inconnu";

      Alert.alert(
        "Shift commencé",
        `Votre shift a démarré avec succès à partir de ${houseNumber}, ${street}, ${city}, ${postalCode}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShiftStarted(true);
              setStartTime(new Date());
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la localisation:",
        error
      );
      alert("Erreur lors de la récupération de la localisation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndShift = () => {
    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - (startTime?.getTime() || 0)) / 60000
    );
    Alert.alert("Shift terminé", `Durée du shift : ${duration} minutes.`);
    setShiftStarted(false);
    setElapsedTime(0);
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
        <Text style={styles.title}>Feuille de route</Text>

        {!shiftStarted && (
          <>
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
            <TextInput
              style={styles.input}
              value={heureDebut}
              editable={false}
            />

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

            {/* Boutons pour prendre des photos des coins du véhicule */}
            <Text style={styles.cornerTitle}>Photos des coins du véhicule</Text>
            {["Avant", "Arrière", "Côté Droit", "Côté Gauche"].map(
              (label, index) => (
                <View key={index} style={styles.cornerContainer}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handleCornerPhotoUpload(index)}
                  >
                    <Icon name="camera" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText}>{label}</Text>{" "}
                    {/* Assurez-vous que le texte est dans un composant <Text> */}
                  </TouchableOpacity>
                  {cornerPhotos[index] && (
                    <Image
                      source={{ uri: cornerPhotos[index] }}
                      style={styles.image}
                    />
                  )}
                </View>
              )
            )}
          </>
        )}

        {!shiftStarted && (
          <TouchableOpacity
            style={styles.validateButton}
            onPress={handleStartShift}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.validateText}>Commencer</Text>
            )}
          </TouchableOpacity>
        )}

        {shiftStarted && (
          <View style={styles.shiftContainer}>
            <Text style={styles.shiftText}>Shift en cours...</Text>
            <Text style={styles.timerText}>
              {formatElapsedTime(elapsedTime)}
            </Text>
            <TouchableOpacity style={styles.endButton} onPress={handleEndShift}>
              <Text style={styles.validateText}>Terminer le Shift</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: "row", // Pour aligner l'icône et le texte
    justifyContent: "center", // Centrer le contenu
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10, // Espacement entre l'icône et le texte
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
  shiftContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  shiftText: {
    fontSize: 20,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  endButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cornerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  cornerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
});
