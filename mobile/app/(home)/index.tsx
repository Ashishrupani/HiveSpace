import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import { SignOutButton } from '@/components/SignOutButton'
import { testApi } from '../../api/test.api.js'


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f8fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  button: {
    width: 180,
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})

export default function Page() {
  const { user } = useUser()

  const handleTestApi = async () => {
    await testApi();
  }

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.title}>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />

         <TouchableOpacity style={styles.button}>
            <Text onPress={handleTestApi} style={styles.buttonText}>Test API</Text>
          </TouchableOpacity>
        
      </SignedIn>
      <SignedOut>
        <Text style={styles.title}>Welcome to HiveSpace!</Text>
        <Text style={{ color: '#666', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
          Connect, explore, and share. Please sign in or create an account to get started.
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </SignedOut>
    </View>
  )
}