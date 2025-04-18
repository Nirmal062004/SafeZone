import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { StatusBar } from 'expo-status-bar';

// Import all screens
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import EmergencyContacts from './screens/EmergencyContacts';
import MapScreen from './screens/MapScreen';
import FakeCallScreen from './screens/FakeCallScreen';
import VoiceTriggerScreen from './screens/VoiceTriggerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });

    return () => unsubscribe(); // Clean up listener
  }, [initializing]);

  if (initializing) {
    // You could add a splash screen or loading indicator here
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#f4f9f8' },
        headerTintColor: '#000',
        headerShadowVisible: false,
        animation: 'slide_from_right'
      }}>
        {user ? (
          // User is signed in
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EmergencyContacts"
              component={EmergencyContacts}
              options={{ title: 'Emergency Contacts' }}
            />
            <Stack.Screen
              name="MapScreen"
              component={MapScreen}
              options={{ title: 'Safe Places' }}
            />
            <Stack.Screen
              name="FakeCall"
              component={FakeCallScreen}
              options={{ 
                headerShown: false,
                presentation: 'fullScreenModal'
              }}
            />
            <Stack.Screen
              name="VoiceTrigger"
              component={VoiceTriggerScreen}
              options={{ title: 'Voice Trigger' }}
            />
          </>
        ) : (
          // User is not signed in
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen} 
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}