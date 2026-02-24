// src/components/MedicationCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Clock, CheckCircle, StickyNote, Trash2, XCircle, AlertTriangle, Bell } from "lucide-react-native";
import type { IntakeStatus } from "../types/api";

type Props = {
  name: string;
  details: string;
  time: string;
  color?: string;
  notes?: string | null;

  mode?: "today" | "medications";

  // today: status final (TAKEN/SKIPPED/MISSED) ou null (pendente)
  intakeStatus?: IntakeStatus | null;

  // ações do Today
  onPressCheck?: () => void;  // TAKEN
  onPressSkip?: () => void;   // SKIPPED
  onPressSnooze?: () => void; // Adiar
  onPressUndo?: () => void;   // desfazer intake (deleteIntake)

  snoozedUntilLabel?: string | null;

  // meds: delete
  showDelete?: boolean;
  onPressDelete?: () => void;
};

function StatusPill({ status }: { status: IntakeStatus | null }) {
  if (status === "MISSED") {
    return (
      <View style={[styles.pill, styles.pillMissed]}>
        <AlertTriangle size={16} color="#FFF" />
        <Text style={styles.pillText}>Perdido</Text>
      </View>
    );
  }
  if (status === "TAKEN") {
    return (
      <View style={[styles.pill, styles.pillTaken]}>
        <CheckCircle size={16} color="#FFF" />
        <Text style={styles.pillText}>Tomado</Text>
      </View>
    );
  }
  if (status === "SKIPPED") {
    return (
      <View style={[styles.pill, styles.pillSkipped]}>
        <XCircle size={16} color="#FFF" />
        <Text style={styles.pillText}>Pulado</Text>
      </View>
    );
  }
  return (
    <View style={[styles.pill, styles.pillPending]}>
      <CheckCircle size={16} color="#FFF" />
      <Text style={styles.pillText}>Pendente</Text>
    </View>
  );
}

export function MedicationCard({
  name,
  details,
  time,
  color = "#4F46E5",
  notes,
  mode = "today",
  intakeStatus = null,
  onPressCheck,
  onPressSkip,
  onPressSnooze,
  onPressUndo,
  snoozedUntilLabel = null,
  showDelete = true,
  onPressDelete,
}: Props) {
  const isFinal = intakeStatus === "TAKEN" || intakeStatus === "SKIPPED";

  const bgColor =
    intakeStatus === "TAKEN" ? "#ECFDF5" :
    intakeStatus === "SKIPPED" ? "#FEF3C7" :
    intakeStatus === "MISSED" ? "#FEE2E2" :
    "#FFF";

  return (
    <View style={[styles.card, { borderLeftColor: color, backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
        </View>

        <View style={styles.timeBadge}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>

      <Text style={styles.details}>{details}</Text>

      {notes ? (
        <View style={styles.noteContainer}>
          <StickyNote size={14} color="#D97706" />
          <Text style={styles.noteText} numberOfLines={2}>{notes}</Text>
        </View>
      ) : null}

      {mode === "today" && snoozedUntilLabel ? (
        <View style={styles.snoozeLine}>
          <Bell size={14} color="#6B7280" />
          <Text style={styles.snoozeText}>Adiado até {snoozedUntilLabel}</Text>
        </View>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        {/* meds delete */}
        {mode === "medications" ? (
          showDelete !== false && onPressDelete ? (
            <TouchableOpacity style={styles.deleteButton} onPress={onPressDelete}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <View />
          )
        ) : (
          <View />
        )}

        {/* today actions */}
        {mode === "today" && (
          <View style={styles.actionsRow}>
            {isFinal ? (
              <>
                <StatusPill status={intakeStatus} />
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnUndo]}
                  onPress={onPressUndo}
                  disabled={!onPressUndo}
                >
                  <Text style={styles.btnText}>Desfazer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnTaken]}
                  onPress={onPressCheck}
                  disabled={!onPressCheck}
                >
                  <CheckCircle size={16} color="#FFF" />
                  <Text style={styles.btnText}>Tomar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnSkipped]}
                  onPress={onPressSkip}
                  disabled={!onPressSkip}
                >
                  <XCircle size={16} color="#FFF" />
                  <Text style={styles.btnText}>Pular</Text>
                </TouchableOpacity>

                {intakeStatus === "MISSED" ? (
                  <StatusPill status="MISSED" />
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnSnooze]}
                    onPress={onPressSnooze}
                    disabled={!onPressSnooze}
                  >
                    <Bell size={16} color="#FFF" />
                    <Text style={styles.btnText}>Adiar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  name: { fontSize: 18, fontWeight: "bold", color: "#111827", flex: 1 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  details: { fontSize: 15, color: "#4B5563", marginBottom: 12 },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  noteText: { fontSize: 13, color: "#92400E", flex: 1 },

  snoozeLine: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  snoozeText: { color: "#6B7280", fontSize: 13, fontWeight: "600" },

  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  deleteButton: { padding: 8, borderRadius: 8, backgroundColor: "#FEE2E2" },

  actionsRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnTaken: { backgroundColor: "#4F46E5" },
  btnSkipped: { backgroundColor: "#F59E0B" },
  btnSnooze: { backgroundColor: "#6366F1" },
  btnUndo: { backgroundColor: "#111827" },

  btnText: { color: "#FFF", fontWeight: "800", fontSize: 13 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  pillPending: { backgroundColor: "#4F46E5" },
  pillTaken: { backgroundColor: "#10B981" },
  pillSkipped: { backgroundColor: "#F59E0B" },
  pillMissed: { backgroundColor: "#EF4444" },
  pillText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
});
