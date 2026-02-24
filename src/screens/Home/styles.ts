//src/screens/Home/styles.ts

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6B7280", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#9CA3AF", fontSize: 16 },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalSubtitle: { marginTop: 6, color: "#6B7280", fontWeight: "600" },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  quickBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    alignItems: "center",
  },
  quickText: { fontWeight: "900", color: "#111827" },

  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "700",
    color: "#111827",
  },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  modalCancel: { backgroundColor: "#F3F4F6" },
  modalConfirm: { backgroundColor: "#4F46E5" },
  modalBtnTextDark: { fontWeight: "900", color: "#111827" },
  modalBtnTextLight: { fontWeight: "900", color: "#FFF" },
});