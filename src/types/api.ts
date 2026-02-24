// src/types/api.ts
export type ScheduleType = "DAILY" | "WEEKDAYS" | "INTERVAL";
export type IntakeStatus = "TAKEN" | "SKIPPED" | "MISSED";

export type MedicationDTO = {
  id: string;
  // opcional: se o backend devolver, ok manter; se não, pode remover
  accountId?: string;

  name: string;
  strengthValue?: number | null;
  strengthUnit?: string | null;
  quantityPerDose?: number | null;
  form?: string | null;

  color?: string;
  notes?: string | null;
  doctorName?: string | null;
  purpose?: string | null;

  startDate: string; // "YYYY-MM-DD"
  endDate?: string | null; // "YYYY-MM-DD" | null
  isContinuous: boolean;
  isActive: boolean;

  scheduleType: ScheduleType;
  weekDays: number[]; // 1..7 (definam isso no back)
  intervalDays?: number | null;

  dosageText?: string | null;

  timesOfDay: string[]; // ["08:00","20:00"]
};

export type IntakeDTO = {
  id: string;
  // opcional: se o backend devolver
  accountId?: string;

  medicationId: string;
  scheduledAt: string; // ISO (timestamptz)
  takenAt?: string | null; // ISO
  status: IntakeStatus;
  note?: string | null;
};

export type ScheduleItemDTO = {
  medicationId: string;
  medicationName: string;
  details: string;
  color?: string;
  notes?: string | null;

  timeOfDay: string;   // "08:00"
  scheduledAt: string; // ISO

  intake: null | {
    id: string;
    status: IntakeStatus;
    takenAt?: string | null;
  };
};
