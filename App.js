import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, Text } from 'react-native';
import MapScreen from './screens/MapScreen'; // Importing MapScreen

const Stack = createNativeStackNavigator();

// Home Screen where user can navigate to MapScreen
const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to SafeZone</Text>
      <Button title="Open Map" onPress={() => navigation.navigate('Map')} />
    </View>
  );
};

// Main App Component with navigation setup
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
