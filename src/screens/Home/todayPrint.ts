// src/screens/Home/todayPrint.ts
import type { ScheduleItemDTO } from "../../types/api";

function formatDatePTBR(d = new Date()) {
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateTodayChecklistHtml(items: ScheduleItemDTO[]) {
  const today = formatDatePTBR(new Date());

  const sorted = [...items].sort((a, b) => {
    // prioriza timeOfDay se existir; fallback scheduledAt
    const ta = a.timeOfDay ?? "";
    const tb = b.timeOfDay ?? "";
    if (ta && tb) return ta.localeCompare(tb);
    return a.scheduledAt.localeCompare(b.scheduledAt);
  });

  const rows =
    sorted.length === 0
      ? `<div class="muted">Nada agendado para hoje.</div>`
      : `
        <table>
          <thead>
            <tr>
              <th>Horário</th>
              <th>Medicamento</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            ${sorted
              .map((it) => {
                const obs = it.details || it.notes || "";
                return `
                  <tr>
                    <td class="time">${it.timeOfDay ?? ""}</td>
                    <td class="name">${it.medicationName}</td>
                    <td class="obs">${obs}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      `;

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Arial, sans-serif; padding: 18px; color: #111827; }
        h1 { margin: 0 0 6px; font-size: 20px; }
        .muted { color: #6B7280; font-weight: 700; font-size: 12px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #E5E7EB; font-size: 12px; vertical-align: top; }
        th { font-size: 12px; color: #374151; font-weight: 900; background: #F9FAFB; }
        .time { font-weight: 900; white-space: nowrap; width: 70px; }
        .name { font-weight: 900; }
        .obs { color: #374151; }
        @media print {
          tr { break-inside: avoid; page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Dose Certa — Lista de hoje</h1>
      <div class="muted">${today}</div>
      ${rows}
    </body>
  </html>
  `;
}