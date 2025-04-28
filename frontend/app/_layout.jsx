import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import '@/global.css'; // For NativeWind

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#E0F7FA" />
      
      <View style={{ flex: 1, backgroundColor: '#E0F7FA' }}>
        <Stack screenOptions={{headerShown:false}}/>
      </View>
    </SafeAreaProvider>
  );
}
