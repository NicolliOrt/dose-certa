// src/services/reminderOccurrences.ts
import type { MedicationDTO, ScheduleType } from "../types/api";

type Occurrence = {
  scheduledAtISO: string; // ISO (UTC) baseado na data/hora local do device
  timeOfDay: string;      // "08:00"
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymdFromDateLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dateFromYMDLocal(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

// API weekDays é 1..7 (Dom..Sáb). JS getDay é 0..6 (Dom..Sáb).
function jsDowToApi(jsDow: number) {
  return jsDow + 1; // 0->1, 6->7
}

function addDaysLocal(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function makeLocalDateTimeISO(dayLocal: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const x = new Date(
    dayLocal.getFullYear(),
    dayLocal.getMonth(),
    dayLocal.getDate(),
    hh,
    mm,
    0,
    0
  );
  return x.toISOString();
}

function withinMedicationWindow(med: MedicationDTO, dayYMD: string) {
  if (!med.startDate) return true;

  // med.startDate / endDate são "YYYY-MM-DD"
  if (dayYMD < med.startDate) return false;

  if (med.isContinuous) return true;

  const end = med.endDate ?? null;
  if (!end) return true;

  return dayYMD <= end;
}

function isDayAllowedBySchedule(med: MedicationDTO, dayLocal: Date) {
  const type: ScheduleType = med.scheduleType;

  if (type === "DAILY") return true;

  if (type === "WEEKDAYS") {
    const apiDow = jsDowToApi(dayLocal.getDay()); // 1..7
    return (med.weekDays ?? []).includes(apiDow);
  }

  // INTERVAL
  const interval = med.intervalDays ?? null;
  if (!interval || interval <= 0) return true;

  const start = dateFromYMDLocal(med.startDate);
  const diffDays = Math.floor(
    (dateFromYMDLocal(ymdFromDateLocal(dayLocal)).getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );

  return diffDays >= 0 && diffDays % interval === 0;
}

/**
 * Gera as ocorrências futuras (30 dias por padrão) para um medicamento
 * considerando DAILY/WEEKDAYS/INTERVAL + start/end + timesOfDay.
 */
export function generateOccurrencesForMedication(params: {
  med: MedicationDTO;
  daysAhead: number; // ex.: 30
  from?: Date;       // default: now
}): Occurrence[] {
  const { med, daysAhead, from = new Date() } = params;

  if (!med.isActive) return [];
  const times = (med.timesOfDay ?? []).filter(Boolean);

  if (times.length === 0) return [];

  const out: Occurrence[] = [];
  const startDay = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0);

  for (let i = 0; i <= daysAhead; i++) {
    const dayLocal = addDaysLocal(startDay, i);
    const dayYMD = ymdFromDateLocal(dayLocal);

    if (!withinMedicationWindow(med, dayYMD)) continue;
    if (!isDayAllowedBySchedule(med, dayLocal)) continue;

    for (const t of times) {
      out.push({
        timeOfDay: t,
        scheduledAtISO: makeLocalDateTimeISO(dayLocal, t),
      });
    }
  }

  // ordena por data/horário
  out.sort((a, b) => a.scheduledAtISO.localeCompare(b.scheduledAtISO));
  return out;
}