// app/(menu)/(home)/profile/profile.tsx
import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Platform,
  StyleSheet,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";



export default function ProfileScreen() {
  
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0); // cache-buster for Clerk image

  const { isLoaded, user } = useUser();
  const { signOut } = useAuth(); 


  if (!isLoaded) {
    return (
      <ThemedView style={styles.loadingWrap}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  // ---- derived display fields ----
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "user@example.com";

  const name =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (email ? email.split("@")[0] : "") ||
    "User";

  const username =
    user?.username ??
    ((user?.unsafeMetadata as any)?.username as string | undefined) ??
    ((user?.publicMetadata as any)?.username as string | undefined) ??
    (email ? email.split("@")[0] : undefined) ??
    "username";

  // small helper for fallback avatar initials
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase())
      .join("") || "U";

  async function pickAndUploadImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo library access to change your photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setUploading(true);

      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      await user?.setProfileImage({ file: blob });

      // @ts-ignore (older SDKs)
      await user?.reload?.();
      setAvatarVersion(v => v + 1);
    } catch (e) {
      console.error(e);
      Alert.alert("Upload failed", "Please try a different image.");
    } finally {
      setUploading(false);
    }
  }

  // Use Clerk image if present, else render a fallback circle with initials
  const avatarEl = user?.imageUrl ? (
    <Image
      source={{ uri: `${user.imageUrl}?v=${avatarVersion}` }}
      style={styles.avatar}
      resizeMode="cover"
    />
  ) : (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <ThemedText style={styles.avatarInitials}>{initials}</ThemedText>
    </View>
  );
  const handleLogout = async () => {
    try {
      await signOut(); // logs out the Clerk session
      router.replace("/(auth)/sign-in"); // change this if your login screen is named differently
    } catch (error) {
      console.error(error);
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* --- ACCOUNT CARD --- */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.accountCard}
          onPress={() => router.push("/(menu)/(home)/profile/editProfile")}
        >
          {avatarEl}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText style={styles.accountName}>{name.toLowerCase()}</ThemedText>
            <ThemedText style={styles.accountEmail}>{email}</ThemedText>
            {!!username && <ThemedText style={styles.accountUsername}>@{username}</ThemedText>}
    <TouchableOpacity onPress={pickAndUploadImage} disabled={uploading}>
      {uploading ? (
        <ActivityIndicator style={{ marginTop: 6 }} />
      ) : null}
    </TouchableOpacity>
          </View>
          <IconSymbol name="chevron.right" size={18} color="#bcbcbc" />
        </TouchableOpacity>

        {/* --- PREFERENCES --- */}
        <SectionLabel text="Preferences" />
        <Card>
          <ListRow label="Language" value="English" />
          <Divider />
          <ListRow label="Location" value="—" />
          <Divider />
          <ListRow
            label="Email Notifications"
            right={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
              />
            }
          />
          <Divider />
          <ListRow
            label="Push Notifications"
            right={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
              />
            }
            isLast
          />
        </Card>

        {/* --- RESOURCES --- */}
        <SectionLabel text="Resources" />
        <Card>
          <ListRow label="Contact Us" chevron />
          <Divider />
          <ListRow label="Report Bug" chevron />
          <Divider />
          <ListRow label="Rate the App" chevron />
          <Divider />
          <ListRow label="Terms and Privacy" chevron isLast />
        </Card>

        {/* --- LOGOUT --- */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}
         onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.versionText}>App Version 1.0.0</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

/* ---------- Small UI helpers ---------- */
function SectionLabel({ text }: { text: string }) {
  return <ThemedText style={styles.sectionLabel}>{text.toUpperCase()}</ThemedText>;
}

function Card({ children }: React.PropsWithChildren) {
  return <ThemedView style={styles.card}>{children}</ThemedView>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function ListRow({
  label,
  value,
  chevron,
  right,
  isLast,
}: {
  label: string;
  value?: string;
  chevron?: boolean;
  right?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <View style={styles.rowRight}>
        {value ? <ThemedText style={styles.rowValue}>{value}</ThemedText> : null}
        {right}
        {chevron ? <IconSymbol name="chevron.right" size={16} color="#bcbcbc" /> : null}
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F7F9",
  },

  content: {
    padding: 16,
    gap: 16,
  },

  /* Account card */
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
      web: {
        // @ts-ignore
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      },
    }),
  },

  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E5E7EB" },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },

  accountName: { fontSize: 18, fontFamily: Fonts.rounded, color: "#111", textTransform: "none" },
  accountEmail: { marginTop: 2, fontSize: 14, color: "#6B7280" },
  accountUsername: { marginTop: 2, fontSize: 13, color: "#A3A3A3" },


  sectionLabel: {
    marginLeft: 4,
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: "600",
    color: "#B0A9A9",
  },

  card: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },

  row: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
  },
  rowLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginLeft: 16,
  },
  rowLabel: { fontSize: 16, color: "#111", fontFamily: Fonts.rounded },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowValue: { fontSize: 15, color: "#9CA3AF" },

  logoutBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  logoutText: { color: "#DC2626", fontWeight: "700", fontSize: 15 },

  versionText: { marginTop: 8, textAlign: "center", fontSize: 12, color: "#A6A6A6" },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
});
