// app/index.tsx — CitiWatch
import auth from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import s from "../components/loginscreen/styles";
import { GRADIENT_COLORS } from "../constants/theme";
import { useUser } from "../provider/userProvider";

// ── Static data ──────────────────────────
const REPORT_TYPES = [
  { icon: "🛣️", label: "Damaged\nRoad" },
  { icon: "🚧", label: "Unfinished\nInfra" },
  { icon: "💡", label: "No Street\nLight" },
  { icon: "🗑️", label: "Illegal\nDump" },
];

const STATS = [
  { num: "247", label: "ACTIVE" },
  { num: "83", label: "RESOLVED" },
  { num: "12", label: "NEARBY" },
];

// ── Screen ───────────────────────────────
export default function Login() {
  const { setUser } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLogin = useMemo(
    () => email.trim().length > 0 && password.length >= 6 && !loading,
    [email, password, loading],
  );

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();

      await auth().signInWithEmailAndPassword(cleanEmail, password);

      const currentUser = auth().currentUser;
      if (currentUser) await currentUser.reload();

      await new Promise((resolve) => setTimeout(resolve, 300));

      setUser({ name: cleanEmail.split("@")[0], email: cleanEmail });

      router.replace({ pathname: "/mapbox", params: { refresh: "2" } });
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
                <Text style={s.liveText}>LIVE MONITORING</Text>
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
              <Text style={s.tagline}>// REPORT · PIN · TRACK CITY ISSUES</Text>
            </View>

            {/* ── Stats ── */}
            <View style={s.statsRow}>
              {STATS.map((stat) => (
                <View key={stat.label} style={s.statBox}>
                  <Text style={s.statNum}>{stat.num}</Text>
                  <Text style={s.statLbl}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* ── Report types ── */}
            <View style={s.typesRow}>
              {REPORT_TYPES.map((t) => (
                <View key={t.label} style={s.typeCard}>
                  <Text style={s.typeIcon}>{t.icon}</Text>
                  <Text style={s.typeLbl}>{t.label}</Text>
                </View>
              ))}
            </View>

            {/* ── Login card ── */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Operator Sign-in</Text>
              <Text style={s.cardSub}>
                Access the live report map and submit civic issues.
              </Text>
              <View style={s.divider} />

              <View style={s.field}>
                <Text style={s.fieldLabel}>EMAIL</Text>
                <TextInput
                  style={s.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#A0AECB"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={s.field}>
                <Text style={s.fieldLabel}>PASSWORD</Text>
                <View style={s.passRow}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#A0AECB"
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={s.eyeBtn}
                    onPress={() => setShowPass((v) => !v)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.eyeText}>{showPass ? "HIDE" : "SHOW"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!!error && <Text style={s.error}>⚠ {error}</Text>}

              <TouchableOpacity
                style={[s.loginBtn, !canLogin && s.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={!canLogin}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.loginText}>▶ ACCESS THE MAP</Text>
                )}
              </TouchableOpacity>

              <View style={s.footer}>
                <Text style={s.footerTxt}>New reporter? </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={s.footerLink}>Register here</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.hint}>
              // YOUR LOCATION IS ONLY SHARED WHEN YOU PIN A REPORT
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
