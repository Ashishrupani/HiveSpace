import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
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

export default function PwReset() {
  const router = useRouter();
  const navigation = useNavigation();
  const { signIn, setActive } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const onRequestReset = async () => {
    if (isLoading) return;

    if (!emailAddress.trim()) {
      showErrorToast("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      await signIn!.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      console.error("Reset request error:", err);
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Could not send reset email. Please try again.";
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = async () => {
    if (isLoading) return;

    if (!code.trim()) {
      showErrorToast("Please enter the verification code");
      return;
    }
    if (!password.trim() || password.length < 8) {
      showErrorToast("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      await setActive!({ session: result.createdSessionId });
      showErrorToast("Password reset successfully!");
      router.replace("/");
    } catch (err: any) {
      console.error("Reset error:", err);
      const errorMessage =
        err.errors?.[0]?.message || "Invalid code or password. Please try again.";
      showErrorToast(errorMessage);
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
            onPress={() =>
              successfulCreation
                ? setSuccessfulCreation(false)
                : router.push("/sign-in")
            }
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
            {!successfulCreation ? (
              <>
                {/* Request Reset Screen */}
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
                    <Ionicons
                      name="lock-closed-outline"
                      size={40}
                      color={colors.link}
                    />
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
                    Reset Password
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.subtext,
                      textAlign: "center",
                      lineHeight: 24,
                    }}
                  >
                    Enter your email address and we'll send you a code to reset
                    your password
                  </Text>
                </View>

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

                  {/* Send Button */}
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
                    onPress={onRequestReset}
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
                        Send Reset Code
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Enter Code and New Password Screen */}
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
                    <Ionicons
                      name="key-outline"
                      size={40}
                      color={colors.link}
                    />
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
                    Enter Reset Code
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.subtext,
                      textAlign: "center",
                      lineHeight: 24,
                    }}
                  >
                    We sent a code to{" "}
                    <Text style={{ fontWeight: "600", color: colors.text }}>
                      {emailAddress}
                    </Text>
                    {"\n"}Enter it below with your new password
                  </Text>
                </View>

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
                  {/* Code Input */}
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
                          letterSpacing: 4,
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

                  {/* New Password Input */}
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
                      New Password
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
                        placeholder="Enter new password"
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
                          name={
                            showPassword ? "eye-outline" : "eye-off-outline"
                          }
                          size={20}
                          color={colors.subtext}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Reset Button */}
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
                    onPress={onReset}
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
                        Reset Password
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
