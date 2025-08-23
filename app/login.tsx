import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase/firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Email and password are required.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    Alert.alert("Success", "Login successful!");
    router.push("/addItem"); // navigate to your app's home page
  } catch (error: any) {
    Alert.alert("Error", error.message); // Firebase will give proper error like "wrong-password"
  }

  setEmail("");
  setPassword("");
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password field with show/hide toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Text>{showPassword ? "show" : "hide"}</Text>
        </TouchableOpacity>
      </View>

      <Button title="Login" onPress={handleLogin} />

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/userregistration")}>
          <Text style={styles.registerButton}> Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start", // 👈 keeps fields at the top
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeButton: {
    padding: 5,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  registerText: {
    color: "black",
  },
  registerButton: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});