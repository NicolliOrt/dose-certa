//src/auth/AuthProvider.tsx

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";

type AuthState = {
  booting: boolean;
  session: any | null;
  userId: string;
  userName: string;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    // pega sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setBooting(false);
    });

    // escuta mudanças
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => {
    const uid = session?.user?.id ?? "";
    const metaName =
      (session?.user?.user_metadata?.name as string | undefined) ??
      (session?.user?.user_metadata?.full_name as string | undefined) ??
      "Paciente";

    return {
      booting,
      session,
      userId: uid,
      userName: metaName?.trim() || "Paciente",
    };
  }, [booting, session]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
