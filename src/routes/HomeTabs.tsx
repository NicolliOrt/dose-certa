// src/routes/HomeTabs.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Home } from "../screens/Home";
import { Medications } from "../screens/Medications";
import { Reports } from "../screens/Reports";

import {
  ensureNotificationPermission,
  cancelAllDoseRemindersForUser,
} from "../services/reminderScheduler";
import {
  clearAllSnoozesForUser,
  clearExpiredSnoozesForUser,
} from "../services/snoozeStore";

import { supabase } from "../services/supabaseClient";

type TabsParamList = {
  Today: { userId: string; userName: string };
  Meds: { userId: string; userName: string };
  Reports: { userId: string; userName: string };
};

const Tab = createMaterialTopTabNavigator<TabsParamList>();

export function HomeTabs({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("Paciente");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function applySession(session: any) {
      const uid = session?.user?.id ?? "";

      if (!uid) {
        if (!mounted) return;
        setUserId("");
        setUserName("Paciente");
        setLoadingUser(false);

        //navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const metaName =
        (session?.user?.user_metadata?.name as string | undefined) ??
        (session?.user?.user_metadata?.full_name as string | undefined);

      if (!mounted) return;
      setUserId(uid);
      setUserName(metaName?.trim() ? metaName.trim() : "Paciente");
      setLoadingUser(false);
    }

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await applySession(data.session);
      } catch {
        if (!mounted) return;
        setLoadingUser(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      await ensureNotificationPermission();
      await clearExpiredSnoozesForUser(userId);
    })();
  }, [userId]);

  async function onLogout() {
    try {
      if (userId) {
        await cancelAllDoseRemindersForUser(userId);
        await clearAllSnoozesForUser(userId);
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      //navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch {
      Alert.alert("Erro", "Não foi possível sair.");
    }
  }

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: "#6B7280", fontWeight: "700" }}>
            Carregando…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={[styles.topRow, { paddingTop: insets.top + 10 }]}>
          <View style={{ width: 120 }} />
          <View style={{ width: 120, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={onLogout}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
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
      <Text
        style={[styles.tabLabel, { color }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {children}
      </Text>
    ),
  }}
>
          <Tab.Screen
            name="Today"
            component={Home}
            options={{ title: "Hoje" }}
            initialParams={{ userId, userName }}
          />
          <Tab.Screen
            name="Meds"
            component={Medications}
            options={{ title: "Todos os Remédios" }}
            initialParams={{ userId, userName }}
          />
          <Tab.Screen
            name="Reports"
            component={Reports}
            options={{ title: "Relatórios" }}
            initialParams={{ userId, userName }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1, backgroundColor: "#F3F4F6" },

  topRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topLink: { color: "#111827", fontWeight: "700" },

  centerHeader: {
  paddingHorizontal: 16,
  paddingTop: 6,
  paddingBottom: 8,
  alignItems: "center",
},
brandTitle: { fontSize: 16, fontWeight: "900", color: "#4F46E5" },
brandSubtitle: { marginTop: 4, fontSize: 12, color: "#6B7280", fontWeight: "700" },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoIcon: { fontSize: 28, color: "#FFF" },

  //brandTitle: { fontSize: 18, fontWeight: "900", color: "#4F46E5" },
  //brandSubtitle: { marginTop: 6, fontSize: 13, color: "#6B7280", fontWeight: "700" },

  tabBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    padding: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: { borderRadius: 12, minHeight: 48, paddingHorizontal: 6 },
  tabLabel: { fontSize: 12, fontWeight: "800", textTransform: "none", textAlign: "center" },
  indicator: { height: "100%", borderRadius: 12, backgroundColor: "#FFFFFF" },
});
