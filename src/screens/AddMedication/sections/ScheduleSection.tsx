//src/screens/AddMedication/sections/ScheduleSection.tsx


import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import type { ScheduleType } from "../../../types/api";
import { styles } from "../styles";

type Props = {
  scheduleType: ScheduleType;
  onChangeScheduleType: (t: ScheduleType) => void;

  weekdayLabels: readonly string[];
  selectedWeekdays: number[];
  onToggleWeekday: (idx: number) => void;

  intervalDays: string;
  onChangeIntervalDays: (v: string) => void;

  times: string[];
  onAddTime: () => void;
  onRemoveTime: (t: string) => void;
};

export function ScheduleSection({
  scheduleType,
  onChangeScheduleType,
  weekdayLabels,
  selectedWeekdays,
  onToggleWeekday,
  intervalDays,
  onChangeIntervalDays,
  times,
  onAddTime,
  onRemoveTime,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Quando tomar?</Text>

      <View style={styles.tabs}>
        {(["DAILY", "WEEKDAYS", "INTERVAL"] as ScheduleType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, scheduleType === t && styles.tabActive]}
            onPress={() => onChangeScheduleType(t)}
          >
            <Text style={[styles.tabText, scheduleType === t && styles.tabTextActive]}>
              {t === "DAILY" ? "Todo Dia" : t === "WEEKDAYS" ? "Semana" : "Ciclo"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {scheduleType === "WEEKDAYS" && (
        <View style={styles.weekRow}>
          {weekdayLabels.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayCircle, selectedWeekdays.includes(index) && styles.dayCircleActive]}
              onPress={() => onToggleWeekday(index)}
            >
              <Text style={[styles.dayText, selectedWeekdays.includes(index) && styles.dayTextActive]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {scheduleType === "INTERVAL" && (
        <View>
          <Text style={styles.subLabel}>A cada quantos dias?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2 (Dia sim, dia não)"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={intervalDays}
            onChangeText={onChangeIntervalDays}
          />
        </View>
      )}

      <View style={styles.rowBetween}>
        <Text style={styles.subLabel}>Horários ({times.length})</Text>
        <TouchableOpacity style={styles.addButtonSmall} onPress={onAddTime}>
          <Text style={styles.addSmallText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timesGrid}>
        {times.map((t) => (
          <View key={t} style={styles.timeChip}>
            <Text style={styles.iconText}>⏰</Text>
            <Text style={styles.timeChipText}>{t}</Text>
            <TouchableOpacity onPress={() => onRemoveTime(t)}>
              <Text style={{ color: "#EF4444", fontWeight: "bold", fontSize: 16 }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {times.length === 0 && <Text style={styles.emptyText}>Nenhum horário definido.</Text>}
      </View>
    </View>
  );
}