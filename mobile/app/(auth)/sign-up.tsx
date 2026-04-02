import { useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import authStyles from "../../constants/styles/auth.styles";
import colors from "../../constants/theme";
import showErrorToast from "../../components/ui/toast/ErrorToast";
 
export default function SignUpScreen() {
  const router = useRouter();
  const navigation = useNavigation();
 
  // Core 3: useSignUp returns { signUp, errors, fetchStatus }
  // setActive and isLoaded no longer exist on this hook
  const { signUp, errors, fetchStatus } = useSignUp();
 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
 
  // Core 3: derive loading state from fetchStatus instead of manual useState
  const isLoading = fetchStatus === "fetching";
 
  const fadeAnim = useState(new Animated.Value(0))[0];
 
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
 
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [navigation]);
 
  const onSignUpPress = async () => {
    if (isLoading) return;
 
    const f = firstName.trim();
    const l = lastName.trim();
    const em = emailAddress.trim();
 
    if (!f || !l) {
      showErrorToast("Please enter your first and last name");
      return;
    }
    if (!em) {
      showErrorToast("Please enter your email address");
      return;
    }
    if (password.trim().length < 8) {
      showErrorToast("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      showErrorToast("Passwords do not match");
      return;
    }
 
    // Core 3: signUp.password() replaces signUp.create({ emailAddress, password, ... })
    // Pass all user fields directly to signUp.password()
    const { error } = await signUp.password({
      emailAddress: em,
      password,
      firstName: f,
      lastName: l,
      unsafeMetadata: { username },
    });
 
    if (error) {
      // Core 3: ClerkError is flat — use error.message directly, not error.errors[0]
      showErrorToast(error.message || "Could not create account. Please try again.");
      return;
    }
 
    // Core 3: signUp.verifications.sendEmailCode() replaces
    // signUp.prepareEmailAddressVerification({ strategy: "email_code" })
    await signUp.verifications.sendEmailCode();
    setPendingVerification(true);
  };
 
  const onVerifyPress = async () => {
    if (isLoading) return;
 
    if (!code.trim()) {
      showErrorToast("Please enter the verification code");
      return;
    }
 
    // Core 3: signUp.verifications.verifyEmailCode({ code }) replaces
    // signUp.attemptEmailAddressVerification({ code })
    await signUp.verifications.verifyEmailCode({ code });
 
    if (signUp.status === "complete") {
      // Core 3: signUp.finalize() replaces setActive({ session: attempt.createdSessionId })
      await signUp.finalize({
        navigate: () => {
          router.replace("/");
        },
      });
    } else {
      showErrorToast("Verification incomplete. Please try again.");
    }
  };
 
  // --- Verification Screen ---
  if (pendingVerification) {
    return (
      <LinearGradient
        colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header with back button */}
          <View
            style={{
              paddingTop: Platform.OS === "ios" ? 60 : 40,
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}
          >
            <Pressable
              onPress={() => setPendingVerification(false)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.1)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          </View>
 
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingBottom: 40,
              justifyContent: "center",
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Title Section */}
              <View style={{ marginBottom: 40, alignItems: "center" }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Ionicons name="mail-outline" size={40} color={colors.link} />
                </View>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: colors.text,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Check Your Email
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.subtext,
                    textAlign: "center",
                    lineHeight: 24,
                  }}
                >
                  We sent a 6-digit verification code to{"\n"}
                  <Text style={{ fontWeight: "600", color: colors.text }}>
                    {emailAddress}
                  </Text>
                </Text>
              </View>
 
              {/* Verification Form */}
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.subtext,
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Verification Code
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        focusedInput === "code"
                          ? colors.link
                          : "rgba(255,255,255,0.1)",
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      height: 56,
                      shadowColor: colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Ionicons
                      name="keypad-outline"
                      size={20}
                      color={colors.subtext}
                      style={{ marginRight: 12 }}
                    />
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: 16,
                        color: "#fff",
                        letterSpacing: 8,
                      }}
                      placeholder="000000"
                      placeholderTextColor={colors.subtext}
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      onFocus={() => setFocusedInput("code")}
                      onBlur={() => setFocusedInput(null)}
                      editable={!isLoading}
                    />
                  </View>
                </View>
 
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.link,
                    borderRadius: 12,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: colors.link,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                    opacity: isLoading ? 0.7 : 1,
                  }}
                  onPress={onVerifyPress}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      Verify Email
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
 
  // --- Sign Up Screen ---
  return (
    <LinearGradient
      colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header with back button */}
        <View
          style={{
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Pressable
            onPress={() => router.push("/")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        </View>
 
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {/* Title Section */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                Create Account
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.subtext,
                  lineHeight: 24,
                }}
              >
                Sign up to get started with your journey
              </Text>
            </View>
 
            {/* Form Container */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {/* First Name */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  First Name
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      focusedInput === "firstName"
                        ? colors.link
                        : "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 56,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.subtext}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#fff",
                      letterSpacing: 0.5,
                    }}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.subtext}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    onFocus={() => setFocusedInput("firstName")}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>
 
              {/* Last Name */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  Last Name
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      focusedInput === "lastName"
                        ? colors.link
                        : "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 56,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.subtext}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#fff",
                    }}
                    placeholder="Enter your last name"
                    placeholderTextColor={colors.subtext}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    onFocus={() => setFocusedInput("lastName")}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>
 
              {/* Username */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  Username{" "}
                  <Text style={{ color: colors.subtext, fontWeight: "400" }}>
                    (Optional)
                  </Text>
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      focusedInput === "username"
                        ? colors.link
                        : "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 56,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name="at-outline"
                    size={20}
                    color={colors.subtext}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#fff",
                    }}
                    placeholder="Choose a username"
                    placeholderTextColor={colors.subtext}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput("username")}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>
 
              {/* Email */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  Email Address
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      focusedInput === "email"
                        ? colors.link
                        : "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 56,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.subtext}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#fff",
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.subtext}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>
 
              {/* Password */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      focusedInput === "password"
                        ? colors.link
                        : "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 56,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.subtext}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#fff",
                    }}
                    placeholder="Create a password"
                    placeholderTextColor={colors.subtext}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={colors.subtext}
                    />
                  </TouchableOpacity>
                </View>
              </View>
 
              {/* Confirm Password */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  Confirm Password
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      focusedInput === "confirm"
                        ? colors.link
                        : "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 56,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.subtext}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#fff",
                    }}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.subtext}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={confirm}
                    onChangeText={setConfirm}
                    onFocus={() => setFocusedInput("confirm")}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>
 
              {/* Sign Up Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.link,
                  borderRadius: 12,
                  height: 56,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: colors.link,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: isLoading ? 0.7 : 1,
                }}
                onPress={onSignUpPress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                    }}
                  >
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
 
            {/* Spacer to push footer to bottom */}
            <View style={{ flex: 1, minHeight: 24 }} />
 
            {/* Sign in link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 20,
              }}
            >
              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 15,
                }}
              >
                Already have an account?{" "}
              </Text>
              <Link
                href="/sign-in"
                style={{
                  color: colors.link,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                Sign In
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
