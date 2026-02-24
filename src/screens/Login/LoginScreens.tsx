//src/screens/Login/LoginScreen.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { styles } from "./styles";
import { formatBRFromYMD, toYMD } from "./utils";
import { forgotPassword, signIn, signUp } from "./auth";

export function LoginScreen({ navigation }: any) {
  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [birthDateYMD, setBirthDateYMD] = useState("");
  const [birthPickerVisible, setBirthPickerVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const birthDateLabel = useMemo(() => {
    if (!birthDateYMD) return "Selecionar data";
    return formatBRFromYMD(birthDateYMD);
  }, [birthDateYMD]);

  function openBirthPicker() {
    setBirthPickerVisible(true);
  }

  function onConfirmBirth(date: Date) {
    setBirthDateYMD(toYMD(date));
    setBirthPickerVisible(false);
  }

  async function onForgotPassword() {
    const e = email.trim();
    if (!e) {
      Alert.alert("Informe o email", "Digite o email para enviarmos o link de redefinição.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await forgotPassword(e);

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Pronto", "Enviamos um link de redefinição para o seu email.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit() {
    const e = email.trim();

    try {
      setLoading(true);

      if (!e || !password.trim()) {
        Alert.alert("Faltam dados", "Preencha email e senha.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      if (isSignUp) {
        if (!name.trim()) {
          Alert.alert("Faltam dados", "Preencha seu nome.");
          return;
        }
        if (!birthDateYMD) {
          Alert.alert("Faltam dados", "Selecione sua data de nascimento.");
          return;
        }
        if (password !== confirm) {
          Alert.alert("Senhas diferentes", "As senhas não coincidem.");
          return;
        }

        const { data, error } = await signUp({
          email: e,
          password,
          name,
          birthDateYMD,
        });

        if (error) {
          Alert.alert("Erro", error.message);
          return;
        }

        if (data?.session) {
          Alert.alert("Conta criada", "Tudo certo! Você já está logada.");
        } else {
          Alert.alert("Conta criada", "Sua conta foi criada. Uma confirmação foi enviada para seu endereço de e-mail.");
        }
        return;
      }

      const { data, error } = await signIn({ email: e, password });

      console.log("SIGNIN", {
        error: error?.message,
        hasSession: !!data?.session,
        userId: data?.session?.user?.id,
      });

      if (error) {
        Alert.alert("Erro", "Email ou senha incorretos.");
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#EEF2FF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>⚗️</Text>
            </View>
            <Text style={styles.brand}>Dose Certa</Text>
            <Text style={styles.subtitle}>{isSignUp ? "Criar sua conta" : "Entre na sua conta"}</Text>
          </View>

          {isSignUp && (
            <>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                editable={!loading}
              />

              <Text style={styles.label}>Data de Nascimento</Text>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={openBirthPicker}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={[styles.inputButtonText, !birthDateYMD && { color: "#9CA3AF" }]}>
                  {birthDateYMD ? birthDateLabel : "Selecione sua data"}
                </Text>
                <Text style={styles.inputButtonIcon}>📅</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />

          {isSignUp && (
            <>
              <Text style={styles.label}>Confirme sua Senha</Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Digite sua senha novamente"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                style={styles.input}
                editable={!loading}
              />
            </>
          )}

          {!isSignUp && (
            <TouchableOpacity style={styles.forgotWrap} onPress={onForgotPassword} disabled={loading}>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{isSignUp ? "Criar Conta" : "Entrar"}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => {
              setIsSignUp((v) => !v);
              setConfirm("");
            }}
            disabled={loading}
          >
            <Text style={styles.link}>{isSignUp ? "Já tem uma conta? Entre aqui" : "Não tem uma conta? Cadastre-se"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={birthPickerVisible}
        mode="date"
        onConfirm={onConfirmBirth}
        onCancel={() => setBirthPickerVisible(false)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
    </KeyboardAvoidingView>
  );
}