import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@/global.css';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false); // ✅ track if we've already redirected

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        setIsAuthenticated(!!userToken);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading || hasRedirected.current) return;

    const firstSegment = segments[0];
    console.log("Auth state:", isAuthenticated, "| Segment:", firstSegment);

    if (isAuthenticated) {
      if (firstSegment === "(auth)" || !firstSegment) {
        console.log("Redirecting auth user to main");
        hasRedirected.current = true;
        router.replace("/(main)/");
      }
    } else {
      if (firstSegment === "(main)" || !firstSegment) {
        console.log("Redirecting unauth user to login");
        hasRedirected.current = true;
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F7FA' }}>
        {/* Add a spinner or splash here */}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#E0F7FA" />
        <View style={{ flex: 1, backgroundColor: '#E0F7FA' }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
