// app/signup.tsx — CitiWatch
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
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import s from "../components/signupscreen/styles";
import { GRADIENT_COLORS } from "../constants/theme";

// ── Screen ───────────────────────────────
export default function UserRegistration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ── Handlers (logic unchanged) ───────────
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photos to set a profile picture.",
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
      const dataUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : null;
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
        password,
      );
      const createdUser = userCredential.user;

      const fbUser = auth().currentUser;
      if (fbUser) {
        await fbUser.updateProfile({ displayName: username });
        await fbUser.reload();
      }

      await firestore()
        .collection("userProfiles")
        .doc(createdUser.uid)
        .set({
          displayName: username,
          avatarBase64: avatarData ?? null,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert(
        "Success",
        "Registration complete! Please log in with your new account.",
      );

      await auth().signOut();
      router.replace("/");
    } catch (error: any) {
      console.log("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── JSX ──────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5FF" />

      <LinearGradient colors={GRADIENT_COLORS} style={s.bg}>
        <View style={s.gridOverlay} pointerEvents="none" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Top bar ── */}
            <View style={s.topbar}>
              <View style={s.liveBadge}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>NEW REPORTER</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.coords}>10.3157° N</Text>
                <Text style={s.coords}>123.8854° E</Text>
              </View>
            </View>

            {/* ── Brand ── */}
            <View style={s.header}>
              <View style={s.logoRow}>
                <View style={s.iconWrap}>
                  <Text style={s.pinIcon}>📍</Text>
                </View>
                <Text style={s.brand}>
                  CITI<Text style={s.brandAccent}>WATCH</Text>
                </Text>
              </View>
              <Text style={s.tagline}>// CREATE ACCOUNT · START REPORTING</Text>
            </View>

            {/* ── Register card ── */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Create Account</Text>
              <Text style={s.cardSub}>
                Join the network and start pinning civic issues near you.
              </Text>
              <View style={s.divider} />

              {/* Avatar picker */}
              <TouchableOpacity
                onPress={handlePickImage}
                style={s.avatarWrapper}
                activeOpacity={0.85}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={s.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={s.avatarPlaceholder}>
                    <Text style={s.avatarInitial}>+</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={s.avatarText}>TAP TO CHOOSE PROFILE PICTURE</Text>

              {/* Username */}
              <View style={s.field}>
                <Text style={s.fieldLabel}>USERNAME</Text>
                <TextInput
                  style={s.input}
                  placeholder="your_handle"
                  placeholderTextColor="#A0AECB"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              {/* Email */}
              <View style={s.field}>
                <Text style={s.fieldLabel}>EMAIL</Text>
                <TextInput
                  style={s.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#A0AECB"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View style={s.field}>
                <Text style={s.fieldLabel}>PASSWORD</Text>
                <TextInput
                  style={s.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0AECB"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Confirm Password */}
              <View style={s.field}>
                <Text style={s.fieldLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={s.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0AECB"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[s.loginBtn, loading && s.loginBtnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.loginText}>▶ CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={s.footer}>
                <Text style={s.footerTxt}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/")}>
                  <Text style={s.footerLink}> Log in</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.hint}>
              // YOU CONTROL WHAT YOU SHARE. CHANGE YOUR PROFILE ANYTIME.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
