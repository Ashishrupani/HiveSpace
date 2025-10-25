import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import authStyles from "../../constants/styles/auth.styles";
import colors from '../../constants/theme';

export default function Page() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerStyle: { backgroundColor: "#08082B" },
      headerTintColor: "#fff",
      headerTitleAlign: "center",
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable onPress={() => router.push("/")} style={{ marginLeft: 18 }}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </Pressable>
      ),
    });
  }, [navigation]);

  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // to handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in using email and password
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If not, check why. User might need to complete more steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
      style={authStyles.container}
    >
      {/* Title and subtitle - top left corner, closer to arrow */}
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 50,
        }}
      >
        <Text
          style={[
            authStyles.title,
            {
              marginTop: 20,
              textAlign: "left",
              alignSelf: "flex-start",
              fontSize: 35,
            },
          ]}
        >
          Login
        </Text>

        <Text
          style={[
            authStyles.subtitle,
            {
              textAlign: "left",
              alignSelf: "flex-start",
              marginTop: 4,
              fontSize: 14,
            },
          ]}
        >
          Please login or sign up to continue using our app
        </Text>
      </View>

      {/* Cute image placeholder */}
      <Text
        style={{
          color: colors.text,
          fontSize: 15,
          marginTop: 100,
          marginBottom: 70,
        }}
      >
        cute image
      </Text>

      {/* Input container (light background---shadow) */}
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
        {/* email address input with (with shadow) */}
        <TextInput
          style={[authStyles.input, { marginBottom: 35, marginTop: 10 }]}
          placeholder="Email address"
          placeholderTextColor={colors.subtext}
          keyboardType="email-address"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />

        {/* Password input (with shadow) */}
        <TextInput
          style={[authStyles.input, { marginBottom: 50 }]}
          placeholder="Password"
          placeholderTextColor={colors.subtext}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password link */}
        <Link
          href="/reset-password"
          style={{
            color: colors.subtext,
            alignSelf: "flex-end",
            marginBottom: 30,
            marginTop: -48,
          }}
        >
          Forgot Password?
        </Link>

        {/* Login button */}
        <TouchableOpacity style={authStyles.button} onPress={onSignInPress}>
          <Text style={authStyles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Sign up link */}
      <Text style={authStyles.footerText}>
        Don’t have an account?{" "}
        <Link href="/sign-up" style={{ color: colors.link }}>
          Sign up
        </Link>
      </Text>
    </LinearGradient>
  );
}
