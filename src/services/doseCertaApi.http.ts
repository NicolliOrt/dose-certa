// src/services/doseCertaApi.http.ts
import { api } from "./api";
import type {
  DoseCertaApi,
  CreateMedicationPayload,
  PatchMedicationPayload,
  ArchiveMedicationResponse,
  CreateIntakePayload,
} from "./doseCertaApi";
import type { MedicationDTO, ScheduleItemDTO, IntakeDTO } from "../types/api";
import type { AdherenceReportDTO } from "./doseCertaApi";

async function getWithFallback<T>(primary: string, fallback: string, params?: any) {
  try {
    const { data } = await api.get<T>(primary, { params });
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) {
      const { data } = await api.get<T>(fallback, { params });
      return data;
    }
    throw e;
  }
}

async function postWithFallback<T>(primary: string, fallback: string, body?: any) {
  try {
    const { data } = await api.post<T>(primary, body);
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) {
      const { data } = await api.post<T>(fallback, body);
      return data;
    }
    throw e;
  }
}

async function putWithFallback<T>(primary: string, fallback: string, body?: any) {
  try {
    const { data } = await api.put<T>(primary, body);
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) {
      const { data } = await api.put<T>(fallback, body);
      return data;
    }
    throw e;
  }
}

async function delWithFallback(primary: string, fallback: string) {
  try {
    await api.delete(primary);
  } catch (e: any) {
    if (e?.response?.status === 404) {
      await api.delete(fallback);
      return;
    }
    throw e;
  }
}

export const doseCertaApiHttp: DoseCertaApi = {
  // ============ MEDICATIONS ============
  async listMedications(active) {
    const params = typeof active === "boolean" ? { active } : undefined;

    // final: /medications
    const { data } = await api.get<MedicationDTO[]>("/medications", { params });
    return data;
  },

  async createMedication(payload: CreateMedicationPayload) {
    // final: POST /medications
    return postWithFallback<MedicationDTO>(`/medications`, `/medications`, payload);
  },

  

  async patchMedication(medicationId, patch: PatchMedicationPayload) {
    // final: PATCH /medications/:id
    // fallback: PUT /medications/:id
    try {
      const { data } = await api.patch<MedicationDTO>(`/medications/${medicationId}`, patch);
      return data;
    } catch (e: any) {
      if (e?.response?.status === 404) {
        const { data } = await api.put<MedicationDTO>(`/medications/${medicationId}`, patch);
        return data;
      }
      throw e;
    }
  },

  async archiveMedication(medicationId) {
    // final: POST /medications/:id/archive
    try {
      const { data } = await api.post<ArchiveMedicationResponse>(`/medications/${medicationId}/archive`);
      return data;
    } catch (e: any) {
      if (e?.response?.status === 404) {
        const endDate = new Date().toISOString().slice(0, 10);
        const updated = await putWithFallback<MedicationDTO>(
          `/medications/${medicationId}`,
          `/medications/${medicationId}`,
          { isActive: false, endDate }
        );
        return { id: updated.id, isActive: false, endDate: updated.endDate ?? endDate };
      }
      throw e;
    }
  },

  async deleteMedication(medicationId) {
    await delWithFallback(`/medications/${medicationId}`, `/medications/${medicationId}`);
  },

  // ============ TODAY SCHEDULE + INTAKES ============
  async getTodaySchedule() {
    // final: GET /schedule/today
    return getWithFallback<ScheduleItemDTO[]>(`/schedule/today`, `/schedule/today`);
  },

  async createIntake(payload: CreateIntakePayload) {
    // final: POST /intakes
    return postWithFallback<IntakeDTO>(`/intakes`, `/intakes`, payload);
  },

  async deleteIntake(intakeId) {
    await delWithFallback(`/intakes/${intakeId}`, `/intakes/${intakeId}`);
  },

  async getIntakes(from, to) {
    // final: GET /intakes?from&to
    return getWithFallback<IntakeDTO[]>(`/intakes`, `/intakes`, { from, to });
  },

    async getAdherence(from: string, to: string) {
    const { data } = await api.get<AdherenceReportDTO>(`/reports/adherence`, {
      params: { from, to },
    });
    return data;
  },
};
