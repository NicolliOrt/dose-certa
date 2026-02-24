//src/screens/Login/auth.ts

import { supabase } from "../../services/supabaseClient";

export async function forgotPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export async function signUp(params: { email: string; password: string; name: string; birthDateYMD: string }) {
  const { email, password, name, birthDateYMD } = params;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name.trim(),
        birthDate: birthDateYMD,
      },
    },
  });
}

export async function signIn(params: { email: string; password: string }) {
  return supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
}