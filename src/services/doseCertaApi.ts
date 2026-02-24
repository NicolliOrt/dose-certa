// src/services/doseCertaApi.ts
import type {
  MedicationDTO,
  ScheduleItemDTO,
  IntakeDTO,
  IntakeStatus,
} from "../types/api";

// Create = tudo do MedicationDTO exceto campos que o backend define
export type CreateMedicationPayload = Omit<
  MedicationDTO,
  "id" | "accountId" | "isActive"
>;

export type PatchMedicationPayload = Partial<
  Omit<MedicationDTO, "id" | "accountId">
>;

export type ArchiveMedicationResponse = {
  id: string;
  isActive: false;
  endDate: string; // "YYYY-MM-DD"
};

export type CreateIntakePayload = {
  medicationId: string;
  scheduledAt: string; // ISO
  status: IntakeStatus;
  note?: string | null;
};

export type AdherenceByMedicationDTO = {
  medicationId: string;
  name?: string;
  taken: number;
  skipped: number;
  missed: number;
};

export type AdherenceReportDTO = {
  from: string;
  to: string;
  totalEvents: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number; // 0..1
  byMedication?: AdherenceByMedicationDTO[];
};

export interface DoseCertaApi {
  // medications
  listMedications(active?: boolean): Promise<MedicationDTO[]>;
  createMedication(payload: CreateMedicationPayload): Promise<MedicationDTO>;
  patchMedication(medicationId: string, patch: PatchMedicationPayload): Promise<MedicationDTO>;
  archiveMedication(medicationId: string): Promise<ArchiveMedicationResponse>;
  deleteMedication(medicationId: string): Promise<void>;

  // today schedule + intakes
  getTodaySchedule(): Promise<ScheduleItemDTO[]>;
  createIntake(payload: CreateIntakePayload): Promise<IntakeDTO>;
  deleteIntake(intakeId: string): Promise<void>;

  // histórico por intervalo
  getIntakes(from: string, to: string): Promise<IntakeDTO[]>;

  // reports
  getAdherence(from: string, to: string): Promise<AdherenceReportDTO>;
}
