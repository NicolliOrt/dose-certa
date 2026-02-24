// src/screens/Medications/actions.ts

import { Alert } from "react-native";
import type { MedicationDTO } from "../../types/api";
import { doseApi } from "../../services";

import { cancelAllDoseRemindersForMedication } from "../../services/reminderScheduler";
import { clearAllSnoozesForMedication } from "../../services/snoozeStore";

export function confirmRemoveMedication(
  userId: string,
  med: MedicationDTO,
  onDone: () => Promise<void> | void
) {
  Alert.alert("Remover Medicamento", `O que aconteceu com ${med.name}?`, [
    { text: "Cancelar", style: "cancel" },
    {
      text: "O tratamento acabou",
      onPress: async () => {
        try {
          await doseApi.archiveMedication(med.id);

          // ✅ cancela notificações e snoozes desse medicamento
          if (userId) {
            await cancelAllDoseRemindersForMedication(userId, med.id);
            await clearAllSnoozesForMedication(userId, med.id);
          }

          await onDone();
        } catch (e) {
          console.error("Erro ao arquivar:", e);
          Alert.alert("Erro", "Falha ao arquivar.");
        }
      },
    },
    {
      text: "Foi cadastro errado",
      style: "destructive",
      onPress: async () => {
        try {
          await doseApi.deleteMedication(med.id);

          // ✅ cancela notificações e snoozes desse medicamento
          if (userId) {
            await cancelAllDoseRemindersForMedication(userId, med.id);
            await clearAllSnoozesForMedication(userId, med.id);
          }

          await onDone();
        } catch (e) {
          console.error("Erro ao deletar:", e);
          Alert.alert("Erro", "Falha ao apagar.");
        }
      },
    },
  ]);
}