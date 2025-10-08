import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View} from 'react-native'
import authStyles from '../../styles/auth.styles'
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
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Sign In</Text>
      <Text style={authStyles.subtitle}>Welcome back! Please sign in to continue.</Text>
      <TextInput
        style={authStyles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email address"
        placeholderTextColor="#888"
        keyboardType="email-address"
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={authStyles.input}
        value={password}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <Link href="/reset-password" style={authStyles.link}>
          <Text style={authStyles.linkText}>Forgot password?</Text>
      </Link>
      <TouchableOpacity style={authStyles.button} onPress={onSignInPress}>
        <Text style={authStyles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <View style={authStyles.footerRow}>
        <Text style={authStyles.footerText}>Don't have an account?</Text>
        <Link href="/sign-up" style={authStyles.link}>
          <Text style={authStyles.linkText}>Sign up</Text>
        </Link>
      </View>
    </View>
  )
}

