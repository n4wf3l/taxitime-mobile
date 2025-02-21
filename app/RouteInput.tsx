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
import Icon from "react-native-vector-icons/FontAwesome";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

const tessOptions = {
  whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  blacklist: "!@#$%^&*()_+={}[]|;:'\"<>,.?/~`",
};

export default function RouteInput() {
  const [chauffeur, setChauffeur] = useState("Chauffeur");
  const [dateUtilisation, setDateUtilisation] = useState(
    new Date().toLocaleDateString()
  );
  const navigation = useNavigation();
  const [heureDebut, setHeureDebut] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const Stack = createStackNavigator();
  const [kmDebut, setKmDebut] = useState("");
  const [ticketPhoto, setTicketPhoto] = useState<string | null>(null);
  const [numeroLicence, setnumeroLicence] = useState("");
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

  const handlePhotoCapture = async (side: string) => {
    // Vérifier les permissions d'accès à la caméra
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Permission refusée ! Activez l'accès à la caméra dans les paramètres."
      );
      return;
    }

    // Ouvrir l'appareil photo
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Vérifier si l'utilisateur a pris une photo
    if (!result.canceled) {
      console.log(`Photo prise pour ${side}:`, result.assets[0].uri);
      setCornerPhotos((prev) => ({
        ...prev,
        [side]: result.assets[0].uri, // Sauvegarder l'image dans l'état
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

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { marginTop: 80 }]}>Feuille de route</Text>

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
              onPress={handlePhotoUpload} // Fonction pour prendre une photo
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

            <TextInput
              style={styles.input}
              value={numeroLicence}
              onChangeText={setnumeroLicence}
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

            {/* Photos des coins du véhicule */}
            <View style={styles.photosContainer}>
              <Text style={styles.title}>Photos du véhicule</Text>

              <View style={styles.grid}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePhotoCapture("avant")}
                >
                  <Icon name="car" size={30} color="rgba(231, 185, 33, 0.99)" />
                  <Text style={styles.buttonText}>Avant</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePhotoCapture("arriere")}
                >
                  <Icon name="car" size={30} color="rgba(231, 185, 33, 0.99)" />
                  <Text style={styles.buttonText}>Arrière</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePhotoCapture("gauche")}
                >
                  <Icon
                    name="arrow-left"
                    size={30}
                    color="rgba(231, 185, 33, 0.99)"
                  />
                  <Text style={styles.buttonText}>Côté Gauche</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePhotoCapture("droit")}
                >
                  <Icon
                    name="arrow-right"
                    size={30}
                    color="rgba(231, 185, 33, 0.99)"
                  />
                  <Text style={styles.buttonText}>Côté Droit</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.infoText}>
                <Icon name="camera" size={14} color="#555" /> Appuyez sur un
                bouton pour prendre une photo
              </Text>
            </View>
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

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePhotoUpload} // Fonction pour prendre une photo
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

            <TextInput
              style={styles.input}
              value={numeroLicence}
              onChangeText={setnumeroLicence}
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
  photosContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    width: "48%",
    height: 80,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Effet d'ombre Android
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginTop: 5,
  },
  infoText: {
    textAlign: "center",
    fontSize: 12,
    color: "#555",
    marginTop: 10,
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
