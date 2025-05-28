import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UploadScreen() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    city: '',
    area: '',
  });
  const [comments, setComments] = useState('');
  const [hasImagePermission, setHasImagePermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitUserConfirmation, setAwaitUserConfirmation] = useState(false);
  const [lastRoadProbability, setLastRoadProbability] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const imgPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasImagePermission(imgPerm.status === 'granted');

      const locPerm = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locPerm.status === 'granted');

      if (imgPerm.status !== 'granted' || locPerm.status !== 'granted') {
        Alert.alert('Permissions required', 'Please grant camera and location permissions.');
      }
    })();
  }, []);

  // Scroll to location input when edit mode is toggled
  useEffect(() => {
    if (isEditable && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isEditable]);

  const pickImage = async (fromCamera = false) => {
    if (!hasImagePermission) {
      Alert.alert('Permission Denied', 'Image permission is not granted.');
      return;
    }

    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        setImage(selectedAsset.uri);
        fetchLocation(); // auto-fetch location after selecting image
      }
    } catch (error) {
      console.warn('Image pick error:', error);
    }
  };

  const fetchLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Permission Denied', 'Location permission is not granted.');
      return;
    }

    setLoadingLocation(true);
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      const apiKey = 'pk.cd966f62e847e0572bb86b986148b7be'; // Replace with your LocationIQ key
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();

      setLocation({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        city: data.address.city || data.address.county || data.address.state || '',
        area: data.address.neighbourhood || data.address.suburb || '',
      });
    } catch (error) {
      console.warn('Location fetch error:', error);
      Alert.alert('Location Error', 'Failed to fetch location. Try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch location suggestions based on user input
  const fetchLocationSuggestions = async (query) => {
    if (!query) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const apiKey = 'pk.cd966f62e847e0572bb86b986148b7be'; // Replace with your LocationIQ key
      const response = await fetch(
        `https://us1.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${query}&format=json`
      );
      let suggestions = await response.json();
      
      // Filter out suggestions with incomplete data
      suggestions = suggestions.filter(item => 
        (item.address && (item.address.city || item.address.county || item.address.state))
      );
      
      // Limit to only 3 suggestions
      suggestions = suggestions.slice(0, 3);
      
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.warn('Location suggestions error:', error);
    }
  };

  const handleLocationChange = (text) => {
    setLocationQuery(text);
    fetchLocationSuggestions(text); // Fetch suggestions as user types
  };

  const handleLocationSelect = (suggestion) => {
    const area = suggestion.address.neighbourhood || suggestion.address.suburb || '';
    const city = suggestion.address.city || suggestion.address.county || suggestion.address.state || '';
    
    const displayLocation = [area, city].filter(Boolean).join(', ');
    setLocationQuery(displayLocation);
    
    setLocation({
      ...location,
      latitude: suggestion.lat || location.latitude,
      longitude: suggestion.lon || location.longitude,
      area: area,
      city: city,
    });
    setLocationSuggestions([]); // Clear suggestions after selection
    setIsEditable(false); // Exit edit mode
    Keyboard.dismiss();
  };

  const toggleEditLocation = () => {
    if (isEditable) {
      // When exiting edit mode
      if (locationSuggestions.length > 0) {
        // Auto-select first suggestion if available
        handleLocationSelect(locationSuggestions[0]);
        return;
      }
      setIsEditable(false);
      setLocationSuggestions([]);
    } else {
      // When entering edit mode
      setIsEditable(true);
      // Pre-fill the query with current location
      const currentLocation = `${location.area}${location.area && location.city ? ', ' : ''}${location.city}`;
      setLocationQuery(currentLocation);
      // Fetch suggestions for current location
      fetchLocationSuggestions(currentLocation);
    }
  };

  // Backend logic from web app
  const checkIfRoad = async () => {
    const formData = new FormData();
    formData.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    try {
      const res = await fetch('http://192.168.145.91:8000/check-road/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await res.json();
      console.log('Road probability:', data.road_probability);
      setLastRoadProbability(data.road_probability);

      if (data.road_probability > 0.7) return true;
      if (data.road_probability < 0.3) return false;
      return null;
    } catch (err) {
      Alert.alert('Error', 'Error checking road. Try again later.');
      return false;
    }
  };

  const submitReport = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    
    // Send area and city (not latitude and longitude)
    const address = `${location.area}${location.area && location.city ? ', ' : ''}${location.city}`;
    formData.append('address', address);
    formData.append('comments', comments);

    // Add email from AsyncStorage
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        formData.append('email', email);
      }
    } catch (error) {
      console.warn('Error getting email from AsyncStorage:', error);
    }

    // Add current submission date in ISO string format
    const submissionDate = new Date().toISOString();
    formData.append('submission_date', submissionDate);

    try {
      const res = await fetch('http://192.168.145.91:8000/report-damage/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await res.json();
      Alert.alert('Success', '✅ Damage reported successfully!');

      // Reset form
      setImage(null);
      setLocation({
        latitude: '',
        longitude: '',
        city: '',
        area: '',
      });
      setComments('');
    } catch (err) {
      console.error('Error submitting report:', err);
      Alert.alert('Error', '❌ Something went wrong. Try again later.');
    } finally {
      setLoading(false);
      setAwaitUserConfirmation(false);
      setLastRoadProbability(null);
    }
  };

  const handleSubmit = async () => {
    if (!image || !location.city || !location.area) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setLoading(true);

    const isRoad = await checkIfRoad();

    if (isRoad === false) {
      Alert.alert('Error', "❌ This image doesn't seem to show a road!");
      setLoading(false);
      return;
    } else if (isRoad === null) {
      setLoading(false);
      setAwaitUserConfirmation(true);
      return;
    }

    await submitReport();
  };

  const handleUserConfirmation = (confirmed) => {
    setAwaitUserConfirmation(false);
    if (confirmed) {
      submitReport();
    } else {
      Alert.alert('Info', 'Report cancelled due to user confirmation.');
    }
  };

  const isSubmitDisabled = !image || !location.city || !location.area;

  const renderSuggestion = (item, index) => {
    const area = item.address.neighbourhood || item.address.suburb || '';
    const city = item.address.city || item.address.county || item.address.state || '';
    
    if (!area && !city) return null;
    
    const displayText = [area, city].filter(Boolean).join(', ');
    
    return (
      <TouchableOpacity
        key={`suggestion-${index}-${item.place_id}`}
        className="bg-slate-700 p-3 rounded-lg mb-2"
        onPress={() => handleLocationSelect(item)}
      >
        <Text className="text-white">{displayText}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-slate-900"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: '#0f172a' }}
      >
        <View className="flex-1 p-4" style={{ backgroundColor: '#0f172a' }}>
          <Text className="text-xl font-bold mb-4 text-white text-center mt-12">Report Damage</Text>

          <View className="items-center mb-4">
            {image ? (
              <Image source={{ uri: image }} className="w-64 h-64 rounded-lg border-2 border-blue-400" />
            ) : (
              <View className="w-64 h-64 bg-slate-800 rounded-lg items-center justify-center border-2 border-dashed border-blue-400">
                <Feather name="camera" size={40} color="#60A5FA" />
                <Text className="text-blue-300 mt-2">No Image Selected</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-around mb-6">
            <TouchableOpacity
              className="px-6 py-2 bg-blue-700 rounded-lg flex-row items-center shadow-md"
              onPress={() => pickImage(true)}
            >
              <Feather name="camera" size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white font-medium ml-1">Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-6 py-2 bg-blue-600 rounded-lg flex-row items-center shadow-md"
              onPress={() => pickImage(false)}
            >
              <Feather name="image" size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white font-medium ml-1">Gallery</Text>
            </TouchableOpacity>
          </View>

          {loadingLocation && (
            <View className="mb-4 items-center">
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text className="text-sm text-blue-300 mt-1">Fetching location...</Text>
            </View>
          )}

          {image && !loadingLocation && (
            <View className="space-y-4 mb-4">
              {/* Location Display */}
              <View className="flex-row items-center justify-between bg-slate-800 p-3 rounded-lg mb-3">
                <View className="flex-row items-center space-x-2 gap-2">
                  <Feather name="map-pin" size={20} color="#60A5FA" />
                  <Text className="text-base text-blue-100">
                    {location.area || location.city 
                      ? `${location.area}${location.area && location.city ? ', ' : ''}${location.city}`
                      : 'No location selected'
                    }
                  </Text>
                </View>
                <TouchableOpacity onPress={toggleEditLocation}>
                  <Feather name={isEditable ? "check" : "edit-2"} size={18} color="#60A5FA" />
                </TouchableOpacity>
              </View>

              {/* Editable Inputs if toggled */}
              {isEditable && (
                <View className="space-y-2 mb-4">
                  <TextInput
                    className="bg-slate-800 border border-blue-500 rounded-lg p-3 text-white"
                    placeholder="Enter location (e.g., Andheri East, Mumbai)"
                    placeholderTextColor="#60A5FA"
                    value={locationQuery}
                    onChangeText={handleLocationChange}
                    autoFocus={true}
                  />
                  
                  {/* Suggestions - Not using FlatList to avoid nesting VirtualizedLists error */}
                  {locationSuggestions.length > 0 && (
                    <View className="bg-slate-800 rounded-lg border border-blue-500 p-1">
                      {locationSuggestions.map((item, index) => renderSuggestion(item, index))}
                    </View>
                  )}
                </View>
              )}

              {/* Comments Text Box */}
              <View>
                <Text className="text-lg mb-1 text-blue-100">Additional Comments</Text>
                <TextInput
                  className="bg-slate-800 border border-blue-500 rounded-lg p-3 h-20 text-white"
                  multiline
                  placeholder="Enter any additional details..."
                  placeholderTextColor="#60A5FA"
                  value={comments}
                  onChangeText={setComments}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            disabled={isSubmitDisabled || loading}
            className={`mt-4 p-4 rounded-lg items-center shadow-lg mb-6 ${isSubmitDisabled || loading ? 'bg-slate-600' : 'bg-blue-600'}`}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-medium">Submit Report</Text>
            )}
          </TouchableOpacity>
          
          {/* Extra padding at bottom to ensure content is visible above keyboard when editing location */}
          {isEditable && <View style={{ height: 150 }} />}
        </View>
      </ScrollView>

      {/* User confirmation modal */}
      {awaitUserConfirmation && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          zIndex: 50
        }}>
          <View className="bg-slate-800 p-6 rounded-xl shadow-lg max-w-md">
            <Text className="text-xl font-semibold mb-4 text-white text-center">
              The image confidence for being a road is uncertain ({(lastRoadProbability * 100).toFixed(1)}%).
            </Text>
            <Text className="mb-6 text-white text-center">Are you sure this image is a road?</Text>
            <View className="flex-row justify-around">
              <TouchableOpacity
                className="bg-green-600 px-4 py-2 rounded mr-2"
                onPress={() => handleUserConfirmation(true)}
              >
                <Text className="text-white">Yes, proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-600 px-4 py-2 rounded ml-2"
                onPress={() => handleUserConfirmation(false)}
              >
                <Text className="text-white">No, cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}