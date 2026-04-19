// components/SignupScreen/styles.ts
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

const AVATAR_SIZE = 96;

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
  header: { gap: 4 },
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

  // Avatar
  avatarWrapper: {
    alignSelf: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: BLUE_SOFT,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 40,
    color: BLUE,
    fontWeight: "900",
  },
  avatarText: {
    textAlign: "center",
    color: MUTED,
    marginBottom: 14,
    fontSize: 12,
    fontFamily: MONO,
  },

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

  // Button
  loginBtn: {
    backgroundColor: BLUE,
    borderRadius: 7,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
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
