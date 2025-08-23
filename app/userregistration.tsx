import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase/firebaseConfig";

export default function UserRegistration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: username,
      });

      Alert.alert("Success", "Registration complete!");
      router.push("/login"); // Navigate to login after successful registration
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Text>{showPassword ? "show" : "hide"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
          <Text>{showConfirmPassword ? "show" : "hide"}</Text>
        </TouchableOpacity>
      </View>

      <Button title="Register" onPress={handleRegister} />

      <View style={styles.footer}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.loginText}> Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  passwordContainer: { flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, alignItems: "center", marginBottom: 10, paddingRight: 10 },
  passwordInput: { flex: 1, padding: 10 },
  eyeButton: { padding: 5 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { color: "blue", marginLeft: 5 },
});
