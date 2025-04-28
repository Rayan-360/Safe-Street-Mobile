import { Text, TextInput, View, Pressable, StatusBar, Image } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from "react";
import g_logo from "@/assets/images/g_logo.png";
import g_logo_1 from "@/assets/images/g_logo_1.png";
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_500Medium } from '@expo-google-fonts/poppins';
import { router } from "expo-router";

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white overflow-hidden">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="w-full px-6 gap-8 justify-center items-center flex-1">
        
        {/* Welcome Text */}
        <View className="items-center gap-2">
          <Text className="text-black text-4xl font-semibold font-poppins-medium">Welcome Back</Text>
          <Text className="text-black text-4xl font-semibold font-poppins-medium">to SafeStreet</Text>
        </View>

        {/* Inputs and Buttons */}
        <View className="w-full gap-6">
          
          {/* Email Input */}
          <View>
            <Text className="text-gray-500 mb-2 ml-2 font-poppins-regular">E-mail</Text>
            <TextInput 
              placeholder="Enter your email" 
              className={`bg-white text-black px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedEmail ? 'border-black-500' : 'border-gray-500'}`}
              style={{ textAlignVertical: 'center' }}   // 🛠️ Centering placeholder
              placeholderTextColor="gray"
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-gray-500 mb-2 ml-2 font-poppins-regular">Password</Text>
            <View className="relative">
              <TextInput 
                placeholder="Enter your password" 
                className={`bg-white text-black px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedPassword ? 'border-black-500' : 'border-gray-500'}`}
                style={{ textAlignVertical: 'center' }}   // 🛠️ Centering placeholder
                placeholderTextColor="gray"
                secureTextEntry={!showPassword}
                onFocus={() => setIsFocusedPassword(true)}
                onBlur={() => setIsFocusedPassword(false)}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute bottom-3.5 right-3">
                <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={24} color="black" />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <Text className="font-semibold text-gray-500 left-[60%] bottom-3 font-poppins-regular">Forgot Password?</Text>

          {/* Login Button */}
          <Pressable className="items-center bottom-2 bg-black rounded-full px-5 py-4">
            <Text className="text-white font-semibold text-lg font-poppins-regular">Login</Text>
          </Pressable>

          {/* Continue with Google Button */}
          <Pressable className="items-center bottom-2 bg-black rounded-full px-5 py-4 flex-row justify-center gap-2">
            <Image source={g_logo} style={{ width: 28, height: 28, backgroundColor: 'black' }} />
            <Text className="text-white font-semibold text-lg font-poppins-regular">Continue with Google</Text> 
          </Pressable>

          {/* Signup Link */}
          <Text className="font-semibold text-gray-500 text-center top-20 font-poppins-regular">
            New to SafeStreet?
            <Pressable onPress={() => router.push('/signup')}>
              <Text className="text-black underline top-2 font-poppins-regular">
                {' '}Sign up
              </Text>
            </Pressable>
          </Text>

        </View>
      </View>
    </View>
  );
}
