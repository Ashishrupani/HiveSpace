
import 'react-native-reanimated';
//Importing ClerkProvider to wrap the app with Clerk authentication
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { GestureHandlerRootView } from 'react-native-gesture-handler';





export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache}>
        <Slot/>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

/*
 * ***Notes*****
 * This code sets up the root layout for a React Native Expo application using Expo Router and Clerk for authentication.
 * The ClerkProvider component wraps the entire app to provide authentication context
 * while GestureHandlerRootView ensures proper handling of gestures throughout the app.
 * The Slot component is a placeholder for rendering child routes defined in the Expo Router configuration.
 */