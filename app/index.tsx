// app/index.tsx
import auth from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { useUser } from "../provider/userProvider";

export default function Login() {
  const { setUser } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLogin = useMemo(() => {
    return email.trim().length > 0 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();
      await auth().signInWithEmailAndPassword(cleanEmail, password);

      setUser({ name: cleanEmail.split("@")[0], email: cleanEmail });
      router.replace("/mapbox");
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        // “night map” vibe
        colors={["#071A2B", "#071A2B", "#0B2A3F"]}
        style={styles.bg}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kb}
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.pinBadge}>
                <Text style={styles.pinDot}>●</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brand}>Geo Thoughts</Text>
                <Text style={styles.tagline}>
                  Drop a thought. Pin it where you are.
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

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSub}>
              Continue to view and post location-based thoughts.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#93A7BD"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#93A7BD"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, styles.inputPassword]}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.eyeText}>
                    {showPass ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={!canLogin}
              activeOpacity={0.9}
              style={[styles.loginBtn, !canLogin && styles.loginBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.loginText}>Enter the Map</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here?</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.signupText}> Create account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.hint}>
            Your exact location can be protected. You control what you share.
          </Text>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  cardSub: { color: "#A9BED4", marginTop: 6, lineHeight: 18 },

  field: { marginTop: 12 },
  label: { color: "#C2D3E6", fontSize: 12, marginBottom: 6 },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
  },

  passwordRow: { flexDirection: "row", alignItems: "center" },
  inputPassword: { flex: 1 },
  eyeBtn: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  eyeText: { color: "#D7E6F6", fontWeight: "900", fontSize: 12 },

  error: { color: "#FF6B6B", marginTop: 10, lineHeight: 18 },

  loginBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#60D2FF",
  },
  loginBtnDisabled: { opacity: 0.55 },
  loginText: { color: "#062033", fontWeight: "900", fontSize: 14 },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  footerText: { color: "#A9BED4" },
  signupText: { color: "#60D2FF", fontWeight: "900" },

  hint: {
    marginTop: 14,
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
  },
});
