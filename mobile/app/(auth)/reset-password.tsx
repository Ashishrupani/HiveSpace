import { useSignIn } from "@clerk/expo";
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
import colors from "../../constants/theme";
import showErrorToast from "../../components/ui/toast/ErrorToast";
 
// Core 3 password reset flow has THREE steps:
// 1. Send code  → signIn.create({ identifier }) + signIn.resetPasswordEmailCode.sendCode()
// 2. Verify code → signIn.resetPasswordEmailCode.verifyCode({ code })
//    → signIn.status becomes 'needs_new_password'
// 3. Submit new password → signIn.resetPasswordEmailCode.submitPassword({ password })
//    → signIn.status becomes 'complete' → signIn.finalize()
 
export default function PwReset() {
  const router = useRouter();
  const navigation = useNavigation();
  const { signIn, errors, fetchStatus } = useSignIn();
 
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
 
  const isLoading = fetchStatus === "fetching";
 
  const fadeAnim = useState(new Animated.Value(0))[0];
 
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [navigation]);
 
  // ── Step 1: Send reset code ──────────────────────────────────────────────
  const onSendCode = async () => {
    if (isLoading) return;
    if (!emailAddress.trim()) {
      showErrorToast("Please enter your email address");
      return;
    }
 
    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) {
      const msg =
        createError.longMessage ||
        createError.message ||
        "Could not initiate reset. Please try again.";
      showErrorToast(msg);
      return;
    }
 
    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeError) {
      const msg =
        sendCodeError.longMessage ||
        sendCodeError.message ||
        "Could not send reset email. Please try again.";
      showErrorToast(msg);
      return;
    }
 
    setCodeSent(true);
  };
 
  // ── Step 2: Verify the code ──────────────────────────────────────────────
  const onVerifyCode = async () => {
    if (isLoading) return;
    if (!code.trim()) {
      showErrorToast("Please enter the verification code");
      return;
    }
 
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      const msg = error.message || "Invalid code. Please try again.";
      showErrorToast(msg);
    }
    // On success signIn.status automatically becomes 'needs_new_password'
    // which triggers the new password screen below — no manual state needed
  };
 
  // ── Step 3: Submit the new password ─────────────────────────────────────
  const onSubmitPassword = async () => {
    if (isLoading) return;
    if (!password.trim() || password.length < 8) {
      showErrorToast("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      showErrorToast("Passwords do not match");
      return;
    }
 
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (error) {
      const msg = error.message || "Could not reset password. Please try again.";
      showErrorToast(msg);
      return;
    }
 
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => router.replace("/"),
      });
    }
  };
 
  // ── Shared layout wrapper ────────────────────────────────────────────────
  const Screen = ({
    onBack,
    children,
  }: {
    onBack: () => void;
    children: React.ReactNode;
  }) => (
    <LinearGradient
      colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Pressable
            onPress={onBack}
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
          <Animated.View style={{ opacity: fadeAnim }}>{children}</Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
 
  const Card = ({ children }: { children: React.ReactNode }) => (
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
      {children}
    </View>
  );
 
  const SubmitButton = ({
    label,
    onPress,
  }: {
    label: string;
    onPress: () => void;
  }) => (
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
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 0.5 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
 
  const InputField = ({
    id,
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    secureTextEntry,
    maxLength,
    autoCapitalize,
    rightElement,
    letterSpacing,
  }: {
    id: string;
    label: string;
    icon: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    keyboardType?: any;
    secureTextEntry?: boolean;
    maxLength?: number;
    autoCapitalize?: any;
    rightElement?: React.ReactNode;
    letterSpacing?: number;
  }) => (
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
        {label}
      </Text>
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: focusedInput === id ? colors.link : "rgba(255,255,255,0.1)",
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
          name={icon as any}
          size={20}
          color={colors.subtext}
          style={{ marginRight: 12 }}
        />
        <TextInput
          style={{ flex: 1, fontSize: 16, color: "#fff", letterSpacing }}
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? "none"}
          onFocus={() => setFocusedInput(id)}
          onBlur={() => setFocusedInput(null)}
          editable={!isLoading}
        />
        {rightElement}
      </View>
    </View>
  );
 
  // ── Step 3 screen: needs_new_password ────────────────────────────────────
  if (signIn.status === "needs_new_password") {
    return (
      <Screen onBack={() => router.push("/sign-in")}>
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
            <Ionicons name="shield-checkmark-outline" size={40} color={colors.link} />
          </View>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.text, marginBottom: 8, textAlign: "center" }}>
            Set New Password
          </Text>
          <Text style={{ fontSize: 16, color: colors.subtext, textAlign: "center", lineHeight: 24 }}>
            Choose a strong password for your account
          </Text>
        </View>
        <Card>
          <InputField
            id="password"
            label="New Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.subtext}
                />
              </TouchableOpacity>
            }
          />
          {errors.fields.password && (
            <Text style={{ color: "#f87171", fontSize: 12, marginTop: -8, marginBottom: 12 }}>
              {errors.fields.password.message}
            </Text>
          )}
          <InputField
            id="confirm"
            label="Confirm Password"
            icon="lock-closed-outline"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm new password"
            secureTextEntry={!showPassword}
          />
          <View style={{ marginTop: 8 }}>
            <SubmitButton label="Reset Password" onPress={onSubmitPassword} />
          </View>
        </Card>
      </Screen>
    );
  }
 
  // ── Step 2 screen: verify code ───────────────────────────────────────────
  if (codeSent) {
    return (
      <Screen onBack={() => setCodeSent(false)}>
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
            <Ionicons name="key-outline" size={40} color={colors.link} />
          </View>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.text, marginBottom: 8, textAlign: "center" }}>
            Enter Reset Code
          </Text>
          <Text style={{ fontSize: 16, color: colors.subtext, textAlign: "center", lineHeight: 24 }}>
            We sent a code to{" "}
            <Text style={{ fontWeight: "600", color: colors.text }}>{emailAddress}</Text>
          </Text>
        </View>
        <Card>
          <InputField
            id="code"
            label="Verification Code"
            icon="keypad-outline"
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            letterSpacing={4}
          />
          {errors.fields.code && (
            <Text style={{ color: "#f87171", fontSize: 12, marginTop: -8, marginBottom: 12 }}>
              {errors.fields.code.message}
            </Text>
          )}
          <View style={{ marginTop: 8 }}>
            <SubmitButton label="Verify Code" onPress={onVerifyCode} />
          </View>
        </Card>
      </Screen>
    );
  }
 
  // ── Step 1 screen: enter email ───────────────────────────────────────────
  return (
    <Screen onBack={() => router.push("/sign-in")}>
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
          <Ionicons name="lock-closed-outline" size={40} color={colors.link} />
        </View>
        <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.text, marginBottom: 8, textAlign: "center" }}>
          Reset Password
        </Text>
        <Text style={{ fontSize: 16, color: colors.subtext, textAlign: "center", lineHeight: 24 }}>
          Enter your email address and we'll send you a code to reset your password
        </Text>
      </View>
      <Card>
        <InputField
          id="email"
          label="Email Address"
          icon="mail-outline"
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="Enter your email"
          keyboardType="email-address"
        />
        {errors.fields.identifier && (
          <Text style={{ color: "#f87171", fontSize: 12, marginTop: -8, marginBottom: 12 }}>
            {errors.fields.identifier.message}
          </Text>
        )}
        <View style={{ marginTop: 8 }}>
          <SubmitButton label="Send Reset Code" onPress={onSendCode} />
        </View>
      </Card>
    </Screen>
  );
}