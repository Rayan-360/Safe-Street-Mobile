import { Text, TextInput, View, Pressable, StatusBar, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from "react";
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_500Medium } from '@expo-google-fonts/poppins';
import { router } from "expo-router";
import axios from 'axios'; // Add Axios for API requests

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

  const handleSignup = async () => {
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

  try {
    // Send POST request to your backend API for signup
    console.log('Sending signup data:', { name, email, password });
    const response = await axios.post('http://192.168.145.91:5000/signup', {
      name,
      email,
      password,
    });

    if (response.status === 201) {
      // Success case: user created
      console.log('Signup successful:', response.data);
      alert("Signup successful! Please check your email to verify your account.");
      router.replace("/(auth)/login");
    } else if (response.status === 400) {
      // Validation error: email or username already exists
      setErrorMessage(response.data.message || "Invalid input");
    } else {
      // General failure
      setErrorMessage(response.data.message || "Signup failed, please try again.");
    }
  } catch (error) {
    console.error(error);
    if(error.response){
      // Handle backend error response
      Alert.alert('Signup Failed', error.response.data.message);
      setErrorMessage(error.response.data.message || "Something went wrong.");
    }
    else {
            Alert.alert('Error', 'Something went wrong. Please try again.');
          }
  }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-gray-900"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full px-6 py-8 gap-6 justify-center items-center flex-1">
          
          {/* Welcome Text */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-white text-4xl font-semibold font-poppins-medium">Create Account</Text>
            <Text className="text-white text-4xl font-semibold font-poppins-medium">on SafeStreet</Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="text-red-500 text-lg font-poppins-regular">{errorMessage}</Text>
          ) : null}

          {/* Inputs and Buttons */}
          <View className="w-full gap-5">
            {/* Full Name Input */}
            <View>
              <Text className="text-gray-400 mb-1 ml-2 font-poppins-regular">Full Name</Text>
              <TextInput 
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                className={`bg-gray-800 text-white px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedName ? 'border-gray-500' : 'border-gray-700'}`}
                style={{ textAlignVertical: 'center' }}
                placeholderTextColor="#9CA3AF"
                onFocus={() => setIsFocusedName(true)}
                onBlur={() => setIsFocusedName(false)}
              />
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-gray-400 mb-1 ml-2 font-poppins-regular">E-mail</Text>
              <TextInput 
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                className={`bg-gray-800 text-white px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedEmail ? 'border-gray-500' : 'border-gray-700'}`}
                style={{ textAlignVertical: 'center' }}
                placeholderTextColor="#9CA3AF"
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-400 mb-1 ml-2 font-poppins-regular">Password</Text>
              <View className="relative">
                <TextInput 
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  className={`bg-gray-800 text-white px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedPassword ? 'border-gray-500' : 'border-gray-700'}`}
                  style={{ textAlignVertical: 'center' }}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsFocusedPassword(true)}
                  onBlur={() => setIsFocusedPassword(false)}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute bottom-4 right-3"
                >
                  <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={20} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-gray-400 mb-1 ml-2 font-poppins-regular">Confirm Password</Text>
              <View className="relative">
                <TextInput 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className={`bg-gray-800 text-white px-5 py-3 text-lg rounded-full border font-poppins-regular ${isFocusedConfirmPassword ? 'border-gray-500' : 'border-gray-700'}`}
                  style={{ textAlignVertical: 'center' }}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setIsFocusedConfirmPassword(true)}
                  onBlur={() => setIsFocusedConfirmPassword(false)}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute bottom-4 right-3"
                >
                  <FontAwesome5 name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable className="items-center bg-gray-100 rounded-full px-5 py-4 mt-2" onPress={handleSignup}>
              <Text className="text-gray-900 font-semibold text-lg font-poppins-regular">Sign Up</Text>
            </Pressable>

          </View>

          {/* Already have an account? - No longer using absolute positioning */}
          <View className="mb-4">
            <Text className="font-semibold text-gray-400 text-center font-poppins-regular">
              Already have an account?
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text className="text-gray-300 underline font-poppins-regular top-2">
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
