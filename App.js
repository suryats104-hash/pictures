import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PatientProvider } from './src/context/PatientContext';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import PatientFormScreen from './src/screens/PatientFormScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import PatientDetailScreen from './src/screens/PatientDetailScreen';
import InstructionsScreen from './src/screens/InstructionsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PatientProvider>
          <StatusBar style="dark" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#FFFFFF' },
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Instructions" component={InstructionsScreen} />
              <Stack.Screen name="PatientForm" component={PatientFormScreen} />
              <Stack.Screen name="Camera" component={CameraScreen} />
              <Stack.Screen name="Preview" component={PreviewScreen} />
              <Stack.Screen name="Gallery" component={GalleryScreen} />
              <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PatientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
