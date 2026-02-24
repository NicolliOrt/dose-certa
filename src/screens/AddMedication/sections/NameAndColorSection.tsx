//src/screens/AddMedication/sections/NameAndColorSection.tsx


import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../styles";

type Props = {
  name: string;
  onChangeName: (v: string) => void;
  colors: string[];
  selectedColor: string;
  onSelectColor: (c: string) => void;
};

export function NameAndColorSection({ name, onChangeName, colors, selectedColor, onSelectColor }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Nome e Identificação</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex: Losartana"
        placeholderTextColor="#6B7280"
        value={name}
        onChangeText={onChangeName}
      />

      <Text style={styles.subLabel}>Cor da etiqueta:</Text>
      <View style={styles.colorRow}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.colorSelected]}
            onPress={() => onSelectColor(color)}
          />
        ))}
      </View>
    </View>
  );
}