//src/screens/Medications/utils.tsx


import type { MedicationDTO } from "../../types/api";

export function getTimesText(item: MedicationDTO) {
  return (item.timesOfDay || []).join(" • ");
}