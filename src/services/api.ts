//src/services/api.ts

import axios from "axios";
import { supabase, SUPABASE_URL_RAW, SUPABASE_ANON } from "./supabaseClient";

const DEFAULT_TIMEOUT_MS = 10000; 

function joinUrl(a: string, b: string) {
  return `${a.replace(/\/$/, "")}/${b.replace(/^\//, "")}`;
}

// Base da Edge Function "express"
const RAW =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  joinUrl(SUPABASE_URL_RAW, "/functions/v1/express");

// contrato é /v1
const API_BASE_URL = joinUrl(RAW, "/v1");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: SUPABASE_ANON,
  },
});

// ✅ adiciona o timezone offset do device em todas as requests
api.interceptors.request.use((config) => {
  const tz = new Date().getTimezoneOffset(); // ex: 180 no Brasil
  config.headers = config.headers ?? {};
  config.headers["x-tz-offset-minutes"] = String(tz);
  return config;
});

// ✅ adiciona Bearer automaticamente (se tiver sessão)
api.interceptors.request.use(async (config) => {
  if (!supabase) return config;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {  
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// debug de erro
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.baseURL
      ? `${error.config.baseURL}${error.config.url ?? ""}`
      : error?.config?.url;

    console.log("[API ERROR]", {
      status,
      url,
      message: error?.message,
      data: error?.response?.data,
    });

    return Promise.reject(error);
  }
);
