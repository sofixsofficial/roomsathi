import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, Text } from "react-native";
import { AuthContext } from "@/hooks/auth-store";
import { PropertyContext } from "@/hooks/property-store";
import { MessageContext } from "@/hooks/message-store";
import { LocationContext } from "@/hooks/location-store";
import { AdminContext } from "@/hooks/admin-store";
import { HistoryContext } from "@/hooks/history-store";
import { SessionContext } from "@/hooks/session-store";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Error preventing splash screen auto-hide:", err);
});

// Global error handlers: ensure native splash is hidden if JS crashes during startup
try {
  // Handle uncaught JS exceptions
  if (typeof (global as any).ErrorUtils !== "undefined") {
    const defaultHandler = (global as any).ErrorUtils.getGlobalHandler?.();
    (global as any).ErrorUtils.setGlobalHandler(
      (error: any, isFatal: boolean) => {
        console.error("Global JS error caught:", error);
        // Try to hide the splash screen so the app doesn't stay stuck
        SplashScreen.hideAsync().catch(() => {});
        if (defaultHandler) defaultHandler(error, isFatal);
      }
    );
  }

  // Unhandled promise rejections (some RN runtimes support this)
  (global as any).onunhandledrejection = (event: any) => {
    console.error("Unhandled promise rejection:", event);
    SplashScreen.hideAsync().catch(() => {});
  };
} catch (e) {
  console.warn("Failed to register global error handlers:", e);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/login"
        options={{ title: "Login", headerShown: false }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{ title: "Sign Up", headerShown: false }}
      />
      <Stack.Screen
        name="property/[id]"
        options={{ title: "Property Details" }}
      />
      <Stack.Screen name="messages/[id]" options={{ title: "Chat" }} />
      <Stack.Screen name="admin/users" options={{ title: "Manage Users" }} />
      <Stack.Screen
        name="admin/properties"
        options={{ title: "Manage Properties" }}
      />
      <Stack.Screen
        name="provider/my-listings"
        options={{ title: "My Property Listings" }}
      />
      <Stack.Screen
        name="provider/edit-property"
        options={{ title: "Edit Property" }}
      />
      <Stack.Screen
        name="provider/history"
        options={{ title: "Visit History" }}
      />
      <Stack.Screen
        name="profile/my-properties"
        options={{ title: "My Properties" }}
      />
      <Stack.Screen
        name="profile/account-settings"
        options={{ title: "Account Settings" }}
      />
      <Stack.Screen
        name="profile/help-center"
        options={{ title: "Help Center" }}
      />
      <Stack.Screen
        name="profile/privacy-policy"
        options={{ title: "Privacy Policy" }}
      />
      <Stack.Screen
        name="profile/visit-history"
        options={{ title: "Visit History" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Brief delay for native modules
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (e) {
        console.error("Error during app initialization:", e);
        setIsReady(true); // Continue anyway
      } finally {
        // Hide native splash screen
        try {
          await SplashScreen.hideAsync();
        } catch (hideError) {
          console.warn("Error hiding splash screen:", hideError);
        }
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null; // Show native splash screen
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SessionContext>
            <AuthContext>
              <LocationContext>
                <PropertyContext>
                  <MessageContext>
                    <AdminContext>
                      <HistoryContext>
                        <RootLayoutNav />
                      </HistoryContext>
                    </AdminContext>
                  </MessageContext>
                </PropertyContext>
              </LocationContext>
            </AuthContext>
          </SessionContext>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
