
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
