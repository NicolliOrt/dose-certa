//src/screens/AddMedication/sections/DetailsSection.tsx

import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { styles } from "../styles";

type Props = {
  forms: string[];
  units: string[];

  form: string;
  onSelectForm: (v: string) => void;

  strength: string;
  onChangeStrength: (v: string) => void;

  quantity: string;
  onChangeQuantity: (v: string) => void;

  unit: string;
  onSelectUnit: (v: string) => void;

  doctor: string;
  onChangeDoctor: (v: string) => void;

  notes: string;
  onChangeNotes: (v: string) => void;
};

export function DetailsSection({
  forms,
  units,
  form,
  onSelectForm,
  strength,
  onChangeStrength,
  quantity,
  onChangeQuantity,
  unit,
  onSelectUnit,
  doctor,
  onChangeDoctor,
  notes,
  onChangeNotes,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Detalhes do Medicamento</Text>

      <Text style={styles.subLabel}>Formato:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {forms.map((f) => (
          <TouchableOpacity key={f} style={[styles.chip, form === f && styles.chipActive]} onPress={() => onSelectForm(f)}>
            <Text style={[styles.chipText, form === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.subLabel}>Dosagem</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={strength}
            onChangeText={onChangeStrength}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.subLabel}>Qtd. por vez</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 1"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={quantity}
            onChangeText={onChangeQuantity}
          />
        </View>
      </View>

      <Text style={styles.subLabel}>Unidade:</Text>
      <View style={styles.wrapRow}>
        {units.map((u) => (
          <TouchableOpacity key={u} style={[styles.chipSmall, unit === u && styles.chipActive]} onPress={() => onSelectUnit(u)}>
            <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.subLabel}>Médico (Opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Dr. Silva"
        placeholderTextColor="#6B7280"
        value={doctor}
        onChangeText={onChangeDoctor}
      />

      <Text style={styles.subLabel}>Observações</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Ex: Tomar em jejum, tomar com refeição, dissolver em água..."
        placeholderTextColor="#6B7280"
        value={notes}
        onChangeText={onChangeNotes}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}