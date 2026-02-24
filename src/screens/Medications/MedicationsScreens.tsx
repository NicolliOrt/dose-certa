//src/screens/Medications/MedicationsScreens.tsx


import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Plus } from "lucide-react-native";

import { MedicationCard } from "../../components/MedicationCard";
import { doseApi } from "../../services";
import type { MedicationDTO } from "../../types/api";

import { styles } from "./styles";
import { getTimesText } from "./utils";
import { confirmRemoveMedication } from "./actions";

export function MedicationsScreen({ navigation, route }: any) {
const { userId } = route.params || { userId: "" };
  const [medications, setMedications] = useState<MedicationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await doseApi.listMedications(true);
      setMedications(list);
    } catch (e) {
      console.error("Erro ao carregar medications:", e);
      Alert.alert("Erro", "Não foi possível carregar os remédios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Sincronizando...</Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum remédio ativo no momento.</Text>}
          renderItem={({ item }) => {
            const timesText = getTimesText(item);

            return (
              <MedicationCard
                mode="medications"
                name={item.name}
                details={item.dosageText ?? ""}
                time={timesText || "Sem horário"}
                color={item.color}
                notes={item.notes ?? null}
                onPressDelete={() => confirmRemoveMedication(userId, item, load)}
              />
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddMedication")}>
        <Plus color="#FFF" size={32} />
      </TouchableOpacity>
    </View>
  );
}