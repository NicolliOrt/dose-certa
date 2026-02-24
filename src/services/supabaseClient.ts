// src/services/supabaseClient.ts
import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").trim();
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const SUPABASE_URL_RAW = SUPABASE_URL;

// ✅ ISSO precisa ser a key COMPLETA (pra usar no header `apikey`)
export const SUPABASE_ANON = SUPABASE_ANON_KEY;

// ✅ opcional: só pra debug sem vazar a key inteira
export const SUPABASE_ANON_PREVIEW = SUPABASE_ANON_KEY
  ? `${SUPABASE_ANON_KEY.slice(0, 8)}...`
  : "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// ✅ storage compatível com web + mobile
const storage =
  Platform.OS === "web"
    ? {
        getItem: (key: string) => (typeof localStorage === "undefined" ? null : localStorage.getItem(key)),
        setItem: (key: string, value: string) => {
          if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          if (typeof localStorage !== "undefined") localStorage.removeItem(key);
        },
      }
    : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web", // web true, mobile false
  },
});
