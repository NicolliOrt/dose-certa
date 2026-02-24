//src/screens/Home/componentes/SnookeModal.tsx

import React from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";
import { styles } from "../styles";

type Props = {
  visible: boolean;
  minutes: string;
  onChangeMinutes: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function SnoozeModal({ visible, minutes, onChangeMinutes, onClose, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Adiar medicação</Text>
          <Text style={styles.modalSubtitle}>Quantos minutos?</Text>

          <View style={styles.quickRow}>
            <Pressable style={styles.quickBtn} onPress={() => onChangeMinutes("10")}>
              <Text style={styles.quickText}>10</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => onChangeMinutes("30")}>
              <Text style={styles.quickText}>30</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => onChangeMinutes("60")}>
              <Text style={styles.quickText}>60</Text>
            </Pressable>
          </View>

          <TextInput
            value={minutes}
            onChangeText={onChangeMinutes}
            keyboardType="number-pad"
            placeholder="Ex: 15"
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={onClose}>
              <Text style={styles.modalBtnTextDark}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.modalBtn, styles.modalConfirm]} onPress={onConfirm}>
              <Text style={styles.modalBtnTextLight}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}