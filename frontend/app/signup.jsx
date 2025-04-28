import { Text, TextInput, View, Pressable, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from "react";
import g_logo from "@/assets/images/g_logo.png";
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_500Medium } from '@expo-google-fonts/poppins';
import { router } from "expo-router";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirmPassword, setIsFocusedConfirmPassword] = useState(false);
  
  // Error messages and form state
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium
  });

  if (!fontsLoaded) {
    return null;
  }

  // Simple Email validation regex
  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage("");  // Clear error message if all validations pass

    // Proceed with signup logic (e.g., API call, navigation)
    console.log("User signed up!");
    router.push("/login"); // Assuming you want to redirect to the login page
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full px-6 py-8 gap-6 justify-center items-center flex-1">
          
          {/* Welcome Text */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-black text-4xl font-semibold font-poppins-medium">Create Account</Text>
            <Text className="text-black text-4xl font-semibold font-poppins-medium">on SafeStreet</Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="text-red-500 text-lg font-poppins-regular">{errorMessage}</Text>
          ) : null}

          {/* Inputs and Buttons */}
          <View className="w-full gap-5">
            {/* Full Name Input */}
            <View>
              <Text className="text-gray-500 mb-1 ml-2 font-poppins-regular">Full Name</Text>
              <TextInput 
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                className={`bg-white text-black px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedName ? 'border-black-500' : 'border-gray-500'}`}
                style={{ textAlignVertical: 'center' }}
                placeholderTextColor="gray"
                onFocus={() => setIsFocusedName(true)}
                onBlur={() => setIsFocusedName(false)}
              />
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-gray-500 mb-1 ml-2 font-poppins-regular">E-mail</Text>
              <TextInput 
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                className={`bg-white text-black px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedEmail ? 'border-black-500' : 'border-gray-500'}`}
                style={{ textAlignVertical: 'center' }}
                placeholderTextColor="gray"
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-500 mb-1 ml-2 font-poppins-regular">Password</Text>
              <View className="relative">
                <TextInput 
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  className={`bg-white text-black px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedPassword ? 'border-black-500' : 'border-gray-500'}`}
                  style={{ textAlignVertical: 'center' }}
                  placeholderTextColor="gray"
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsFocusedPassword(true)}
                  onBlur={() => setIsFocusedPassword(false)}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute bottom-3.5 right-3"
                >
                  <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={24} color="black" />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-gray-500 mb-1 ml-2 font-poppins-regular">Confirm Password</Text>
              <View className="relative">
                <TextInput 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className={`bg-white text-black px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedConfirmPassword ? 'border-black-500' : 'border-gray-500'}`}
                  style={{ textAlignVertical: 'center' }}
                  placeholderTextColor="gray"
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setIsFocusedConfirmPassword(true)}
                  onBlur={() => setIsFocusedConfirmPassword(false)}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute bottom-3.5 right-3"
                >
                  <FontAwesome5 name={showConfirmPassword ? "eye" : "eye-slash"} size={24} color="black" />
                </Pressable>
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable className="items-center bg-black rounded-full px-5 py-4 mt-2" onPress={handleSignup}>
              <Text className="text-white font-semibold text-lg font-poppins-regular">Sign Up</Text>
            </Pressable>

            {/* Continue with Google Button */}
            <Pressable className="items-center bg-black rounded-full px-5 py-4 flex-row justify-center gap-2 mb-6">
              <Image source={g_logo} style={{ width: 28, height: 28, backgroundColor: 'black' }} />
              <Text className="text-white font-semibold text-lg font-poppins-regular">Continue with Google</Text> 
            </Pressable>
          </View>

          {/* Already have an account? - No longer using absolute positioning */}
          <View className="mb-4">
            <Text className="font-semibold text-gray-500 text-center font-poppins-regular">
              Already have an account?
              <Pressable onPress={() => router.push('/')}>
                <Text className="text-black underline font-poppins-regular top-2">
                  {' '}Login
                </Text>
              </Pressable>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}