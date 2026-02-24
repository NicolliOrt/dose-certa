//src/routes/AppRoutes.tsx

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "../auth/AuthProvider";
import { Login } from "../screens/Login";
import { HomeTabs } from "./HomeTabs";
import { AddMedication } from "../screens/AddMedication";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { booting, session } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            <Stack.Screen
              name="AddMedication"
              component={AddMedication}
              options={{ headerShown: true, title: "Novo Remédio" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function AppRoutes() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
