// mapscreen/mapstyles.ts
import { StyleSheet } from "react-native";

export const C = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  border: "#E8ECF2",
  primary: "#2563EB",
  primarySoft: "#EFF4FF",
  text: "#111827",
  textMid: "#4B5563",
  textLight: "#9CA3AF",
  danger: "#EF4444",
  dangerSoft: "#FEF2F2",
  success: "#10B981",
  successSoft: "#ECFDF5",
} as const;

const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const;

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.3,
  },
  brandAccent: { color: C.primary },
  brandSub: { fontSize: 11, color: C.textLight, marginTop: 1 },

  // Avatar
  avatarBtn: { width: 38, height: 38, borderRadius: 19, overflow: "hidden" },
  avatarImg: { width: 38, height: 38, borderRadius: 19 },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 16, fontWeight: "700", color: C.primary },

  // Filters
  filterRow: {
    maxHeight: 52,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 12, fontWeight: "600", color: C.textMid },
  chipLabelActive: { color: "#fff" },

  // Map
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  pinEmoji: { fontSize: 18 },

  // FAB
  fabWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...shadow,
  },
  fabIcon: { fontSize: 20, color: "#fff", fontWeight: "300" },
  fabLabel: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Shared overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  // Profile modal
  profileCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    margin: 20,
    padding: 24,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    ...shadow,
  },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 12 },
  avatarFallbackBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitialBig: { fontSize: 28, fontWeight: "700", color: C.primary },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  profileEmail: { fontSize: 13, color: C.textMid, marginBottom: 20 },
  logoutBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.dangerSoft,
    alignItems: "center",
  },
  logoutLabel: { fontSize: 14, fontWeight: "700", color: C.danger },

  // Bottom sheet (ReportModal)
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetScroll: { paddingHorizontal: 20, paddingBottom: 32 },

  // Report view
  reportTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  reportEmoji: { fontSize: 28, marginTop: 2 },
  reportCategory: { fontSize: 17, fontWeight: "700", color: C.text, flex: 1 },
  reportMeta: { fontSize: 12, color: C.textMid, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  deptBadge: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  deptBadgeText: { fontSize: 12, color: C.textMid, fontWeight: "500" },
  reportImg: { width: "100%", height: 200, borderRadius: 12, marginBottom: 14 },
  reportDesc: {
    fontSize: 14,
    color: C.textMid,
    lineHeight: 22,
    marginBottom: 20,
  },
  ownerRow: { flexDirection: "row", gap: 10, marginBottom: 20 },

  // Buttons
  btnPrimary: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  btnPrimaryText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  btnOutline: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  btnOutlineText: { fontSize: 14, fontWeight: "600", color: C.textMid },
  btnDanger: {
    flex: 1,
    backgroundColor: C.dangerSoft,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  btnDangerText: { fontSize: 14, fontWeight: "700", color: C.danger },

  // Comments
  commentsHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  noComments: { fontSize: 13, color: C.textLight, marginBottom: 16 },
  commentCard: {
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentAuthor: { fontSize: 13, fontWeight: "700", color: C.text },
  commentTime: { fontSize: 11, color: C.textLight, marginTop: 1 },
  commentBody: { fontSize: 13, color: C.textMid, lineHeight: 20 },
  commentActions: { flexDirection: "row", gap: 12 },
  commentActionEdit: { fontSize: 12, fontWeight: "600", color: C.primary },
  commentActionDelete: { fontSize: 12, fontWeight: "600", color: C.danger },
  commentEditInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: C.text,
    minHeight: 64,
    marginBottom: 8,
    backgroundColor: C.surface,
  },
  commentEditBtns: { flexDirection: "row", gap: 8 },
  commentInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.text,
    backgroundColor: C.bg,
  },
  sendBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  closeBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  closeBtnText: { fontSize: 14, fontWeight: "600", color: C.textMid },
});
