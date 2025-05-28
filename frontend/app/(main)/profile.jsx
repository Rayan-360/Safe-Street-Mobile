import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  // Dummy user data
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const name = await AsyncStorage.getItem('userName');
      const email = await AsyncStorage.getItem('userEmail');
      setUser({ name: name || 'N/A', email: email || 'N/A' });
    };
    fetchUser();
  }, []);

  const handleEditProfile = () => {
    Alert.alert(
      "Edit Profile",
      "This would open a modal to edit your profile information.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          onPress: async () => {
            // Clear all login-related data
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userName");
            await AsyncStorage.removeItem("userEmail");

            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-8 pb-6">
          {/* Profile Header Section */}
          <View className="items-center mb-8">
            {/* Profile Picture with Edit Icon */}
            <View className="relative mb-4">
              <View className="h-32 w-32 rounded-full overflow-hidden border-2 border-blue-400">
                <FontAwesome name="user-circle" color="black" size={110} />
              </View>

              {/* Edit Icon Overlay */}
              <TouchableOpacity
                onPress={handleEditProfile}
                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full border-2 border-gray-900"
              >
                <FontAwesome5 name="pencil-alt" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text className="text-white text-2xl font-bold">{user.name}</Text>
            <Text className="text-gray-400 text-base mt-1">{user.email}</Text>
          </View>

          {/* Profile Actions Section */}
          {/* <View className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
            <TouchableOpacity
              onPress={handleEditProfile}
              className="flex-row items-center justify-between bg-gray-700 p-4 rounded-lg mb-4"
            >
              <View className="flex-row items-center">
                <FontAwesome5 name="user-edit" size={18} color="#38BDF8" />
                <Text className="text-white text-lg ml-3">Edit Profile</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View> */}

          {/* Account Actions */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 py-4 rounded-lg mb-6"
          >
            <Text className="text-white text-center font-bold text-lg">Logout</Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View className="flex-grow" />

          {/* App Version */}
          <Text className="text-white text-center text-xs mt-6">App Version: v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
