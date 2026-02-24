//src/screens/AddMedication/AddMedicationScreen.tsx


import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { doseApi } from "../../services";
import type { ScheduleType } from "../../types/api";
import type { CreateMedicationPayload } from "../../services/doseCertaApi";

import { PRESET_COLORS, FORMS, UNITS, WEEKDAY_LABELS } from "./constants";
import { buildDosageText, formatDateBR, mapUiWeekdaysToApi, sortTimesStrict, toHHMM, toYMD } from "./utils";
import { styles } from "./styles";

import { NameAndColorSection } from "./sections/NameAndColorSection";
import { DetailsSection } from "./sections/DetailsSection";
import { DurationSection } from "./sections/DurationSection";
import { ScheduleSection } from "./sections/ScheduleSection";

export function AddMedicationScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");

  const [strength, setStrength] = useState("");
  const [unit, setUnit] = useState("mg");
  const [quantity, setQuantity] = useState("");
  const [form, setForm] = useState("Comprimido");

  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[3]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isContinuous, setIsContinuous] = useState(true);

  const [scheduleType, setScheduleType] = useState<ScheduleType>("DAILY");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState("");

  const [times, setTimes] = useState<string[]>([]);

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [currentDateField, setCurrentDateField] = useState<"start" | "end">("start");

  const startLabel = useMemo(() => formatDateBR(startDate), [startDate]);
  const endLabel = useMemo(() => formatDateBR(endDate), [endDate]);

  const openDatePicker = (field: "start" | "end") => {
    setPickerMode("date");
    setCurrentDateField(field);
    setPickerVisible(true);
  };

  const openTimePicker = () => {
    setPickerMode("time");
    setPickerVisible(true);
  };

  const onConfirmPicker = (date: Date) => {
    if (pickerMode === "date") {
      currentDateField === "start" ? setStartDate(date) : setEndDate(date);
    } else {
      const hhmm = toHHMM(date);
      setTimes((prev) => (prev.includes(hhmm) ? prev : sortTimesStrict([...prev, hhmm])));
    }
    setPickerVisible(false);
  };

  const removeTime = (t: string) => setTimes((prev) => prev.filter((x) => x !== t));

  const toggleWeekday = (idx: number) => {
    setSelectedWeekdays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]));
  };

  async function handleSave() {
    if (!name.trim() || times.length === 0) {
      return Alert.alert("Faltam dados", "Preencha o nome do remédio e adicione pelo menos um horário.");
    }

    if (!isContinuous && toYMD(endDate) < toYMD(startDate)) {
      return Alert.alert("Datas inválidas", "A data final não pode ser antes da data inicial.");
    }

    const qtyNum = quantity.trim() ? Number(quantity.trim()) : null;
    const strengthNum = strength.trim() ? Number(strength.trim()) : null;

    const dosageText = buildDosageText({ quantity, form, strength, unit });

    const weekDaysFinal = scheduleType === "WEEKDAYS" ? mapUiWeekdaysToApi(selectedWeekdays) : [];
    const intervalFinal = intervalDays.trim() ? Number(intervalDays.trim()) : null;

    const payloadFinal: CreateMedicationPayload = {
      name: name.trim(),

      strengthValue: Number.isFinite(strengthNum as any) ? strengthNum : null,
      strengthUnit: strengthNum ? unit : null,

      quantityPerDose: Number.isFinite(qtyNum as any) ? qtyNum : null,
      form: form?.trim() ? form.trim() : null,

      color: selectedColor,
      notes: notes?.trim() ? notes.trim() : null,
      doctorName: doctor?.trim() ? doctor.trim() : null,
      purpose: null,

      startDate: toYMD(startDate),
      endDate: isContinuous ? null : toYMD(endDate),
      isContinuous,

      scheduleType,
      weekDays: scheduleType === "WEEKDAYS" ? weekDaysFinal : [],
      intervalDays: scheduleType === "INTERVAL" ? (intervalFinal ?? null) : null,

      dosageText: dosageText || null,
      timesOfDay: sortTimesStrict(times),
    };

    try {
      await doseApi.createMedication(payloadFinal);
      navigation.goBack();
    } catch (e) {
      console.error("Erro ao salvar medicamento:", e);
      Alert.alert("Erro", "Não foi possível salvar o medicamento.");
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Novo Medicamento</Text>

        <NameAndColorSection
          name={name}
          onChangeName={setName}
          colors={PRESET_COLORS}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />

        <DetailsSection
          forms={FORMS}
          units={UNITS}
          form={form}
          onSelectForm={setForm}
          strength={strength}
          onChangeStrength={setStrength}
          quantity={quantity}
          onChangeQuantity={setQuantity}
          unit={unit}
          onSelectUnit={setUnit}
          doctor={doctor}
          onChangeDoctor={setDoctor}
          notes={notes}
          onChangeNotes={setNotes}
        />

        <DurationSection
          isContinuous={isContinuous}
          onToggleContinuous={setIsContinuous}
          startLabel={startLabel}
          endLabel={endLabel}
          onPressStart={() => openDatePicker("start")}
          onPressEnd={() => openDatePicker("end")}
        />

        <ScheduleSection
          scheduleType={scheduleType}
          onChangeScheduleType={setScheduleType}
          weekdayLabels={WEEKDAY_LABELS}
          selectedWeekdays={selectedWeekdays}
          onToggleWeekday={toggleWeekday}
          intervalDays={intervalDays}
          onChangeIntervalDays={setIntervalDays}
          times={times}
          onAddTime={openTimePicker}
          onRemoveTime={removeTime}
        />
      </ScrollView>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={pickerMode}
        onConfirm={onConfirmPicker}
        onCancel={() => {
          setPickerVisible(false);
          setPickerMode("date");
        }}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar Medicamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}