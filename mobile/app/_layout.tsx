import 'react-native-reanimated';
//Importing ClerkProvider to wrap the app with Clerk authentication
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
  const iphoneTesting = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000`;

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/health`); 
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache}>
        <Slot/>
        <Toast />
        
        {/* Debug notification */}
        <View style={styles.debugContainer}>
          <View style={[
            styles.debugBadge,
            backendStatus === 'connected' && styles.connected,
            backendStatus === 'disconnected' && styles.disconnected,
          ]}>
            <Text style={styles.debugText}>
              {backendStatus === 'checking' ? '⏳ Checking...' : 
               backendStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
            </Text>
          </View>
        </View>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
  },
  debugBadge: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  connected: {
    backgroundColor: 'rgba(34, 197, 94, 0.7)',
  },
  disconnected: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
  },
  debugText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

/*
 * ***Notes*****
 * This code sets up the root layout for a React Native Expo application using Expo Router and Clerk for authentication.
 * The ClerkProvider component wraps the entire app to provide authentication context
 * while GestureHandlerRootView ensures proper handling of gestures throughout the app.
 * The Slot component is a placeholder for rendering child routes defined in the Expo Router configuration.
 */

// Previously edited file for reference:
// export default function RootLayout() {

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ClerkProvider tokenCache={tokenCache}>
//         <Slot/>
//         <Toast />
//       </ClerkProvider>
//     </GestureHandlerRootView>
//   );
// }