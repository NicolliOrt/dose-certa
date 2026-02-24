//src/screens/AddMedication/sections/DurationSection.tsx


import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { styles } from "../styles";

type Props = {
  isContinuous: boolean;
  onToggleContinuous: (v: boolean) => void;

  startLabel: string;
  endLabel: string;

  onPressStart: () => void;
  onPressEnd: () => void;
};

export function DurationSection({
  isContinuous,
  onToggleContinuous,
  startLabel,
  endLabel,
  onPressStart,
  onPressEnd,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Duração</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Uso Contínuo (Sem data fim)</Text>
        <Switch
          value={isContinuous}
          onValueChange={onToggleContinuous}
          trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
          thumbColor={isContinuous ? "#3B82F6" : "#F3F4F6"}
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.dateButton} onPress={onPressStart}>
          <Text style={styles.dateLabel}>Data de Início</Text>
          <View style={styles.dateValueRow}>
            <Text style={styles.iconText}>📅</Text>
            <Text style={styles.dateValue}>{startLabel}</Text>
          </View>
        </TouchableOpacity>

        {!isContinuous && (
          <TouchableOpacity style={[styles.dateButton, { marginLeft: 10 }]} onPress={onPressEnd}>
            <Text style={styles.dateLabel}>Data de Fim</Text>
            <View style={styles.dateValueRow}>
              <Text style={styles.iconText}>🏁</Text>
              <Text style={styles.dateValue}>{endLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}