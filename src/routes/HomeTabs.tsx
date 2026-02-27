// src/routes/HomeTabs.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Home } from "../screens/Home";
import { Medications } from "../screens/Medications";
import { Reports } from "../screens/Reports";

import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../services/supabaseClient";

import { ensureNotificationPermission, cancelAllDoseRemindersForUser } from "../services/reminderScheduler";
import { clearAllSnoozesForUser, clearExpiredSnoozesForUser } from "../services/snoozeStore";

import { scheduleNext30DaysForMedication } from "../services/reminderPlanner";
import { doseApi } from "../services";

type TabsParamList = {
  Today: { userId: string; userName: string };
  Meds: { userId: string; userName: string };
  Reports: { userId: string; userName: string };
};

const Tab = createMaterialTopTabNavigator<TabsParamList>();

export function HomeTabs() {
  const insets = useSafeAreaInsets();
  const { booting, session, userId, userName } = useAuth();

  // ✅ evita rodar o agendamento várias vezes em sequência (race)
  const didPlanRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    if (didPlanRef.current) return;

    didPlanRef.current = true;

    (async () => {
      try {
        await ensureNotificationPermission();
        await clearExpiredSnoozesForUser(userId);

        // ✅ COMEÇA COM 7 ou 14 DIAS (pra estabilizar APK). Depois sobe pra 30 com batch.
        const DAYS = 14;

        const meds = await doseApi.listMedications(true);
        // ⚠️ evita Promise.all gigante travar o app: faz em sequência
        for (const m of meds) {
          await scheduleNext30DaysForMedication({ userId, med: m, daysAhead: DAYS });
        }
      } catch (e) {
        console.log("[planner error]", e);
        // se falhar, permite tentar de novo numa próxima abertura
        didPlanRef.current = false;
      }
    })();
  }, [userId]);

  async function onLogout() {
    try {
      if (userId) {
        await cancelAllDoseRemindersForUser(userId);
        await clearAllSnoozesForUser(userId);
      }

      const { error } = await supabase.auth.signOut();
      if (error) Alert.alert("Erro", error.message);
      // ✅ RootNavigator troca pra Login automaticamente
    } catch {
      Alert.alert("Erro", "Não foi possível sair.");
    }
  }

  if (booting) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: "#6B7280", fontWeight: "700" }}>Carregando…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={[styles.topRow, { paddingTop: insets.top + 10 }]}>
          <View style={{ width: 120 }} />
          <View style={{ width: 120, alignItems: "flex-end" }}>
            <TouchableOpacity onPress={onLogout} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.topLink}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.centerHeader}>
          <Text style={styles.brandTitle}>Dose Certa</Text>
          <Text style={styles.brandSubtitle} numberOfLines={1}>
            Gerenciando: {userName}
          </Text>
        </View>

        <Tab.Navigator
          initialRouteName="Today"
          screenOptions={{
            swipeEnabled: true,
            tabBarScrollEnabled: false,
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: styles.tabItem,
            tabBarIndicatorStyle: styles.indicator,
            tabBarActiveTintColor: "#111827",
            tabBarInactiveTintColor: "#6B7280",
            tabBarPressColor: "transparent",
            tabBarBounces: Platform.OS === "ios",
            tabBarLabel: ({ color, children }) => (
              <Text style={[styles.tabLabel, { color }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                {children}
              </Text>
            ),
          }}
        >
          <Tab.Screen name="Today" component={Home} options={{ title: "Hoje" }} initialParams={{ userId, userName }} />
          <Tab.Screen
            name="Meds"
            component={Medications}
            options={{ title: "Todos os Remédios" }}
            initialParams={{ userId, userName }}
          />
          <Tab.Screen name="Reports" component={Reports} options={{ title: "Relatórios" }} initialParams={{ userId, userName }} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  topRow: { paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topLink: { color: "#111827", fontWeight: "700" },

  centerHeader: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, alignItems: "center" },
  brandTitle: { fontSize: 16, fontWeight: "900", color: "#4F46E5" },
  brandSubtitle: { marginTop: 4, fontSize: 12, color: "#6B7280", fontWeight: "700" },

  tabBar: { marginHorizontal: 16, marginBottom: 10, borderRadius: 14, backgroundColor: "#E5E7EB", padding: 4, elevation: 0, shadowOpacity: 0 },
  tabItem: { borderRadius: 12, minHeight: 48, paddingHorizontal: 6 },
  tabLabel: { fontSize: 12, fontWeight: "800", textTransform: "none", textAlign: "center" },
  indicator: { height: "100%", borderRadius: 12, backgroundColor: "#FFFFFF" },
});