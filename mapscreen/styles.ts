// components/MapScreen/styles.ts
import { StyleSheet } from "react-native";
import { AVATAR_SIZE, AVATAR_SIZE_BIG } from "./constants";

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F5FF" },
  screen: { flex: 1, paddingHorizontal: 16 },

  // ── Header ──────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F1E3C",
    letterSpacing: 1,
  },
  appAccent: { color: "#1A6BF5" },
  appSubtitle: { fontSize: 12, color: "#6B7FA8", marginTop: 2 },

  // ── Profile button ───────────────────────
  profileButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#1A6BF5",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF0FF",
  },
  profileImage: { width: "100%", height: "100%" },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF0FF",
  },
  profileInitial: { fontSize: 18, fontWeight: "700", color: "#1A6BF5" },

  // ── Profile modal ────────────────────────
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 56,
    paddingRight: 16,
  },
  profileModalCard: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8D6F5",
  },
  profileImageBig: {
    width: AVATAR_SIZE_BIG,
    height: AVATAR_SIZE_BIG,
    borderRadius: AVATAR_SIZE_BIG / 2,
    marginBottom: 8,
  },
  profilePlaceholderBig: {
    width: AVATAR_SIZE_BIG,
    height: AVATAR_SIZE_BIG,
    borderRadius: AVATAR_SIZE_BIG / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF0FF",
    marginBottom: 8,
  },
  profileInitialBig: { fontSize: 26, fontWeight: "700", color: "#1A6BF5" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#0F1E3C" },
  profileEmail: { fontSize: 12, color: "#6B7FA8", marginBottom: 12 },
  profileLogoutButton: {
    marginTop: 4,
    width: "100%",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  profileLogoutText: { color: "#b91c1c", fontWeight: "700", fontSize: 14 },

  // ── Map ──────────────────────────────────
  mapCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#C8D6F5",
  },
  map: { flex: 1 },

  // ── Marker ───────────────────────────────
  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A6BF5",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  markerEmoji: { fontSize: 18 },

  // ── Report FAB ───────────────────────────
  shareBarWrapper: { alignItems: "center", paddingTop: 12 },
  shareBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A6BF5",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 999,
    shadowColor: "#1A6BF5",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  sharePlus: { color: "#FFFFFF", fontSize: 20, marginRight: 8 },
  shareText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Report modal ─────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "92%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderTopWidth: 3,
    borderTopColor: "#1A6BF5",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F1E3C",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timestampText: { fontSize: 11, color: "#9ca3af", marginBottom: 10 },

  // Status badge
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 10,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },

  // Category picker
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A6BF5",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C8D6F5",
    backgroundColor: "#EAF0FF",
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: "#1A6BF5",
    borderColor: "#1A6BF5",
  },
  categoryChipText: { fontSize: 11, color: "#1A6BF5", fontWeight: "600" },
  categoryChipTextActive: { color: "#FFFFFF" },

  // Image upload
  imageLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A6BF5",
    letterSpacing: 1,
    marginBottom: 6,
  },
  imagePickerBtn: {
    height: 110,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#C8D6F5",
    borderStyle: "dashed",
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  imagePickerText: { fontSize: 12, color: "#6B7FA8", marginTop: 4 },
  imagePickerEmoji: { fontSize: 28 },
  imagePreview: { width: "100%", height: "100%" },

  // Description input
  descriptionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A6BF5",
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalInput: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#C8D6F5",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#EAF0FF",
    color: "#0F1E3C",
    fontSize: 13,
    marginBottom: 12,
  },

  // Report detail view
  reportImageFull: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  reportCategory: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A6BF5",
    marginBottom: 4,
  },
  reportDescription: { fontSize: 15, color: "#0F1E3C", lineHeight: 22 },

  ownerActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    flexWrap: "wrap",
    gap: 6,
  },

  // ── Comments ─────────────────────────────
  commentsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F1E3C",
    marginTop: 16,
    marginBottom: 8,
  },
  commentsList: { maxHeight: 180 },
  noCommentsText: { color: "#9ca3af", fontStyle: "italic", fontSize: 13 },
  commentItem: { marginBottom: 10 },
  commentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  commentActionsRow: { flexDirection: "row", gap: 8 },
  commentActionText: { fontSize: 12, color: "#1A6BF5" },
  commentDeleteText: { color: "#b91c1c" },
  commentAuthor: { fontWeight: "700", color: "#0F1E3C", fontSize: 13 },
  commentTimestamp: { fontSize: 11, color: "#9ca3af" },
  commentText: { color: "#374151", marginTop: 2, fontSize: 13 },
  commentEditBlock: { marginTop: 4 },
  commentEditInput: {
    borderWidth: 1,
    borderColor: "#C8D6F5",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlignVertical: "top",
    backgroundColor: "#EAF0FF",
    color: "#0F1E3C",
  },
  commentEditButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 6,
  },
  commentEditButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#C8D6F5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#EAF0FF",
    color: "#0F1E3C",
    fontSize: 13,
  },
  sendButton: {
    backgroundColor: "#1A6BF5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // ── Modal buttons ────────────────────────
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalCancel: { backgroundColor: "#EAF0FF" },
  modalSave: { backgroundColor: "#1A6BF5" },
  modalButtonText: { color: "#0F1E3C", fontWeight: "700", fontSize: 13 },
  modalSaveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  modalDelete: { backgroundColor: "#fee2e2" },
  modalDeleteText: { color: "#b91c1c", fontWeight: "700", fontSize: 13 },
});

export default s;
