// src/storage/medicationStorage.ts
import { api } from '../services/api';

// =======================
// MEDICATIONS (FINAL-FIRST)
// =======================

// GET (lista meds do profile)
export async function loadMedicationsFromStorage(profileId?: string) {
  if (!profileId) return [];

  try {
    // ✅ FINAL (contrato): /v1/profiles/:profileId/medications?active=true
    const res = await api.get(`/v1/profiles/${profileId}/medications`, {
      params: { active: true },
    });
    return res.data;
  } catch (e: any) {
    // fallback pro protótipo atual, se o back ainda não implementou /v1
    try {
      const res2 = await api.get('/medications', {
        params: { profileId },
      });
      return res2.data;
    } catch (e2) {
      console.error("Erro ao carregar da API:", e2);
      return [];
    }
  }
}

// POST (cria med no profile)
export async function addNewMedicationToStorage(newMed: any, profileId?: string) {
  if (!profileId) throw new Error("profileId é obrigatório");

  try {
    // ✅ FINAL (contrato): POST /v1/profiles/:profileId/medications
    await api.post(`/v1/profiles/${profileId}/medications`, newMed);
  } catch (e: any) {
    // fallback pro protótipo atual, se o back ainda não implementou /v1
    try {
      await api.post('/medications', newMed, {
        params: { profileId },
      });
    } catch (e2) {
      console.error("Erro ao salvar na API:", e2);
      throw e2;
    }
  }
}

// DELETE (hard delete)
export async function removeMedicationFromStorage(id: string, profileId?: string) {
  try {
    // ✅ FINAL (contrato): DELETE /v1/medications/:id
    await api.delete(`/v1/medications/${id}`);
  } catch (e: any) {
    // fallback pro protótipo atual
    try {
      await api.delete(`/medications/${id}`);
    } catch (e2) {
      console.error("Erro ao deletar:", e2);
      return [];
    }
  }

  return await loadMedicationsFromStorage(profileId);
}

export async function saveMedicationsToStorage(_medications: any[]) {
  console.log("saveMedicationsToStorage ignorado (usando API direta)");
}
