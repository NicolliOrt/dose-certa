// src/services/doseCertaApi.mock.ts
import type {
  DoseCertaApi,
  CreateMedicationPayload,
  CreateIntakePayload,
  PatchMedicationPayload,
  ArchiveMedicationResponse,
  AdherenceReportDTO,
} from "./doseCertaApi";

import type { MedicationDTO, ScheduleItemDTO, IntakeDTO } from "../types/api";
import { loadMockState, saveMockState, isoTodayAt, todayYMD, mockIds } from "./mockDb";

export const doseCertaApiMock: DoseCertaApi = {
  // ========= MEDICATIONS =========
  async listMedications(active?: boolean) {
    const st = await loadMockState();
    let list = [...st.meds];

    if (active === true) list = list.filter((m) => m.isActive);
    if (active === false) list = list.filter((m) => !m.isActive);

    return list;
  },

  async createMedication(payload: CreateMedicationPayload) {
    const st = await loadMockState();

    const newMed: MedicationDTO = {
      id: mockIds.uid("m"),
      isActive: true,
      ...payload,
    };

    st.meds = [newMed, ...st.meds];
    await saveMockState(st);
    return newMed;
  },

  async patchMedication(medicationId: string, patch: PatchMedicationPayload) {
    const st = await loadMockState();
    const idx = st.meds.findIndex((m) => m.id === medicationId);
    if (idx < 0) throw new Error("Medication not found");

    st.meds[idx] = { ...st.meds[idx], ...patch };
    await saveMockState(st);
    return st.meds[idx];
  },

  async archiveMedication(medicationId: string): Promise<ArchiveMedicationResponse> {
    const st = await loadMockState();
    const idx = st.meds.findIndex((m) => m.id === medicationId);
    if (idx < 0) throw new Error("Medication not found");

    const endDate = todayYMD();
    st.meds[idx] = { ...st.meds[idx], isActive: false, endDate };

    await saveMockState(st);
    return { id: medicationId, isActive: false, endDate };
  },

  async deleteMedication(medicationId: string) {
    const st = await loadMockState();

    st.meds = st.meds.filter((m) => m.id !== medicationId);
    st.intakes = st.intakes.filter((i) => i.medicationId !== medicationId);

    await saveMockState(st);
  },

  // ========= TODAY SCHEDULE =========
  async getTodaySchedule() {
    const st = await loadMockState();
    const activeMeds = st.meds.filter((m) => m.isActive);

    const items: ScheduleItemDTO[] = [];

    for (const med of activeMeds) {
      for (const t of med.timesOfDay) {
        const scheduledAt = isoTodayAt(t);

        const found = st.intakes.find(
          (i) => i.medicationId === med.id && i.scheduledAt === scheduledAt
        );

        items.push({
          medicationId: med.id,
          medicationName: med.name,
          details: med.dosageText ?? "",
          color: med.color,
          notes: med.notes ?? null,
          timeOfDay: t,
          scheduledAt,
          intake: found
            ? { id: found.id, status: found.status, takenAt: found.takenAt ?? null }
            : null,
        });
      }
    }

    items.sort((a, b) => a.timeOfDay.localeCompare(b.timeOfDay));
    return items;
  },

  // ========= INTAKES =========
  async createIntake(payload: CreateIntakePayload) {
    const st = await loadMockState();

    // upsert lógico (medicationId + scheduledAt)
    const existing = st.intakes.find(
      (i) => i.medicationId === payload.medicationId && i.scheduledAt === payload.scheduledAt
    );

    const now = new Date().toISOString();

    if (existing) {
      existing.status = payload.status;
      existing.note = payload.note ?? null;
      existing.takenAt = payload.status === "TAKEN" ? now : null;

      await saveMockState(st);
      return existing;
    }

    const newIntake: IntakeDTO = {
      id: mockIds.uid("i"),
      medicationId: payload.medicationId,
      scheduledAt: payload.scheduledAt,
      takenAt: payload.status === "TAKEN" ? now : null,
      status: payload.status,
      note: payload.note ?? null,
    };

    st.intakes.push(newIntake);
    await saveMockState(st);
    return newIntake;
  },

  async deleteIntake(intakeId: string) {
    const st = await loadMockState();
    st.intakes = st.intakes.filter((i) => i.id !== intakeId);
    await saveMockState(st);
  },

  // ========= HISTORY =========
  async getIntakes(from: string, to: string) {
    const st = await loadMockState();

    const fromMs = new Date(from + "T00:00:00").getTime();
    const toMs = new Date(to + "T23:59:59").getTime();

    return st.intakes.filter((i) => {
      const t = new Date(i.scheduledAt).getTime();
      return t >= fromMs && t <= toMs;
    });
  },

    // ========= REPORTS =========
  async getAdherence(from: string, to: string): Promise<AdherenceReportDTO> {
    const st = await loadMockState();

    // intervalo inclusivo (local)
    const fromMs = new Date(from + "T00:00:00").getTime();
    const toMs = new Date(to + "T23:59:59").getTime();

    // meds ativos (mesmo critério usado nas telas)
    const meds = st.meds.filter((m) => m.isActive);

    // init agregadores por medicamento
    const byMed: Record<
      string,
      { medicationId: string; name?: string; taken: number; skipped: number; missed: number }
    > = {};

    for (const m of meds) {
      byMed[m.id] = { medicationId: m.id, name: m.name, taken: 0, skipped: 0, missed: 0 };
    }

    let taken = 0;
    let skipped = 0;
    let missed = 0;

    // Percorre cada dia do período e cada horário previsto
    const cur = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");

    while (cur.getTime() <= end.getTime()) {
      for (const m of meds) {
        for (const t of m.timesOfDay ?? []) {
          const [hh, mm] = t.split(":").map((n) => Number(n));
          const sched = new Date(cur);
          sched.setHours(hh, mm, 0, 0);

          const schedMs = sched.getTime();
          if (schedMs < fromMs || schedMs > toMs) continue;

          // matching do intake: tenta por timestamp aproximado no mesmo scheduledAt
          // (no mock, scheduledAt é ISO exato do dia/hora)
          const schedISO = sched.toISOString();

          const found = st.intakes.find(
            (i) => i.medicationId === m.id && i.scheduledAt === schedISO
          );

          if (found) {
            if (found.status === "TAKEN") {
              taken++;
              byMed[m.id].taken++;
            } else if (found.status === "SKIPPED") {
              skipped++;
              byMed[m.id].skipped++;
            } else {
              missed++;
              byMed[m.id].missed++;
            }
          } else {
            // não registrado → conta como missed no relatório agregado
            missed++;
            byMed[m.id].missed++;
          }
        }
      }

      cur.setDate(cur.getDate() + 1);
    }

    const totalEvents = taken + skipped + missed;
    const adherenceRate = totalEvents > 0 ? taken / totalEvents : 0;

    return {
      from,
      to,
      totalEvents,
      taken,
      skipped,
      missed,
      adherenceRate,
      byMedication: Object.values(byMed),
    };
  },
};
