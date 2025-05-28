import { Text, TextInput, View, Pressable, StatusBar, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState,useEffect } from "react";
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_500Medium } from '@expo-google-fonts/poppins';
import { router } from "expo-router";
import axios from "axios"; // Import axios
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for local storage

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [identifier, setIdentifier] = useState(''); // State to hold email or username
  const [password, setPassword] = useState(''); // State to hold password

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }


  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.145.91:5000/login', {
        identifier, // This will be either email or username
        password
      });

      // Assuming you get a token on successful login
      const { token, user } = response.data;
      
      // You can store the token and user info in a context or async storage
      // console.log('Logged in successfully:', token, user);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userName', user.name);
        await AsyncStorage.setItem('userEmail', user.email);


      // Redirect to the home page or main route
      router.push('/(main)/');
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        // Handle backend error response
        Alert.alert('Login Failed', error.response.data.message);
      } else {
        // Handle network or other errors
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center items-center">
            <View className="w-full max-w-[500px] gap-8 justify-center items-center flex-1 py-10">

              {/* Welcome Text */}
              <View className="items-center gap-2">
                <Text className="text-white text-4xl font-semibold font-poppins-medium">Welcome Back</Text>
                <Text className="text-white text-4xl font-semibold font-poppins-medium">to SafeStreet</Text>
              </View>

              {/* Inputs and Buttons */}
              <View className="w-full gap-6">

                {/* Email or Username Input */}
                <View className="relative">
                  <Text className="text-gray-400 mb-2 ml-2 font-poppins-regular">E-mail or username</Text>
                  <TextInput
                    placeholder="Enter your email or username"
                    className={`bg-gray-800 text-white px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedEmail ? 'border-gray-500' : 'border-gray-700'}`}
                    style={{ textAlignVertical: 'center' }}
                    placeholderTextColor="#9CA3AF"
                    value={identifier}
                    onChangeText={setIdentifier} // Update identifier state
                    onFocus={() => setIsFocusedEmail(true)}
                    onBlur={() => setIsFocusedEmail(false)}
                  />

                  <FontAwesome5 className="absolute bottom-4 right-5" name="user" size={20} color="#9CA3AF" />
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-gray-400 mb-2 ml-2 font-poppins-regular">Password</Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Enter your password"
                      className={`bg-gray-800 text-white px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedPassword ? 'border-gray-500' : 'border-gray-700'}`}
                      style={{ textAlignVertical: 'center' }}
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword} // Update password state
                      onFocus={() => setIsFocusedPassword(true)}
                      onBlur={() => setIsFocusedPassword(false)}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4"
                    >
                      <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={20} color="#9CA3AF" />
                    </Pressable>
                  </View>
                </View>

                {/* Forgot Password */}
                <Text className="font-semibold text-gray-400 text-right font-poppins-regular">Forgot Password?</Text>

                {/* Login Button */}
                <Pressable onPress={handleLogin} className="items-center bg-gray-100 rounded-full px-5 py-4">
                  <Text className="text-gray-900 font-semibold text-lg font-poppins-regular">Login</Text>
                </Pressable>

                {/* Signup Link */}
                <View className="mt-8 flex-row justify-center items-center">
                  <Text className="font-semibold text-gray-400 font-poppins-regular">
                    New to SafeStreet?
                  </Text>
                  <Pressable onPress={() => router.push('/signup')}>
                    <Text className="text-gray-300 underline ml-1 font-poppins-regular">
                      Sign up
                    </Text>
                  </Pressable>
                </View>


              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
