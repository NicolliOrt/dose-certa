// src/screens/Reports/utils.ts
import type { IntakeDTO, IntakeStatus } from "../../types/api";

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toLocalYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatBR(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR");
}

export function dateFromYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function diffDaysInclusive(startYMD: string, endYMD: string) {
  const s = dateFromYMD(startYMD).getTime();
  const e = dateFromYMD(endYMD).getTime();
  const days = Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(0, days);
}

export function groupByLocalDay(intakes: IntakeDTO[]) {
  const map: Record<string, IntakeDTO[]> = {};
  for (const it of intakes) {
    const d = new Date(it.scheduledAt);
    const key = toLocalYMD(d);
    if (!map[key]) map[key] = [];
    map[key].push(it);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }
  return map;
}

export function statusLabel(s: IntakeStatus) {
  if (s === "TAKEN") return "Tomado";
  if (s === "SKIPPED") return "Pulado";
  return "Perdido";
}

export function statusPillBg(status: IntakeStatus) {
  return status === "TAKEN"
    ? "#DCFCE7"
    : status === "SKIPPED"
    ? "#FEF3C7"
    : "#FEE2E2";
}