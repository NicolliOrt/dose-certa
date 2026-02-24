// src/screens/Reports/pdf.ts
import type { MedicationDTO, IntakeDTO } from "../../types/api";
import { formatBR, pad2, statusLabel } from "./utils";

type Computed = {
  daysInRange: number;
  totalTaken: number;
  totalExpected: number;
  adherenceRate: number; // %
  medStats: Array<{
    medication: MedicationDTO;
    expected: number;
    taken: number;
    rate: number; // %
  }>;
  logsByDay: Record<string, IntakeDTO[]>;
};

export function generateReportHtml(params: {
  startYMD: string;
  endYMD: string;
  computed: Computed;
  meds: MedicationDTO[];
}) {
  const { startYMD, endYMD, computed, meds } = params;

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Arial, sans-serif; padding: 24px; color: #111827; }
        h1 { margin: 0 0 8px; }
        .muted { color: #6B7280; margin-bottom: 18px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0 22px; }
        .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px; }
        .title { font-weight: 800; margin-bottom: 6px; }
        .big { font-size: 20px; font-weight: 900; }
        .barwrap { background: #E5E7EB; border-radius: 8px; height: 10px; overflow: hidden; }
        .bar { height: 10px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #F3F4F6; font-size: 12px; }
        .day { margin-top: 18px; font-weight: 800; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; }
        .taken { background: #ECFDF5; color: #065F46; }
        .skipped { background: #FFFBEB; color: #92400E; }
        .missed { background: #FEF2F2; color: #991B1B; }
      </style>
    </head>
    <body>
      <h1>Dose Certa — Relatório</h1>
      <div class="muted">Período: ${formatBR(startYMD)} a ${formatBR(endYMD)}</div>

      <div class="grid">
        <div class="card"><div class="title">Doses Tomadas</div><div class="big">${computed.totalTaken}</div></div>
        <div class="card"><div class="title">Doses Esperadas</div><div class="big">${computed.totalExpected}</div></div>
        <div class="card"><div class="title">Taxa de Adesão</div><div class="big">${computed.adherenceRate}%</div></div>
        <div class="card"><div class="title">Dias no Período</div><div class="big">${computed.daysInRange}</div></div>
      </div>

      <h2>Estatísticas por Medicamento</h2>
      ${computed.medStats
        .map((s) => {
          const color = s.medication.color ?? "#4F46E5";
          const dose = s.medication.dosageText ?? "";
          return `
            <div class="card" style="margin-top:10px; border-left: 6px solid ${color};">
              <div style="display:flex; justify-content: space-between; gap: 12px;">
                <div>
                  <div class="title">${s.medication.name}</div>
                  <div class="muted" style="margin:0;">${dose}</div>
                </div>
                <div style="text-align:right;">
                  <div class="title">${s.taken} de ${s.expected}</div>
                  <div class="muted" style="margin:0;">${s.rate}%</div>
                </div>
              </div>
              <div style="margin-top:10px;" class="barwrap">
                <div class="bar" style="width:${Math.min(100, s.rate)}%; background:${color};"></div>
              </div>
            </div>
          `;
        })
        .join("")}

      <h2 style="margin-top:18px;">Registro Diário</h2>
      ${
        Object.keys(computed.logsByDay).length === 0
          ? `<div class="muted">Nenhum registro no período selecionado.</div>`
          : Object.keys(computed.logsByDay)
              .sort()
              .reverse()
              .map((day) => {
                const list = computed.logsByDay[day];
                const dayDate = new Date(day + "T00:00:00");
                const dayLabel = dayDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                const rows = list
                  .map((it) => {
                    const m = meds.find((x) => x.id === it.medicationId);
                    const medName = m?.name ?? "Medicamento";
                    const sched = new Date(it.scheduledAt);
                    const hh = pad2(sched.getHours());
                    const mm = pad2(sched.getMinutes());
                    const schedHHMM = `${hh}:${mm}`;

                    const pillClass =
                      it.status === "TAKEN"
                        ? "taken"
                        : it.status === "SKIPPED"
                        ? "skipped"
                        : "missed";

                    return `
                      <tr>
                        <td>${medName}</td>
                        <td>${schedHHMM}</td>
                        <td><span class="pill ${pillClass}">${statusLabel(it.status)}</span></td>
                      </tr>
                    `;
                  })
                  .join("");

                return `
                  <div class="day">${dayLabel}</div>
                  <table>
                    <thead>
                      <tr><th>Medicamento</th><th>Horário</th><th>Status</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                  </table>
                `;
              })
              .join("")
      }
    </body>
  </html>
  `;
}