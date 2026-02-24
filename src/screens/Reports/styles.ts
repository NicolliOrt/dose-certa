// src/screens/Reports/styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 80 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, color: "#6B7280", fontSize: 16 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },

  label: { fontSize: 12, fontWeight: "800", color: "#111827", marginBottom: 6 },
  dateInput: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dateText: { fontSize: 14, fontWeight: "800", color: "#111827" },

  pdfButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  pdfText: { color: "#FFF", fontWeight: "900", fontSize: 14 },

  statCardBlue: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#4F46E5",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCardGreen: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#16A34A",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCardPurple: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#7C3AED",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statLabel: { color: "#111827", fontWeight: "800", fontSize: 13 },
  statValue: { color: "#111827", fontWeight: "900", fontSize: 18, marginTop: 4 },

  statIconWrapIndigo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconWrapGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconWrapPurple: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: { fontSize: 15, fontWeight: "900", color: "#111827", marginBottom: 10 },
  emptyMuted: { color: "#6B7280", fontWeight: "700", paddingVertical: 8 },

  medRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
    backgroundColor: "#FFF",
  },
  medTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  medName: { fontSize: 14, fontWeight: "900", color: "#111827" },
  medDose: { marginTop: 2, color: "#6B7280", fontWeight: "700", fontSize: 12 },
  medCount: { fontWeight: "900", color: "#111827" },
  medRate: { marginTop: 2, color: "#6B7280", fontWeight: "800", fontSize: 12 },

  progressWrap: {
    marginTop: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: { height: 10, borderRadius: 8 },

  dayBlock: { marginTop: 6, marginBottom: 12 },
  dayTitle: {
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    textTransform: "capitalize",
  },

  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logMed: { fontWeight: "900", color: "#111827" },
  logMeta: { marginTop: 2, color: "#6B7280", fontWeight: "700", fontSize: 12 },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { fontWeight: "900", color: "#111827", fontSize: 12 },
});