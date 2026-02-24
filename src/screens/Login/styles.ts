import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  logoWrap: { alignItems: "center", marginBottom: 18 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoIcon: { fontSize: 28, color: "#FFF" },
  brand: { fontSize: 18, fontWeight: "900", color: "#1F2937" },
  subtitle: { marginTop: 6, color: "#6B7280", fontWeight: "700" },

  label: { marginTop: 10, marginBottom: 6, fontWeight: "900", color: "#111827" },

  input: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontWeight: "700",
    color: "#111827",
  },

  inputButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputButtonText: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 16,
  },
  inputButtonIcon: { fontSize: 18 },

  forgotWrap: { marginTop: 10, alignItems: "flex-end" },
  forgotText: { color: "#4F46E5", fontWeight: "900" },

  button: {
    marginTop: 14,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "900", fontSize: 16 },

  linkWrap: { marginTop: 14, alignItems: "center" },
  link: { color: "#4F46E5", fontWeight: "900" },
});