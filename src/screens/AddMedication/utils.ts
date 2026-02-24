export function sortTimesStrict(arr: string[]) {
  return [...arr].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
}

export const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const toHHMM = (d: Date) => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export function formatDateBR(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

// UI 0..6 (Dom..Sáb) -> API 1..7 (Dom..Sáb)
export function mapUiWeekdaysToApi(uiDays: number[]) {
  return uiDays.map((d) => d + 1).sort((a, b) => a - b);
}

export function buildDosageText(params: {
  quantity: string;
  form: string;
  strength: string;
  unit: string;
}) {
  const qty = params.quantity.trim();
  const form = params.form.trim();
  const strengthNum = params.strength.trim() ? Number(params.strength.trim()) : null;

  const qtyPart = qty ? qty : "";
  const formPart = form ? form : "";
  const strengthPart = strengthNum ? `${strengthNum}${params.unit}` : "";

  return (strengthPart ? `${qtyPart} ${formPart} de ${strengthPart}` : `${qtyPart} ${formPart}`).trim();
}