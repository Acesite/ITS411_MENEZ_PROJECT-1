// app/signup.tsx
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserRegistration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  // NOTE: now we store either:
  // - null
  // - a full data URI: "data:image/png;base64,...."
  const [avatarData, setAvatarData] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photos to set a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);

      const mime = asset.mimeType ?? "image/jpeg";
      const dataUri = asset.base64 ? `data:${mime};base64,${asset.base64}` : null;

      setAvatarData(dataUri);
    }
  };

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!username || !cleanEmail || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        cleanEmail,
        password
      );
      const createdUser = userCredential.user;

      const fbUser = auth().currentUser;
      if (fbUser) {
        await fbUser.updateProfile({ displayName: username });
        await fbUser.reload();
      }

      await firestore().collection("userProfiles").doc(createdUser.uid).set({
        displayName: username,
        avatarBase64: avatarData ?? null, // may be full data URI
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Success", "Registration complete!");
      router.replace("/mapbox");
    } catch (error: any) {
      console.log("Registration error:", error);
      Alert.alert("Registration Failed", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>+</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.avatarText}>Tap to choose profile picture</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.loginText}> Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  avatarWrapper: {
    alignSelf: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 40,
    color: "#6b7280",
    fontWeight: "600",
  },
  avatarText: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 16,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: { color: "blue", marginLeft: 5 },
});
