// app/(menu)/(home)/editProfile.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

const DefaultAvatar: any = require("../../../../assets/images/default-avatar.png");

// helpers
const range = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const years = range(new Date().getFullYear() - 100, new Date().getFullYear()).reverse();
const daysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();

// iOS picker & text colors
const IOS_PICKER_HEIGHT = 104;
const PICKER_TEXT_COLOR = "#111111";

export default function EditProfileScreen() {
  const router = useRouter();
  const { isLoaded, user } = useUser();

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");     // stored in unsafeMetadata only
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("user@example.com"); // display-only

  // birthday pickers (MM/DD/YYYY)
  const [bMonth, setBMonth] = useState("01");
  const [bDay, setBDay] = useState("01");
  const [bYear, setBYear] = useState(String(new Date().getFullYear() - 21));

  const [gender, setGender] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setEmail(
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      "user@example.com"
    );

    const um = (user.unsafeMetadata || {}) as any;
    setUsername(typeof um.username === "string" ? um.username : "");
    setPhone(um.phone ?? "");

    const birth = typeof um.birth === "string" ? um.birth : "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(birth)) {
      const [mm, dd, yyyy] = birth.split("/");
      setBMonth(mm); setBDay(dd); setBYear(yyyy);
    }
    setGender(um.gender ?? "");
  }, [isLoaded, user]);

  useEffect(() => {
    const max = daysInMonth(Number(bMonth), Number(bYear));
    if (Number(bDay) > max) setBDay(String(max).padStart(2, "0"));
  }, [bMonth, bYear]);

  const dayOptions = useMemo(() => {
    const max = daysInMonth(Number(bMonth), Number(bYear));
    return range(1, max).map(d => String(d).padStart(2, "0"));
  }, [bMonth, bYear]);

  const birthString = `${bMonth}/${bDay}/${bYear}`;

  const avatarSource = user?.imageUrl
    ? { uri: `${user.imageUrl}?v=${avatarVersion}` }
    : DefaultAvatar;

  async function changePhoto() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (res.canceled) return;

      const asset = res.assets[0];
      setUploading(true);
      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      await user?.setProfileImage({ file: blob });
      // @ts-ignore
      await user?.reload?.();
      setAvatarVersion(v => v + 1);
    } catch (e) {
      console.error(e);
      Alert.alert("Upload failed", "Please try a different image.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const currentUnsafe = (user.unsafeMetadata || {}) as any;

      // usernames are disabled in your Clerk project → do NOT send `username` in update payload
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        unsafeMetadata: {
          ...currentUnsafe,
          username: username.trim(),  // app-only display username
          phone: phone.trim(),
          birth: birthString,         // "MM/DD/YYYY"
          gender: gender.trim(),
        },
      });

      // @ts-ignore
      await user?.reload?.();
      Alert.alert("Saved", "Your profile has been updated.");
      // Go back to the Profile tab explicitly
      router.replace("/(menu)/(home)/profile/profilePage");
    } catch (e: any) {
      console.error(e);
      if (typeof e?.errors?.[0]?.message === "string" && e.errors[0].message.toLowerCase().includes("username")) {
        Alert.alert("Heads up", "Usernames are disabled in this Clerk project. We saved the display name in your profile metadata only.");
      } else {
        Alert.alert("Save failed", "Please check your inputs and try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <ThemedView style={styles.loadingWrap}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      {/* Minimal header (no big banner). Back takes you to Profile tab. */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.replace("/(menu)/(home)/profile/profilePage")}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <IconSymbol name="chevron.left" size={20} color="#111" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
        <View style={{ width: 20 }} />
      </View>

      {/* Scrollable content with tighter spacing */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar row: bigger avatar, pencil-only button */}
        <View style={styles.avatarRow}>
          <Image source={avatarSource} style={styles.avatar} />
          <TouchableOpacity
            onPress={changePhoto}
            style={styles.editChip}     // <-- use editChip here
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading ? (
              <ActivityIndicator />
            ) : (
              <>
                <IconSymbol name="pencil" size={16} color="#3B82F6" />
                <ThemedText style={styles.editChipText}>Change</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>

        

        {/* Editable fields */}
        <Field label="First Name">
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholder="First name"
            autoCapitalize="words"
          />
        </Field>

        <Field label="Last Name">
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            placeholder="Last name"
            autoCapitalize="words"
          />
        </Field>

        <Field label="Username">
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="@username"
            autoCapitalize="none"
          />
        </Field>

        {/* Email (locked) */}
        <Field label="Email Address">
          <View style={styles.lockedWrap}>
            <TextInput
              value={email}
              editable={false}
              selectTextOnFocus={false}
              style={[styles.input, styles.inputDisabled]}
            />
            <IconSymbol name="lock.fill" size={14} color="#9CA3AF" />
          </View>
        </Field>

        <Field label="Phone Number">
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="+1 555 555 5555"
            keyboardType="phone-pad"
          />
        </Field>

        {/* Birthday pickers */}
        
        <Field label="Birth (MM / DD / YYYY)">
          <View style={styles.pickerRow}>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={bMonth}
                onValueChange={setBMonth}
                mode={Platform.OS === "android" ? "dropdown" : undefined}
                style={styles.picker}
                itemStyle={Platform.OS === "ios" ? styles.pickerItemIOS : undefined}
                dropdownIconColor="#6B7280"
              >
                {months.map(m => (
                  <Picker.Item key={m} label={m} value={m} color={PICKER_TEXT_COLOR} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={bDay}
                onValueChange={setBDay}
                mode={Platform.OS === "android" ? "dropdown" : undefined}
                style={styles.picker}
                itemStyle={Platform.OS === "ios" ? styles.pickerItemIOS : undefined}
                dropdownIconColor="#6B7280"
              >
                {dayOptions.map(d => (
                  <Picker.Item key={d} label={d} value={d} color={PICKER_TEXT_COLOR} />
                ))}
              </Picker>
            </View>
            <View style={[styles.pickerBox, { flex: 1.25 }]}>
              <Picker
                selectedValue={bYear}
                onValueChange={setBYear}
                mode={Platform.OS === "android" ? "dropdown" : undefined}
                style={styles.picker}
                itemStyle={Platform.OS === "ios" ? styles.pickerItemIOS : undefined}
                dropdownIconColor="#6B7280"
              >
                {years.map(y => (
                  <Picker.Item key={y} label={String(y)} value={String(y)} color={PICKER_TEXT_COLOR} />
                ))}
              </Picker>
            </View>
          </View>
        </Field>

        {/* Gender picker */}
        <Field label="Gender">
          <View style={styles.pickerBoxWide}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              mode={Platform.OS === "android" ? "dropdown" : undefined}
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItemIOS : undefined}
              dropdownIconColor="#6B7280"
            >
              <Picker.Item label="Select" value="" color={PICKER_TEXT_COLOR} />
              <Picker.Item label="Male" value="male" color={PICKER_TEXT_COLOR} />
              <Picker.Item label="Female" value="female" color={PICKER_TEXT_COLOR} />
              <Picker.Item label="Other" value="other" color={PICKER_TEXT_COLOR} />
              <Picker.Item label="Prefer not to say" value="prefer_not" color={PICKER_TEXT_COLOR} />
            </Picker>
          </View>
        </Field>

        <TouchableOpacity
          style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
          onPress={saveProfile}
          disabled={saving}
          activeOpacity={0.9}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.primaryBtnText}>Save</ThemedText>}
        </TouchableOpacity>

        <View style={{ height: 14 }} />
      </ScrollView>
    </ThemedView>
  );
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <View style={{ marginBottom: 10 }}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

/* ------------ styles ------------ */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F7F9" },

  headerBar: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: "#FFF",
  },
  headerTitle: { fontSize: 16.5, fontWeight: "600", color: "#111" },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF" },

  // scrollable content with tighter spacing
  scrollContent: {
    padding: 14,
    gap: 6,
    paddingBottom: 28,
  },

  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#E5E7EB" },

  // round icon-only pencil button
  editChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "#FFF",
  },
  editChipText: { color: "#3B82F6", fontWeight: "700", fontSize: 13 },


  // locked input row with icon at end
  lockedWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
    paddingRight: 10,
  },

  label: { marginBottom: 4, fontSize: 12.5, fontWeight: "600", color: "#6B7280", letterSpacing: 0.2 },

  input: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
    fontSize: 15,
    color: "#111",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "rgba(0,0,0,0.08)",
    color: "#6B7280",
  },

  pickerRow: { flexDirection: "row", gap: 8 },

  pickerBox: {
    flex: 1,
    height: Platform.OS === "ios" ? IOS_PICKER_HEIGHT : 46,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    
  },
  pickerBoxWide: {
    height: Platform.OS === "ios" ? IOS_PICKER_HEIGHT : 46,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: Platform.OS === "ios" ? IOS_PICKER_HEIGHT : 46,
  },
  pickerItemIOS: {
    fontSize: 16,
    height: IOS_PICKER_HEIGHT,
  },

  primaryBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1F4BFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
