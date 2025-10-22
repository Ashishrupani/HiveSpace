
import { View, TextInput, TouchableOpacity, Text, Image } from "react-native";
import authStyles, { colors } from "../../styles/auth.styles";
import React from "react";
import { Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import logo from '../../assets/images/logo_.png'

export default function PwReset() {
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [successfulCreation, setSuccessfulCreation] = React.useState(false);
  const { signIn, setActive } = useSignIn();

  // Request a password reset code by email
  const onRequestReset = async () => {
    try {
      await signIn!.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  // Reset the password with the code and the new password
  const onReset = async () => {
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      alert("Password reset successfully");
      await setActive!({ session: result.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
      style={authStyles.container}
    >
      {/* Add pointerEvents="none" so this overlay doesn't capture touches */}
      <View style={authStyles.noiseOverlay} pointerEvents="none" />

      <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />

      {!successfulCreation && (
        <>
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 15,
            padding: 25,
            marginTop: 20,
            marginBottom: 10,
          }}
        > 
          <Text style={authStyles.title}>Reset Password</Text>
          <Text style={authStyles.subtitle}>
              Enter your email to receive a reset code.
          </Text>
          <TextInput
              style={authStyles.input}
              autoCapitalize="none"
              placeholder="Email address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholderTextColor="#888"
              keyboardType="email-address"
            />
          <TouchableOpacity style={authStyles.button} onPress={onRequestReset}>
            <Text style={authStyles.buttonText}>Send Reset Email</Text>
          </TouchableOpacity>
        </View>
        </>

      )}

      {successfulCreation && (
        <>
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 15,
            padding: 25,
            marginTop: 20,
            marginBottom: 10,
          }}
        > 
          <Text style={authStyles.title}>Enter Reset Code</Text>
          <Text style={authStyles.subtitle}>
            Check your email for the code and set a new password.
          </Text>
          <TextInput
            style={authStyles.input}
            value={code}
            placeholder="Code"
            onChangeText={setCode}
            placeholderTextColor="#888"
          />
          <TextInput
            style={authStyles.input}
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={authStyles.button} onPress={onReset}>
            <Text style={authStyles.buttonText}>Set New Password</Text>
          </TouchableOpacity>
        </View>
        </>
      )}
    </LinearGradient>
  );
}
