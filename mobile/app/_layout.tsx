
import 'react-native-reanimated';
//Importing ClerkProvider to wrap the app with Clerk authentication
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '@clerk/clerk-expo/token-cache'





export default function RootLayout() {

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  );
}
