import { Tabs } from "expo-router";
import { FontAwesome5, Foundation, AntDesign } from '@expo/vector-icons';
import { View, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
const { width } = Dimensions.get('window');

function TabBar({ state, descriptors, navigation }) {
  // Calculate positions for proper spacing
  const tabWidth = width / 5; // Divide screen width by number of tabs
  const uploadIndex = state.routes.findIndex(route => route.name === 'upload');
  const centerX = width / 2;

  return (
    <View
      style={{
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: '#0f172a',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,  // Extra padding for iOS if needed
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        const baseSize = 22;
        const iconSize = isFocused ? baseSize + 4 : baseSize;
        const iconColor = isFocused ? '#fff' : '#6b7280';

        // Special handling for upload button
        if (route.name === 'upload') {
          return (
            <View
              key={route.key}
              style={{
                width: tabWidth,
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <TouchableOpacity
                onPress={onPress}
                style={{
                  width: 50,
                  height: 35,
                  borderRadius: 10,
                  backgroundColor: '#2563eb',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <FontAwesome5 name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }

        // Regular tab buttons
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              width: tabWidth,
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            {options.tabBarIcon({ color: iconColor, size: iconSize })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Foundation name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="bell" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="upload"
            options={{
              title: 'Upload',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="plus" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="history" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <AntDesign name="user" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
