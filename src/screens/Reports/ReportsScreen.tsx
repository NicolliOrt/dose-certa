// src/screens/Reports/ReportsScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Calendar, Download, Activity, PieChart, Clock } from "lucide-react-native";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { doseApi } from "../../services";
import type { MedicationDTO, IntakeDTO } from "../../types/api";

import { styles } from "./styles";
import { AdherenceReportDTO } from "./reportTypes";
import { addDays, diffDaysInclusive, formatBR, groupByLocalDay, pad2, statusLabel, statusPillBg, toLocalYMD } from "./utils";
import { generateReportHtml } from "./PDF";

export function ReportsScreen() {
  const [startYMD, setStartYMD] = useState(() => {
    const d = addDays(new Date(), -7);
    return toLocalYMD(d);
  });
  const [endYMD, setEndYMD] = useState(() => toLocalYMD(new Date()));

  const [isLoading, setIsLoading] = useState(false);

  const [meds, setMeds] = useState<MedicationDTO[]>([]);
  const [intakes, setIntakes] = useState<IntakeDTO[]>([]);
  const [report, setReport] = useState<AdherenceReportDTO | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState<"start" | "end">("start");

  const openPicker = (field: "start" | "end") => {
    setPickerField(field);
    setPickerVisible(true);
  };

  const onConfirmPicker = (date: Date) => {
    const ymd = toLocalYMD(date);
    if (pickerField === "start") setStartYMD(ymd);
    else setEndYMD(ymd);
    setPickerVisible(false);
  };

  const load = useCallback(async () => {
    let s = startYMD;
    let e = endYMD;
    if (s > e) {
      [s, e] = [e, s];
      setStartYMD(s);
      setEndYMD(e);
    }

    setIsLoading(true);
    try {
      const [medList, intakeList, rep] = await Promise.all([
        doseApi.listMedications(true),
        doseApi.getIntakes(s, e),
        doseApi.getAdherence(s, e),
      ]);

      setMeds(medList);
      setIntakes(intakeList);
      setReport(rep ?? null);
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      Alert.alert("Erro", "Não foi possível carregar os relatórios.");
    } finally {
      setIsLoading(false);
    }
  }, [startYMD, endYMD]);

  React.useEffect(() => {
    load();
  }, [load]);

  const computed = useMemo(() => {
    const daysInRange = diffDaysInclusive(startYMD, endYMD);

    const totalTaken = report?.taken ?? 0;
    const totalExpected = report?.totalEvents ?? 0;
    const adherenceRate = Math.round((report?.adherenceRate ?? 0) * 100);

    const byMedication = report?.byMedication ?? [];

    const medStats = meds.map((m) => {
      const r = byMedication.find((x) => x.medicationId === m.id);
      const taken = r?.taken ?? 0;
      const skipped = r?.skipped ?? 0;
      const missed = r?.missed ?? 0;

      const expected = taken + skipped + missed;
      const rate = expected > 0 ? Math.round((taken / expected) * 100) : 0;

      return { medication: m, expected, taken, rate };
    });

    const logsByDay = groupByLocalDay(intakes);

    return {
      daysInRange,
      totalTaken,
      totalExpected,
      adherenceRate,
      medStats,
      logsByDay,
    };
  }, [startYMD, endYMD, meds, intakes, report]);

  async function generatePDF() {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Indisponível", "Compartilhamento não está disponível neste dispositivo.");
        return;
      }

      const html = generateReportHtml({ startYMD, endYMD, computed, meds });

      const file = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartilhar relatório",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      console.error("Erro PDF:", e);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Carregando relatórios...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Período do Relatório */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={18} color="#4F46E5" />
              <Text style={styles.cardTitle}>Período do Relatório</Text>
            </View>

            <Text style={styles.label}>Data Inicial</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => openPicker("start")}>
              <Text style={styles.dateText}>{formatBR(startYMD)}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 12 }]}>Data Final</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => openPicker("end")}>
              <Text style={styles.dateText}>{formatBR(endYMD)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pdfButton, { opacity: meds.length === 0 ? 0.6 : 1 }]}
              onPress={generatePDF}
              disabled={meds.length === 0}
            >
              <Download size={18} color="#FFF" />
              <Text style={styles.pdfText}>Gerar PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Cards de estatística */}
          <View style={styles.statCardBlue}>
            <View>
              <Text style={styles.statLabel}>Doses Tomadas</Text>
              <Text style={styles.statValue}>{computed.totalTaken}</Text>
            </View>
            <View style={styles.statIconWrapIndigo}>
              <Activity size={20} color="#4F46E5" />
            </View>
          </View>

          <View style={styles.statCardBlue}>
            <View>
              <Text style={styles.statLabel}>Doses Esperadas</Text>
              <Text style={styles.statValue}>{computed.totalExpected}</Text>
            </View>
            <View style={styles.statIconWrapIndigo}>
              <Calendar size={20} color="#4F46E5" />
            </View>
          </View>

          <View style={styles.statCardGreen}>
            <View>
              <Text style={styles.statLabel}>Taxa de Adesão</Text>
              <Text style={styles.statValue}>{computed.adherenceRate}%</Text>
            </View>
            <View style={styles.statIconWrapGreen}>
              <PieChart size={20} color="#16A34A" />
            </View>
          </View>

          <View style={styles.statCardPurple}>
            <View>
              <Text style={styles.statLabel}>Dias no Período</Text>
              <Text style={styles.statValue}>{computed.daysInRange}</Text>
            </View>
            <View style={styles.statIconWrapPurple}>
              <Clock size={20} color="#7C3AED" />
            </View>
          </View>

          {/* Estatísticas por Medicamento */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estatísticas por Medicamento</Text>

            {computed.medStats.length === 0 ? (
              <Text style={styles.emptyMuted}>Nenhum medicamento cadastrado.</Text>
            ) : (
              computed.medStats.map((s) => {
                const color = s.medication.color ?? "#4F46E5";
                return (
                  <View key={s.medication.id} style={[styles.medRow, { borderLeftColor: color }]}>
                    <View style={styles.medTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medName}>{s.medication.name}</Text>
                        {!!s.medication.dosageText && <Text style={styles.medDose}>{s.medication.dosageText}</Text>}
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.medCount}>
                          {s.taken} de {s.expected}
                        </Text>
                        <Text style={styles.medRate}>{s.rate}%</Text>
                      </View>
                    </View>

                    <View style={styles.progressWrap}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(100, s.rate)}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Registro Diário */}
          <View style={[styles.card, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Registro Diário</Text>

            {Object.keys(computed.logsByDay).length === 0 ? (
              <Text style={styles.emptyMuted}>Nenhum registro no período selecionado.</Text>
            ) : (
              Object.keys(computed.logsByDay)
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

                  return (
                    <View key={day} style={styles.dayBlock}>
                      <Text style={styles.dayTitle}>{dayLabel}</Text>

                      {list.map((it) => {
                        const med = meds.find((m) => m.id === it.medicationId);
                        const sched = new Date(it.scheduledAt);
                        const hhmm = `${pad2(sched.getHours())}:${pad2(sched.getMinutes())}`;
                        const color = med?.color ?? "#9CA3AF";

                        return (
                          <View key={it.id} style={styles.logRow}>
                            <View style={[styles.logDot, { backgroundColor: color }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.logMed}>{med?.name ?? "Medicamento"}</Text>
                              <Text style={styles.logMeta}>Horário previsto: {hhmm}</Text>
                            </View>

                            <View style={[styles.statusPill, { backgroundColor: statusPillBg(it.status) }]}>
                              <Text style={styles.statusText}>{statusLabel(it.status)}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })
            )}
          </View>
        </ScrollView>
      )}

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="date"
        onConfirm={onConfirmPicker}
        onCancel={() => setPickerVisible(false)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
    </View>
  );
}