// app/index.tsx
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// 👉 NEW: use the provider
import { useUser } from "../provider/userProvider";

export default function Login() {
  const { setUser, clearUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await auth().signInWithEmailAndPassword(cleanEmail, password);

      // Save user info to the provider (simple example derives a name from email)
      setUser({ name: cleanEmail.split("@")[0], email: cleanEmail });

      router.push("/addItem");
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOGIN</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <Button title="Login" onPress={handleLogin} />

      <View style={styles.footer}>
        <Text>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}> Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Optional: quick way to clear provider while testing */}
      {/* <View style={{ marginTop: 12 }}>
        <Button title="Clear User (Provider)" onPress={clearUser} />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  signupText: { color: "blue", marginLeft: 5 },
});
