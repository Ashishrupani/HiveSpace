import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Clock, Save } from "lucide-react-native";

import { Colors, colors } from "../../../constants/theme";
import cardStyles from "../../../constants/styles/card-styles";

import { getNoteById, updateNote, UINote } from "../../../lib/notes-repo";
import * as Sharing from "expo-sharing";
import BackButton from "../../../components/ui/BackButton";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function NoteView() {
  // Note id passed via router params from the dashboard.
  const { id } = useLocalSearchParams<{ id: string }>();

  const [note, setNote] = useState<UINote | null>(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Attachment handling (open via system share sheet)
  // ---------------------------------------------------------------------------

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

      // Opens the system share sheet so the user can pick an app
      // (e.g., Microsoft Edge, Adobe, Google Drive) to open the file.
      await Sharing.shareAsync(current.fileUri);
    } catch (err) {
      console.error("Failed to share/open attachment:", err);
      Alert.alert(
        "Error",
        "Could not open attachment. Please try again or re-upload the file."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Load note data from SQLite
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const loaded = await getNoteById(Number(id));
        if (loaded) {
          setNote(loaded);
          setBody(loaded.description || "");
        } else {
          Alert.alert("Not found", "The requested note could not be found.");
        }
      } catch (err) {
        console.error("Failed to load note:", err);
        Alert.alert("Error", "Failed to load note.");
      }
    })();
  }, [id]);

  // ---------------------------------------------------------------------------
  // Save note body back to SQLite
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Loading state (before note is available)
  // ---------------------------------------------------------------------------

  if (!note) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.noteBackground,
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

  // Derived values
  const subjectText = note.subject;
  const mimeLabel =
    note.mimeType === "application/pdf"
      ? "PDF"
      : note.mimeType ?? "";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.noteBackground,
      }}
    >
      <BackButton />
      {/* Top bar with title + Save button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          paddingLeft: 60, // Make space for the back button
        }}
      >
        {/* Note title */}
        <Text
          style={[
            cardStyles.labelBold,
            { fontSize: 18, color: Colors.light.text },
          ]}
          numberOfLines={1}
        >
          {note.title}
        </Text>

        {/* Save button */}
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
        {/* Subject + time row */}
        <View
          style={{
            marginBottom: 12,
          }}
        >
          <Text
            style={[
              cardStyles.label,
              { marginBottom: 4, opacity: 0.85, color: Colors.light.text },
            ]}
          >
            {subjectText}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock color={Colors.light.text} size={16} />
            <Text
              style={[
                cardStyles.label,
                { marginLeft: 4, color: Colors.light.text },
              ]}
            >
              {note.time}
            </Text>
          </View>
        </View>

        {/* Attachment button (if this note has a file) */}
        {note.fileUri && (
          <TouchableOpacity
            onPress={openAttachment}
            style={{
              marginTop: 8,
              marginBottom: 12,
              backgroundColor: Colors.light.tint,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Open Uploaded File {mimeLabel ? `(${mimeLabel})` : ""}
            </Text>
          </TouchableOpacity>
        )}

        {/* Main text editor for the note body */}
        <TextInput
          placeholder="Write your note here..."
          placeholderTextColor="#777"
          value={body}
          onChangeText={setBody}
          multiline
          style={{
            minHeight: 300,
            borderRadius: 12,
            backgroundColor: colors.noteInput,
            padding: 12,
            color: Colors.light.text,
            textAlignVertical: "top",
            fontSize: 15,
            lineHeight: 22,
          }}
        />
      </ScrollView>
    </View>
  );
}
