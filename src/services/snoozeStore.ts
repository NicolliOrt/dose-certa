// src/services/snoozeStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SnoozeEntry = {
  key: string; // `${medicationId}:${scheduledAtISO}` (sem user aqui)
  snoozedUntilISO: string;
  createdAtISO: string;
};

const PREFIX = "dosecerta:snooze:";

function storageKey(userId: string, key: string) {
  // namespace por user
  return `${PREFIX}${userId}:${key}`;
}

// src/services/snoozeStore.ts
export function makeDoseKey(medicationId: string, scheduledAtISO: string) {
  return `${medicationId}:${scheduledAtISO}`;
}


export async function getSnooze(userId: string, key: string): Promise<SnoozeEntry | null> {
  const raw = await AsyncStorage.getItem(storageKey(userId, key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SnoozeEntry;
  } catch {
    return null;
  }
}

export async function setSnooze(userId: string, key: string, snoozedUntilISO: string): Promise<void> {
  const entry: SnoozeEntry = {
    key,
    snoozedUntilISO,
    createdAtISO: new Date().toISOString(),
  };
  await AsyncStorage.setItem(storageKey(userId, key), JSON.stringify(entry));
}

export async function clearSnooze(userId: string, key: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId, key));
}

/**
 *Apaga TODOS os snoozes do usuário (recomendado no logout).
 */
export async function clearAllSnoozesForUser(userId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const userPrefix = `${PREFIX}${userId}:`;
  const snoozeKeys = keys.filter((k) => k.startsWith(userPrefix));
  if (snoozeKeys.length === 0) return;
  await AsyncStorage.multiRemove(snoozeKeys);
}

/**
 * Limpa snoozes vencidos do usuário.
 */
export async function clearExpiredSnoozesForUser(userId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const userPrefix = `${PREFIX}${userId}:`;
  const snoozeKeys = keys.filter((k) => k.startsWith(userPrefix));
  if (snoozeKeys.length === 0) return;

  const entries = await AsyncStorage.multiGet(snoozeKeys);
  const now = Date.now();

  const toRemove: string[] = [];

  for (const [k, raw] of entries) {
    if (!raw) {
      toRemove.push(k);
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as SnoozeEntry;
      const until = new Date(parsed.snoozedUntilISO).getTime();
      if (!Number.isFinite(until) || until <= now) {
        toRemove.push(k);
      }
    } catch {
      toRemove.push(k);
    }
  }

  if (toRemove.length > 0) {
    await AsyncStorage.multiRemove(toRemove);
  }
}

export async function clearAllSnoozesForMedication(userId: string, medicationId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const userPrefix = `${PREFIX}${userId}:${medicationId}:`;
  const snoozeKeys = keys.filter((k) => k.startsWith(userPrefix));
  if (snoozeKeys.length === 0) return;
  await AsyncStorage.multiRemove(snoozeKeys);
}
