import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "@/hooks/auth-store";
import { PropertyContext } from "@/hooks/property-store";
import { MessageContext } from "@/hooks/message-store";
import { LocationContext } from "@/hooks/location-store";
import { AdminContext } from "@/hooks/admin-store";
import { HistoryContext } from "@/hooks/history-store";
import { SessionContext } from "@/hooks/session-store";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import AppSplashScreen from "./splash";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const handleSplashFinish = useCallback(() => {
    console.log('Splash finished, navigating to onboarding...');
    setShowSplash(false);
    setTimeout(() => {
      router.replace('/onboarding');
    }, 100);
  }, [router]);

  if (showSplash) {
    return <AppSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: "Login", headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ title: "Sign Up", headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ title: "Property Details" }} />
      <Stack.Screen name="messages/[id]" options={{ title: "Chat" }} />
      <Stack.Screen name="admin/users" options={{ title: "Manage Users" }} />
      <Stack.Screen name="admin/properties" options={{ title: "Manage Properties" }} />
      <Stack.Screen name="provider/my-listings" options={{ title: "My Property Listings" }} />
      <Stack.Screen name="provider/edit-property" options={{ title: "Edit Property" }} />
      <Stack.Screen name="provider/history" options={{ title: "Visit History" }} />
      <Stack.Screen name="profile/my-properties" options={{ title: "My Properties" }} />
      <Stack.Screen name="profile/account-settings" options={{ title: "Account Settings" }} />
      <Stack.Screen name="profile/help-center" options={{ title: "Help Center" }} />
      <Stack.Screen name="profile/privacy-policy" options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="profile/visit-history" options={{ title: "Visit History" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
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