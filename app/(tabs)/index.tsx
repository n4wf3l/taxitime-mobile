import { useRouter } from "expo-router"; // Importation du router
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Eye, EyeOff } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const API_URL = "http://192.168.0.14:3000/auth/login"; // Backend API

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter(); // Utilisation du router
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("✅ Login Successful:", data);

      // Store token & userId in AsyncStorage
      await AsyncStorage.setItem("token", data.accessToken);
      const decodedToken = JSON.parse(atob(data.accessToken.split(".")[1])); // Decode JWT
      await AsyncStorage.setItem("chauffeurId", decodedToken.sub); // Store user ID

      // Redirect to RouteInput after successful login
      router.push("/RouteInput");
    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Login Failed");
    }
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("../../assets/images/taxitimelogo.png")}
          style={styles.splashLogo}
        />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/taxigif.gif")}
          style={styles.backgroundGif}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.formWrapper}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.formContainer}>
                <Image
                  source={require("../../assets/images/taxitimelogo.png")}
                  style={styles.smallLogo}
                />
                <Text style={styles.description}>
                  Bienvenue sur TaxiTime ! Simplifiez votre quotidien de
                  chauffeur en quelques clics.
                </Text>

                {/* Input Email */}
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />

                {/* Input Mot de Passe avec Icône Eye */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Mot de passe"
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword} // Dynamique selon l'état
                    value={password}
                    onChangeText={setPassword}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={24} color="#888" /> // Icône Eye barrée
                    ) : (
                      <Eye size={24} color="#888" /> // Icône Eye normale
                    )}
                  </TouchableOpacity>
                </View>

                {/* Bouton de connexion */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    !(email && password) && styles.buttonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={!(email && password)}
                >
                  <Text style={styles.buttonText}>Se connecter</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>
                    Mot de passe oublié?
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  splashLogo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  backgroundGif: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    color: "white",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(167, 138, 44, 0.5)",
    zIndex: -1,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    opacity: 0.9,
  },
  smallLogo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 10,
  },
  description: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  input: {
    width: "100%",
    backgroundColor: "#ddd",
    color: "#000",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#FFD700",
    marginTop: 10,
    fontSize: 12,
  },
});

export default LoginScreen;
