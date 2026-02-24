//src/screens/Home/components/TodayRow.tsx

import React, { useEffect, useState } from "react";
import type { ScheduleItemDTO, IntakeStatus } from "../../../types/api";
import { MedicationCard } from "../../../components/MedicationCard";

import { getSnooze } from "../../../services/snoozeStore";
import { makeDoseKey } from "../../../services/snoozeStore";
import { formatHHMMFromISO } from "../utils";

type Props = {
  row: ScheduleItemDTO;
  now: number;
  toleranceMs: number;
  userId: string;

  onMarked: () => void;
  onSkipped: () => void;
  onSnooze: () => void;
  onUndo: () => void;
};

export function TodayRow({ row, now, toleranceMs, userId, onMarked, onSkipped, onSnooze, onUndo }: Props) {
  const [snoozeLabel, setSnoozeLabel] = useState<string | null>(null);
  const [uiStatus, setUiStatus] = useState<IntakeStatus | null>(row.intake?.status ?? null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const key = makeDoseKey(row.medicationId, row.scheduledAt);

      if (row.intake?.status) {
        if (!mounted) return;
        setUiStatus(row.intake.status);
        setSnoozeLabel(null);
        return;
      }

      const sno = await getSnooze(userId, key);
      const effectiveISO = sno?.snoozedUntilISO ?? row.scheduledAt;

      const effectiveMs = new Date(effectiveISO).getTime();
      const isMissed = now > effectiveMs + toleranceMs;

      if (!mounted) return;
      setUiStatus(isMissed ? "MISSED" : null);
      setSnoozeLabel(sno?.snoozedUntilISO ? formatHHMMFromISO(sno.snoozedUntilISO) : null);
    })();

    return () => {
      mounted = false;
    };
  }, [row.intake?.status, row.scheduledAt, row.medicationId, now, toleranceMs, userId]);

  return (
    <MedicationCard
      mode="today"
      showDelete={false}
      name={row.medicationName}
      details={row.details || ""}
      time={row.timeOfDay}
      color={row.color}
      notes={row.notes ?? null}
      intakeStatus={uiStatus}
      snoozedUntilLabel={snoozeLabel}
      onPressCheck={onMarked}
      onPressSkip={onSkipped}
      onPressSnooze={onSnooze}
      onPressUndo={row.intake ? onUndo : undefined}
    />
  );
}