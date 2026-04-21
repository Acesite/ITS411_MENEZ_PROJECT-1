// components/LoginScreen/styles.ts
import { StyleSheet } from "react-native";
import {
  BG,
  BLUE,
  BLUE_SOFT,
  BORDER,
  INK,
  MONO,
  MUTED,
  WHITE,
} from "../../constants/theme";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  bg: { flex: 1 },

  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(26,107,245,0.02)",
  },

  scroll: {
    padding: 20,
    paddingBottom: 36,
    gap: 14,
    flexGrow: 1,
  },

  // Top bar
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 70,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(26,107,245,0.10)",
    borderWidth: 1,
    borderColor: "rgba(26,107,245,0.30)",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BLUE,
  },
  liveText: {
    fontFamily: MONO,
    fontSize: 10,
    color: BLUE,
    letterSpacing: 1,
  },
  coords: {
    fontFamily: MONO,
    fontSize: 9,
    color: MUTED,
    letterSpacing: 0.5,
  },

  // Header
  header: { gap: 4, marginTop: 5 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BLUE,
    backgroundColor: BLUE_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  pinIcon: { fontSize: 20 },
  brand: { fontSize: 30, fontWeight: "900", color: INK, letterSpacing: 3 },
  brandAccent: { color: BLUE },
  tagline: {
    fontFamily: MONO,
    fontSize: 10,
    color: MUTED,
    letterSpacing: 1,
    marginLeft: 52,
  },

  // Stats
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: WHITE,
  },
  statNum: { fontFamily: MONO, fontSize: 16, fontWeight: "700", color: BLUE },
  statLbl: {
    fontFamily: MONO,
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Report types
  typesRow: { flexDirection: "row", gap: 6 },
  typeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 4,
    backgroundColor: WHITE,
  },
  typeIcon: { fontSize: 16 },
  typeLbl: {
    fontSize: 9,
    color: MUTED,
    textAlign: "center",
    lineHeight: 13,
    fontWeight: "500",
  },

  // Card
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 2,
    borderTopColor: BLUE,
    borderRadius: 10,
    padding: 18,
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: INK, letterSpacing: 1 },
  cardSub: {
    fontSize: 13,
    color: MUTED,
    marginTop: 5,
    lineHeight: 18,
    fontWeight: "500",
  },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },

  // Fields
  field: { marginBottom: 12 },
  fieldLabel: {
    fontFamily: MONO,
    fontSize: 10,
    color: BLUE,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: BLUE_SOFT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 7,
    color: INK,
    fontFamily: MONO,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  passRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  eyeBtn: {
    backgroundColor: BLUE_SOFT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  eyeText: { fontFamily: MONO, fontSize: 10, color: BLUE, letterSpacing: 1 },

  error: {
    fontFamily: MONO,
    fontSize: 11,
    color: "#D93025",
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  // Button
  loginBtn: {
    backgroundColor: BLUE,
    borderRadius: 7,
    paddingVertical: 13,
    alignItems: "center",
  },
  loginBtnDisabled: { opacity: 0.4 },
  loginText: {
    color: WHITE,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    alignItems: "center",
  },
  footerTxt: { color: MUTED, fontSize: 13, fontWeight: "500" },
  footerLink: { color: BLUE, fontWeight: "900", fontSize: 13 },

  hint: {
    textAlign: "center",
    fontFamily: MONO,
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.6,
  },
});

export default s;
