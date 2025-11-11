import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import * as React from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import authStyles from "../../constants/styles/auth.styles";
import colors from '../../constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isLoaded, signUp, setActive } = useSignUp();

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
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // submit sign up
  const onSignUpPress = async () => {
    if (!isLoaded || submitting) return;

    const f = firstName.trim();
    const l = lastName.trim();
    const em = emailAddress.trim();

    if (!f || !l) {
      setError("Please enter your first and last name.");
      return;
    }
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await signUp.create({
        emailAddress: em,
        password,
        firstName: f,          // <-- saved to Clerk user
        lastName: l,           // <-- saved to Clerk user
        // keep your username for later use
        unsafeMetadata: { username }, // you had this pattern already :contentReference[oaicite:0]{index=0}
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError("Could not create account. Please check your info and try again.");
    } finally {
      setSubmitting(false);
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

  // --- Verification screen ---
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
            autoCapitalize="none"
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

  // --- Sign Up screen ---
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
        {/* First name */}
        <TextInput
          style={[authStyles.input, { marginBottom: 20, marginTop: 10 }]}
          placeholder="First name"
          placeholderTextColor={colors.subtext}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />

        {/* Last name */}
        <TextInput
          style={[authStyles.input, { marginBottom: 20, marginTop: 10 }]}
          placeholder="Last name"
          placeholderTextColor={colors.subtext}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />

        {/* Username (optional) */}
        <TextInput
          style={[authStyles.input, { marginBottom: 20, marginTop: 10 }]}
          placeholder="Username"
          placeholderTextColor={colors.subtext}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        {/* Email */}
        <TextInput
          style={[authStyles.input, { marginBottom: 20, marginTop: 10 }]}
          placeholder="Email address"
          placeholderTextColor={colors.subtext}
          keyboardType="email-address"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />

        {/* Password */}

        <View style={{ position: "relative", marginTop: 10, marginBottom: 20 }}>
          <TextInput
            style={[authStyles.input, { paddingRight: 48 }]}
            placeholder="Password"
            placeholderTextColor={colors.subtext}
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => setShowPwd((s) => !s)}
            style={{ position: "absolute", right: 16, top: 18 }}
          >
            <Ionicons name={showPwd ? "eye-off" : "eye"} size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Confirm */}
        <TextInput
          style={[authStyles.input, { marginTop: 1, marginBottom: 26 }]}
          placeholder="Confirm password"
          placeholderTextColor={colors.subtext}
          secureTextEntry={!showPwd}
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="none"
        />

        {!!error && (
          <Text style={{ color: "#ffb4b4", marginBottom: 10, textAlign: "center" }}>{error}</Text>
        )}

        {/* Submit */}
        <TouchableOpacity style={authStyles.button} onPress={onSignUpPress} disabled={submitting}>
          <Text style={authStyles.buttonText}>{submitting ? "Creating..." : "Sign up"}</Text>
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
