import * as React from "react";
import { Text, TextInput, TouchableOpacity, View, Pressable } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import authStyles, { colors } from "../../styles/auth.styles";

export default function SignUpScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isLoaded, signUp, setActive } = useSignUp();

  // header matches sign-in
  React.useEffect(() => {
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

  // form state
  const [username, setUsername] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // submit sign up
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);

    try {
      await signUp.create({
        emailAddress,
        password,
        // optional: store username in public metadata or after verification
        // unsafeMetadata: { username },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError("Could not create account. Please check your info and try again.");
    }
  };

  // verify email code
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(attempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError("Invalid code. Please try again.");
    }
  };

  // --- Verification screen (same theme) ---
  if (pendingVerification) {
    return (
      <LinearGradient
        colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
        style={authStyles.container}
      >
        <View style={{ position: "absolute", top: 10, left: 50 }}>
          <Text style={[authStyles.title, { marginTop: 20, textAlign: "left", fontSize: 35 }]}>
            Verify your email
          </Text>
          <Text style={[authStyles.subtitle, { textAlign: "left", marginTop: 4, fontSize: 14 }]}>
            Enter the 6-digit code we sent to your email.
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 15,
            padding: 25,
            marginTop: 120,
          }}
        >
          <TextInput
            style={[authStyles.input, { marginBottom: 30, marginTop: 10 }]}
            value={code}
            placeholder="Verification code"
            placeholderTextColor={colors.subtext}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          {!!error && (
            <Text style={{ color: "#ffb4b4", marginBottom: 10, textAlign: "center" }}>{error}</Text>
          )}
          <TouchableOpacity style={authStyles.button} onPress={onVerifyPress}>
            <Text style={authStyles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // --- Sign Up screen (themed like sign-in) ---
  return (
    <LinearGradient
      colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
      style={authStyles.container}
    >
      {/* Title + subtitle aligned like sign-in */}
      <View style={{ position: "absolute", top: 10, left: 50 }}>
        <Text
          style={[
            authStyles.title,
            { marginTop: 20, textAlign: "left", alignSelf: "flex-start", fontSize: 35 },
          ]}
        >
          Sign Up
        </Text>
        <Text
          style={[
            authStyles.subtitle,
            { textAlign: "left", alignSelf: "flex-start", marginTop: 4, fontSize: 14 },
          ]}
        >
          Please login or sign up to continue using our app
        </Text>
      </View>

      {/* Card container */}
      <View
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: 15,
          padding: 25,
          marginTop: 120,
        }}
      >
        {/* Username */}
        <Text style={[authStyles.label]}>Username</Text>
        <TextInput
          style={[authStyles.input, { marginBottom: 20, marginTop: 10 }]}
          placeholder="HiveSpace"
          placeholderTextColor={colors.subtext}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        {/* Email */}
        <Text style={[authStyles.label]}>Email</Text>
        <TextInput
          style={[authStyles.input, { marginBottom: 20, marginTop: 10 }]}
          placeholder="Hivespace@example.com"
          placeholderTextColor={colors.subtext}
          keyboardType="email-address"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />

        {/* Password */}
        <Text style={[authStyles.label]}>Password</Text>
        <View style={{ position: "relative", marginTop: 10, marginBottom: 20 }}>
          <TextInput
            style={[authStyles.input, { paddingRight: 48 }]}
            placeholder="••••••••"
            placeholderTextColor={colors.subtext}
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            onPress={() => setShowPwd((s) => !s)}
            style={{ position: "absolute", right: 16, top: 18 }}
          >
            <Ionicons name={showPwd ? "eye-off" : "eye"} size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Confirm */}
        <Text style={[authStyles.label]}>Confirm Password</Text>
        <TextInput
          style={[authStyles.input, { marginTop: 10, marginBottom: 26 }]}
          placeholder="••••••••"
          placeholderTextColor={colors.subtext}
          secureTextEntry={!showPwd}
          value={confirm}
          onChangeText={setConfirm}
        />

        {!!error && (
          <Text style={{ color: "#ffb4b4", marginBottom: 10, textAlign: "center" }}>{error}</Text>
        )}

        {/* Submit */}
        <TouchableOpacity style={authStyles.button} onPress={onSignUpPress}>
          <Text style={authStyles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Footer link */}
      <Text style={authStyles.footerText}>
        You already have an account?{" "}
        <Link href="/sign-in" style={{ color: colors.link }}>
          Login
        </Link>
      </Text>
    </LinearGradient>
  );
}
