// src/screens/Reports/reportTypes.ts
export type AdherenceByMedication = {
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
  byMedication?: AdherenceByMedication[];
};