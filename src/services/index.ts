// src/services/index.ts
import type { DoseCertaApi } from "./doseCertaApi";
import { doseCertaApiMock } from "./doseCertaApi.mock";
import { doseCertaApiHttp } from "./doseCertaApi.http";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const doseApi: DoseCertaApi = USE_MOCK ? doseCertaApiMock : doseCertaApiHttp;
