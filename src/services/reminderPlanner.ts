// src/services/reminderPlanner.ts
import type { MedicationDTO } from "../types/api";
import { makeDoseKey, clearSnooze } from "./snoozeStore";
import { scheduleDoseReminder, cancelDoseReminder } from "./reminderScheduler";
import { generateOccurrencesForMedication } from "./reminderOccurrences";

const DEFAULT_DAYS_AHEAD = 30;

/**
 * Agenda (ou re-agenda) os próximos 30 dias para 1 medicamento.
 * - Usa keys determinísticas: medicationId:scheduledAtISO
 * - Ignora horários no passado
 */
export async function scheduleNext30DaysForMedication(params: {
  userId: string;
  med: MedicationDTO;
  daysAhead?: number;
}) {
  const { userId, med, daysAhead = DEFAULT_DAYS_AHEAD } = params;

  const occ = generateOccurrencesForMedication({ med, daysAhead });
  const now = Date.now();

  await Promise.all(
    occ.map(async (o) => {
      const key = makeDoseKey(med.id, o.scheduledAtISO);
      const triggerAt = new Date(o.scheduledAtISO);

      // passado? não agenda
      if (triggerAt.getTime() <= now + 1000) return;

      await scheduleDoseReminder({
        userId,
        key,
        title: "Hora da medicação",
        body: `${med.name} • ${o.timeOfDay}`,
        triggerAt,
      });
    })
  );
}

/**
 * Cancela e limpa snooze de uma dose específica (quando necessário).
 */
export async function clearDoseLocalArtifacts(userId: string, medicationId: string, scheduledAtISO: string) {
  const key = makeDoseKey(medicationId, scheduledAtISO);
  await cancelDoseReminder(userId, key);
  await clearSnooze(userId, key);
}