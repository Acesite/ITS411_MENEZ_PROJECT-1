// app/signup.tsx
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
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
      avatarBase64: avatarData ?? null,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    Alert.alert(
      "Success",
      "Registration complete! Please log in with your new account."
    );

    // Force going back to login
    await auth().signOut();
    router.replace("/");
  } catch (error: any) {
    console.log("Registration error:", error);
    Alert.alert("Registration Failed", error.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#071A2B", "#071A2B", "#0B2A3F"]}
        style={styles.bg}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kb}
        >
          {/* Brand header to match login */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.pinBadge}>
                <Text style={styles.pinDot}>●</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brand}>Geo Thoughts</Text>
                <Text style={styles.tagline}>
                  Create your account and start pinning where you are.
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>Public</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>Pinned</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>Nearby</Text>
              </View>
            </View>
          </View>

          {/* Card (replaces old white container) */}
          <View style={styles.card}>
            <Text style={styles.title}>Register</Text>

            {/* Avatar picker */}
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.avatarWrapper}
              activeOpacity={0.85}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>+</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarText}>Tap to choose profile picture</Text>

            {/* Fields (same logic, themed UI) */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#93A7BD"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#93A7BD"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#93A7BD"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#93A7BD"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={styles.loginText}> Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.hint}>
            You control what you share. Change your profile anytime.
          </Text>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  // Outer layout (same idea as login)
  safe: { flex: 1, backgroundColor: "#071A2B" },
  bg: { flex: 1 },
  kb: { flex: 1, justifyContent: "center", padding: 18 },

  header: { marginBottom: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  pinBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(96, 210, 255, 0.14)",
    borderColor: "rgba(96, 210, 255, 0.35)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: { color: "#7DE0FF", fontSize: 14, fontWeight: "900" },

  brand: { color: "#FFFFFF", fontSize: 26, fontWeight: "900" },
  tagline: { color: "#B1C3D7", marginTop: 4, lineHeight: 18 },

  statsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  statPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statLabel: { color: "#D7E6F6", fontSize: 12, fontWeight: "800" },

  // Card (replaces old white container)
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "left",
    color: "#FFFFFF",
  },

  avatarWrapper: {
    alignSelf: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
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
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 40,
    color: "#7DE0FF",
    fontWeight: "900",
  },
  avatarText: {
    textAlign: "center",
    color: "#A9BED4",
    marginBottom: 16,
    fontSize: 12,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#60D2FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#062033",
    fontWeight: "900",
    fontSize: 14,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: { color: "#A9BED4" },
  loginText: { color: "#60D2FF", fontWeight: "900" },

  hint: {
    marginTop: 14,
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
  },
});
