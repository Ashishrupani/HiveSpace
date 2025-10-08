import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import authStyles from '../../styles/auth.styles'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    console.log(emailAddress, password)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <View style={authStyles.container}>
        <Text style={authStyles.title}>Verify your email</Text>
        <Text style={authStyles.subtitle}>Enter the verification code sent to your email.</Text>
        <TextInput
          style={authStyles.input}
          value={code}
          placeholder="Verification code"
          placeholderTextColor="#888"
          onChangeText={setCode}
        />
        <TouchableOpacity style={authStyles.button} onPress={onVerifyPress}>
          <Text style={authStyles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Sign Up</Text>
      <Text style={authStyles.subtitle}>Create your account to get started.</Text>
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
      <TouchableOpacity style={authStyles.button} onPress={onSignUpPress}>
        <Text style={authStyles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <View style={authStyles.footerRow}>
        <Text style={authStyles.footerText}>Already have an account?</Text>
        <Link href="/sign-in" style={authStyles.link}>
          <Text style={authStyles.linkText}>Sign in</Text>
        </Link>
      </View>
    </View>
  )
}

