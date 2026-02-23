import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/AuthProvider";
import { DataProvider } from "@/providers/DataProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="point/[id]"
        options={{
          title: "Détails du point",
          headerStyle: {
            backgroundColor: '#F8F6F3',
          },
          headerTintColor: '#C65D3B',
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          title: "Connexion",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: "Inscription",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="kamdem/validation"
        options={{
          title: "À valider",
          headerStyle: {
            backgroundColor: '#F8F6F3',
          },
          headerTintColor: '#C65D3B',
        }}
      />
      <Stack.Screen
        name="admin/dashboard"
        options={{
          title: "Dashboard Admin",
          headerStyle: {
            backgroundColor: '#F8F6F3',
          },
          headerTintColor: '#C65D3B',
        }}
      />
      <Stack.Screen
        name="admin/users"
        options={{
          title: "Gestion utilisateurs",
          headerStyle: {
            backgroundColor: '#F8F6F3',
          },
          headerTintColor: '#C65D3B',
        }}
      />
      <Stack.Screen
        name="+not-found"
        options={{
          title: "Page introuvable",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <DataProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </DataProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
