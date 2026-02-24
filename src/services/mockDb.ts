// src/services/mockDb.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MedicationDTO, IntakeDTO } from "../types/api";

type MockState = {
  meds: MedicationDTO[];
  intakes: IntakeDTO[];
};

const KEY = "@dose-certa:mock-state:v1";

// ✅ seed sem profileId (single account)
const seed: MockState = {
  meds: [
    {
      id: "m1",
      name: "Losartana",
      color: "#4F46E5",
      notes: "Tomar em jejum",
      doctorName: "Dr. Silva",
      purpose: "Pressão alta",
      startDate: "2026-01-21",
      endDate: null,
      isContinuous: true,
      isActive: true,
      scheduleType: "DAILY",
      weekDays: [],
      intervalDays: null,
      dosageText: "1 Comprimido de 50mg",
      timesOfDay: ["08:00", "20:00"],
    },
    {
      id: "m2",
      name: "Venlafaxina",
      color: "#10B981",
      notes: null,
      doctorName: null,
      purpose: null,
      startDate: "2026-01-21",
      endDate: null,
      isContinuous: true,
      isActive: true,
      scheduleType: "DAILY",
      weekDays: [],
      intervalDays: null,
      dosageText: "1 cápsula",
      timesOfDay: ["09:00"],
    },
  ],
  intakes: [],
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * ISO para "hoje + HH:mm" (local -> ISO).
 * Importante: o matching do Intake depende disso.
 */
export function isoTodayAt(hhmm: string) {
  const [h, m] = hhmm.split(":").map((n) => Number(n));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export async function loadMockState(): Promise<MockState> {
  const raw = await AsyncStorage.getItem(KEY);

  if (!raw) {
    await AsyncStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockState>;
    const normalized: MockState = {
      meds: (parsed.meds ?? []) as MedicationDTO[],
      intakes: (parsed.intakes ?? []) as IntakeDTO[],
    };
    return normalized;
  } catch {
    await AsyncStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
}

export async function saveMockState(state: MockState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function resetMockState() {
  await AsyncStorage.removeItem(KEY);
}

export const mockIds = { uid };
