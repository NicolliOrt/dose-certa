// src/screens/StartupGate.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../services/supabaseClient";
import { api } from "../services/api";

export function StartupGate({ navigation }: any) {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) Checa sessão (persistSession)
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error || !data.session?.access_token) {
          // sem sessão => vai pro Login
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          return;
        }

        // 2) Bootstrapa a conta do app (cria/atualiza Account)
        // Pode mandar {} que o backend usa email como fallback.
        await api.post("/auth/bootstrap", {});

        // 3) Entra no app
        navigation.reset({ index: 0, routes: [{ name: "HomeTabs" }] });
      } catch (e: any) {
        // Se deu erro de auth, derruba sessão e volta pro Login
        const status = e?.response?.status;
        if (status === 401) {
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          return;
        }

        // Se foi erro geral (ex.: backend fora), ainda entra no app
        // (ou você pode escolher travar aqui e mostrar erro)
        navigation.reset({ index: 0, routes: [{ name: "HomeTabs" }] });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
