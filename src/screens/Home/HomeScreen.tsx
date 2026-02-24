// src/screens/Home/HomeScreen.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Plus } from "lucide-react-native";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { doseApi } from "../../services";
import type { ScheduleItemDTO } from "../../types/api";

import { getSnooze, setSnooze, clearSnooze, makeDoseKey } from "../../services/snoozeStore";
import { scheduleDoseReminder, cancelDoseReminder } from "../../services/reminderScheduler";

import { MISSED_TOLERANCE_MIN } from "./constants";
import { styles } from "./styles";
import { TodayRow } from "./components/TodayRow";
import { SnoozeModal } from "./components/SnoozeModal";

import { generateTodayChecklistHtml } from "./todayPrint";

export function HomeScreen({ navigation, route }: any) {
  const { userId } = route.params || { userId: "" };
  if (!userId) return null;

  const [items, setItems] = useState<ScheduleItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());

  const [snoozeVisible, setSnoozeVisible] = useState(false);
  const [snoozeMinutes, setSnoozeMinutes] = useState("10");
  const [snoozeTarget, setSnoozeTarget] = useState<ScheduleItemDTO | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await doseApi.getTodaySchedule();
      setItems(list);

      const now = Date.now();

      await Promise.all(
        list.map(async (it) => {
          const key = makeDoseKey(it.medicationId, it.scheduledAt);

          if (it.intake?.status) {
            await cancelDoseReminder(userId, key);
            await clearSnooze(userId, key);
            return;
          }

          const sno = await getSnooze(userId, key);
          const effectiveISO = sno?.snoozedUntilISO ?? it.scheduledAt;
          const effectiveDate = new Date(effectiveISO);

          if (effectiveDate.getTime() > now + 30_000) {
            await scheduleDoseReminder({
              userId,
              key,
              title: "Hora da medicação",
              body: `${it.medicationName} • ${it.timeOfDay}`,
              triggerAt: effectiveDate,
            });
          } else {
            await cancelDoseReminder(userId, key);
          }
        })
      );
    } catch (e) {
      console.error("Erro ao carregar schedule/today:", e);
      Alert.alert("Erro", "Não foi possível carregar a agenda de hoje.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function printTodayChecklist() {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Indisponível", "Compartilhamento não está disponível neste dispositivo.");
        return;
      }

      const html = generateTodayChecklistHtml(items);
      const file = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(file.uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartilhar lista de hoje",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      console.error("Erro PDF hoje:", e);
      Alert.alert("Erro", "Não foi possível gerar a lista de hoje.");
    }
  }

  async function handleToggleMarked(item: ScheduleItemDTO) {
    const key = makeDoseKey(item.medicationId, item.scheduledAt);

    try {
      if (!item.intake) {
        await doseApi.createIntake({
          medicationId: item.medicationId,
          scheduledAt: item.scheduledAt,
          status: "TAKEN",
          note: null,
        });

        await cancelDoseReminder(userId, key);
        await clearSnooze(userId, key);
      } else {
        await doseApi.deleteIntake(item.intake.id);
      }

      await load();
    } catch (e) {
      console.error("Erro ao marcar/desfazer intake:", e);
      Alert.alert("Erro", "Não foi possível atualizar a marcação.");
    }
  }

  async function handleToggleSkipped(item: ScheduleItemDTO) {
    const key = makeDoseKey(item.medicationId, item.scheduledAt);

    try {
      if (!item.intake) {
        await doseApi.createIntake({
          medicationId: item.medicationId,
          scheduledAt: item.scheduledAt,
          status: "SKIPPED",
          note: null,
        });

        await cancelDoseReminder(userId, key);
        await clearSnooze(userId, key);
      } else {
        await doseApi.deleteIntake(item.intake.id);
      }

      await load();
    } catch (e) {
      console.error("Erro ao pular/desfazer intake:", e);
      Alert.alert("Erro", "Não foi possível atualizar a marcação.");
    }
  }

  async function handleUndo(item: ScheduleItemDTO) {
    if (!item.intake) return;

    const key = makeDoseKey(item.medicationId, item.scheduledAt);

    try {
      await doseApi.deleteIntake(item.intake.id);

      await cancelDoseReminder(userId, key);
      await clearSnooze(userId, key);

      await load();
    } catch (e) {
      console.error("Erro ao desfazer intake:", e);
      Alert.alert("Erro", "Não foi possível desfazer a marcação.");
    }
  }

  function openSnooze(item: ScheduleItemDTO) {
    setSnoozeTarget(item);
    setSnoozeMinutes("10");
    setSnoozeVisible(true);
  }

  async function confirmSnooze() {
    if (!snoozeTarget) {
      setSnoozeVisible(false);
      return;
    }

    const minutes = Math.max(1, parseInt(snoozeMinutes, 10) || 10);
    const key = makeDoseKey(snoozeTarget.medicationId, snoozeTarget.scheduledAt);
    const until = new Date(Date.now() + minutes * 60_000).toISOString();

    try {
      await setSnooze(userId, key, until);

      await scheduleDoseReminder({
        userId,
        key,
        title: "Medicação adiada",
        body: `${snoozeTarget.medicationName} • lembrete em ${minutes} min`,
        triggerAt: new Date(until),
      });

      setSnoozeVisible(false);
      setSnoozeTarget(null);

      await load();
    } catch (e) {
      console.error("Erro ao adiar:", e);
      Alert.alert("Erro", "Não foi possível adiar a medicação.");
    }
  }

  const computed = useMemo(() => {
    const now = nowTick;
    const toleranceMs = MISSED_TOLERANCE_MIN * 60_000;
    return items.map((it) => ({ item: it, now, toleranceMs }));
  }, [items, nowTick]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Sincronizando...</Text>
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <TouchableOpacity
              onPress={printTodayChecklist}
              style={{
                height: 46,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                opacity: items.length === 0 ? 0.6 : 1,
              }}
              disabled={items.length === 0}
            >
              <Text style={{ color: "#FFF", fontWeight: "900" }}>Imprimir lista de hoje</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={computed}
            keyExtractor={({ item }) => `${item.medicationId}-${item.scheduledAt}`}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListEmptyComponent={<Text style={styles.emptyText}>Nada agendado para hoje.</Text>}
            renderItem={({ item: row }) => (
              <TodayRow
                row={row.item}
                toleranceMs={row.toleranceMs}
                now={row.now}
                userId={userId}
                onMarked={() => handleToggleMarked(row.item)}
                onSkipped={() => handleToggleSkipped(row.item)}
                onSnooze={() => openSnooze(row.item)}
                onUndo={() => handleUndo(row.item)}
              />
            )}
          />
        </>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddMedication")}>
        <Plus color="#FFF" size={32} />
      </TouchableOpacity>

      <SnoozeModal
        visible={snoozeVisible}
        minutes={snoozeMinutes}
        onChangeMinutes={setSnoozeMinutes}
        onClose={() => setSnoozeVisible(false)}
        onConfirm={confirmSnooze}
      />
    </View>
  );
}