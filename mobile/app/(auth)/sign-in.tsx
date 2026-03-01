import { useSignIn } from "@clerk/clerk-expo";
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

export default function Page() {
  const router = useRouter();
  const navigation = useNavigation();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  const onSignInPress = async () => {
    if (!isLoaded || isLoading) return;

    if (!emailAddress.trim() || !password.trim()) {
      showErrorToast("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        
        showErrorToast("Unable to complete sign in. Please try again.");
      }
    } catch (err: any) {

      if (err.errors) {
        const errorMessage =
          err.errors[0]?.longMessage ||
          err.errors[0]?.message ||
          "Invalid email or password";
        showErrorToast(errorMessage);
      } else {
        showErrorToast("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <View style={{ marginBottom: 40 }}>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                Welcome Back
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.subtext,
                  lineHeight: 24,
                }}
              >
                Sign in to continue your journey
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
              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
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

              {/* Password Input */}
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
                    placeholder="Enter your password"
                    placeholderTextColor={colors.subtext}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
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

              {/* Forgot Password */}
              <Link
                href="/reset-password"
                style={{
                  color: colors.link,
                  fontSize: 14,
                  fontWeight: "600",
                  alignSelf: "flex-end",
                  marginBottom: 24,
                }}
              >
                Forgot Password?
              </Link>

              {/* Login Button */}
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
                onPress={onSignInPress}
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
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Spacer to push footer to bottom */}
            <View style={{ flex: 1, minHeight: 40 }} />

            {/* Sign up link */}
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
                Don't have an account?{" "}
              </Text>
              <Link
                href="/sign-up"
                style={{
                  color: colors.link,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                Sign Up
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
