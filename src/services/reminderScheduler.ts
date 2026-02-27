// src/services/reminderScheduler.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "dosecerta:reminderId:";

function reminderIdKey(userId: string, key: string) {
  //  namespace por user
  return `${PREFIX}${userId}:${key}`;
}

export async function ensureNotificationPermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("dose-reminders", {
      name: "Lembretes de medicação",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  }
  return true;
}

async function getStoredReminderId(userId: string, key: string) {
  return AsyncStorage.getItem(reminderIdKey(userId, key));
}

async function setStoredReminderId(userId: string, key: string, id: string) {
  return AsyncStorage.setItem(reminderIdKey(userId, key), id);
}

async function clearStoredReminderId(userId: string, key: string) {
  return AsyncStorage.removeItem(reminderIdKey(userId, key));
}

export async function cancelDoseReminder(userId: string, key: string) {
  const existingId = await getStoredReminderId(userId, key);
  if (existingId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch {}
    await clearStoredReminderId(userId, key);
  }
}

export async function cancelAllDoseRemindersForMedication(userId: string, medicationId: string) {
  const keys = await AsyncStorage.getAllKeys();
  const userPrefix = `${PREFIX}${userId}:${medicationId}:`; 
  const reminderKeys = keys.filter((k) => k.startsWith(userPrefix));
  if (reminderKeys.length === 0) return;

  const entries = await AsyncStorage.multiGet(reminderKeys);

  await Promise.all(
    entries.map(async ([storageKey, notifId]) => {
      if (notifId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notifId);
        } catch {}
      }
      try {
        await AsyncStorage.removeItem(storageKey);
      } catch {}
    })
  );
}

/**
 * Cancela TODOS os lembretes do usuário (logout).
 */
export async function cancelAllDoseRemindersForUser(userId: string) {
  const keys = await AsyncStorage.getAllKeys();
  const userPrefix = `${PREFIX}${userId}:`;
  const reminderKeys = keys.filter((k) => k.startsWith(userPrefix));
  if (reminderKeys.length === 0) return;

  const entries = await AsyncStorage.multiGet(reminderKeys);

  await Promise.all(
    entries.map(async ([storageKey, notifId]) => {
      if (!notifId) {
        try {
          await AsyncStorage.removeItem(storageKey);
        } catch {}
        return;
      }

      try {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      } catch {}

      try {
        await AsyncStorage.removeItem(storageKey);
      } catch {}
    })
  );
}

export async function scheduleDoseReminder(params: {
  userId: string;
  key: string; // ex: `${medicationId}:${scheduledAtISO}` (igual snooze)
  title: string;
  body: string;
  triggerAt: Date;
}) {
  // sempre sobrescreve o mesmo key
  await cancelDoseReminder(params.userId, params.key);

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  // se já passou, não agenda
  if (params.triggerAt.getTime() <= Date.now() + 1000) return;

  /*const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      sound: true,
      ...(Platform.OS === "android" ? { channelId: "dose-reminders" } : null),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.triggerAt,
    },
  });*/

  const id = await Notifications.scheduleNotificationAsync({
  content: {
    title: params.title,
    body: params.body,
    sound: true,
    ...(Platform.OS === "android"
      ? {
          channelId: "dose-reminders",
          priority: Notifications.AndroidNotificationPriority.MAX,
        }
      : null),
  },
  trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.triggerAt,
    },
});

  await setStoredReminderId(params.userId, params.key, id);
}
