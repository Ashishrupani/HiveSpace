import React, { useEffect, useState } from "react";
import {View,Text,ScrollView,TouchableOpacity,TextInput,ActivityIndicator,Alert,} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "../../../constants/theme";
import cardStyles from "../../../constants/styles/card-styles";
import { Clock, Save } from "lucide-react-native";
import { getNoteById, updateNote, UINote } from "../../../lib/notes-repo";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function NoteView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<UINote | null>(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

 
async function openAttachment() {
  const current = note;
  if (!current || !current.fileUri) return;

  console.log("Opening attachment URI (share):", current.fileUri);

  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert(
        "Not supported",
        "Sharing is not available on this device."
      );
      return;
    }

    // This will open the system share sheet where the user can pick
    // Google Drive, Adobe, etc. to open the PDF.
    await Sharing.shareAsync(current.fileUri)
  } catch (err) {
    console.error("Failed to share/open attachment:", err);
    Alert.alert(
      "Error",
      "Could not open attachment. Please try again or re-upload the file."
    );
  }
}


  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const loaded = await getNoteById(Number(id));
        if (loaded) {
          setNote(loaded);
          setBody(loaded.description || "");
        }
      } catch (err) {
        console.error("Failed to load note:", err);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!note) return;
    try {
      setSaving(true);
      await updateNote({
        id: note.id,
        description: body,
      });
      Alert.alert("Saved", "Your note has been saved.");
    } catch (err) {
      console.error("Failed to save note:", err);
      Alert.alert("Error", "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };
const mimeLabel =
  note?.mimeType === "application/pdf"
    ? "PDF"
    : note?.mimeType ?? "";

  if (!note) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.dark.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={[cardStyles.label, { marginTop: 8 }]}>
          Loading note...
        </Text>
      </View>
    );
  }

  const subjectText = note.subject;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.dark.background,
      }}
    >
      {/* Top bar with Save button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Text style={[cardStyles.labelBold, { fontSize: 18 }]}>
          {note.title}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: Colors.light.tint,
            opacity: saving ? 0.7 : 1,
          }}
          disabled={saving}
        >
          <Save color="#fff" size={16} />
          <Text
            style={{
              color: "#fff",
              marginLeft: 6,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject + time */}
        <View
          style={{
            marginBottom: 12,
          }}
        >
          <Text
            style={[
              cardStyles.label,
              { marginBottom: 4, opacity: 0.85 },
            ]}
          >
            {subjectText}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock color={Colors.dark.text} size={16} />
            <Text style={[cardStyles.label, { marginLeft: 4 }]}>
              {note.time}
            </Text>
          </View>
        </View>

              {/* Full-screen editor */}
      <TextInput
        placeholder="Write your note here..."
        placeholderTextColor="#777"
        value={body}
        onChangeText={setBody}
        multiline
        style={{
          minHeight: 300,
          borderRadius: 12,
          backgroundColor: "#1f1f1f",
          padding: 12,
          color: "#fff",
          textAlignVertical: "top",
          fontSize: 15,
          lineHeight: 22,
        }}
      />

      {/* Attachment button (if this note has a file) */}
      {note.fileUri && (
        <TouchableOpacity
          onPress={openAttachment}
          style={{
            marginTop: 16,
            backgroundColor: Colors.light.tint,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            View in another app {note.mimeType ? `(${note.mimeType})` : ""}
          </Text>
        </TouchableOpacity>
      )}

      </ScrollView>
    </View>
  );
}
