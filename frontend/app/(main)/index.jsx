import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity,Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {

  const [userName, setUserName] = React.useState("");
  const GetUser = async () => {
    const name = await AsyncStorage.getItem("userName");
    setUserName(name || "User");
  }
  useEffect(()=>{
    GetUser();
  },[]);

  return (
    <ScrollView className="flex-1 bg-gray-900 px-6 pt-12">
      {/* Welcome Header */}
      <Text className="text-white text-4xl font-bold mb-3">
        Welcome back {userName}!!
      </Text>
      <Text className="text-gray-400 text-lg mb-8">
        Helping you report road damages quickly and keep streets safer.
      </Text>

      {/* Features Section */}
      <View className="space-y-6 gap-2">
        <FeatureCard
          icon="camera-alt"
          title="Easy Damage Reporting"
          description="Snap a photo and report road issues instantly."
        />
        <FeatureCard
          icon="map"
          title="Real-Time Location"
          description="Your reports include precise location data automatically."
        />
        <FeatureCard
          icon="notifications"
          title="Stay Updated"
          description="Get notified when your reports are reviewed or resolved."
        />
      </View>

      {/* CTA Button */}
      <Pressable
        className="bg-blue-600 rounded-full mt-12 py-4 items-center shadow-lg"
        android_ripple={{ color: "#2563EB" }}
        onPress={() => router.push("/(main)/upload")}
      >
        <Text className="text-white text-lg font-semibold">
          Report New Damage
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const FeatureCard = ({ icon, title, description }) => (
  <View className="flex-row items-start bg-gray-800 rounded-xl p-4 shadow-md">
    <MaterialIcons name={icon} size={32} color="#3B82F6" />
    <View className="ml-4 flex-1">
      <Text className="text-white font-semibold text-lg">{title}</Text>
      <Text className="text-gray-400 mt-1 text-sm">{description}</Text>
    </View>
  </View>
);
