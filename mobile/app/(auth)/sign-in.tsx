import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Platform } from 'react-native'
import React from 'react'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Welcome back! Please sign in to continue.</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email address"
        placeholderTextColor="#888"
        keyboardType="email-address"
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/sign-up" style={styles.link}>
          <Text style={styles.linkText}>Sign up</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f8fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 350,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    width: '100%',
    maxWidth: 350,
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  footerText: {
    color: '#444',
    fontSize: 15,
  },
  link: {
    marginLeft: 6,
  },
  linkText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
})