// app/(menu)/(notes)/noteDashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Plus, Edit3, Trash2 } from "lucide-react-native";

import { Colors, colors } from "../../../constants/theme";
import cardStyles from "../../../constants/styles/card-styles";

import {
  listNotes,
  createNote,
  deleteNote,
  UINote,
} from "../../../lib/notes-repo";
import { pickAndStoreFile } from "../../../lib/note-upload";

type NoteMode = "create" | "upload" | null;

// Fixed subject options
const SUBJECT_OPTIONS = [
  "English",
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Other",
];

// Map subjects to images (create these files under assets/subjects)
// Map subjects to images (your images folder)
const SUBJECT_IMAGES: Record<string, any> = {
  English: require("./images/English.jpg"),
  Math: require("./images/Math.jpg"),
  Physics: require("./images/Physics.jpg"),
  Chemistry: require("./images/Chemistry.jpg"),
  Biology: require("./images/Biology.jpg"),
  "Computer Science": require("./images/Computer Science.jpg"),
  History: require("./images/History.jpg"),
  Geography: require("./images/Geography.jpg"),
  Other: require("./images/Others.png"), // your "Others" image
};

function getSubjectImage(subject: string) {
  // subject will be one of the SUBJECT_OPTIONS (same spelling/case)
  return SUBJECT_IMAGES[subject] ?? SUBJECT_IMAGES.Other;
}


export default function NotesDashboard() {
  const router = useRouter();

  const [notes, setNotes] = useState<UINote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [mode, setMode] = useState<NoteMode>(null);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);

  const [pendingFile, setPendingFile] = useState<{
    fileUri: string;
    mimeType: string | null;
  } | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listNotes();
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Called every time the Notes tab/screen is focused
      loadNotes();
    }, [loadNotes])
  );

  const resetForm = () => {
    setName("");
    setSubject("");
    setPendingFile(null);
    setMode(null);
    setSubjectMenuOpen(false);
  };

  const openActionModal = () => {
    setActionModalVisible(true);
  };

  const handleChooseCreate = () => {
    setActionModalVisible(false);
    resetForm();
    setMode("create");
    setFormModalVisible(true);
  };

  const handleChooseUpload = async () => {
    setActionModalVisible(false);
    resetForm();
    setMode("upload");

    const picked = await pickAndStoreFile();
    if (!picked || !picked.fileUri) {
      setMode(null);
      return;
    }
    setPendingFile(picked);
    setFormModalVisible(true);
  };

  // Save meta (Name + Subject)
  const handleSaveMeta = async () => {
    if (!name.trim() || !subject.trim()) {
      Alert.alert("Missing info", "Please enter both name and subject.");
      return;
    }

    try {
      setSaving(true);

      if (mode === "create") {
        const id = await createNote({
          title: name.trim(),
          description: "",
          subject: subject.trim(),
          fileUri: null,
          mimeType: null,
        });

        setFormModalVisible(false);
        resetForm();

        router.push({
          pathname: "/(menu)/(notes)/noteView",
          params: { id: String(id), mode: "edit" },
        });
      } else if (mode === "upload" && pendingFile?.fileUri) {
        await createNote({
          title: name.trim(),
          description: "",
          subject: subject.trim(),
          fileUri: pendingFile.fileUri,
          mimeType: pendingFile.mimeType ?? null,
        });

        setFormModalVisible(false);
        resetForm();
        await loadNotes();
      }
    } catch (err) {
      console.error("Failed to save note metadata:", err);
      Alert.alert("Error", "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  // open in view or edit mode
  const openNote = (note: UINote, mode: "view" | "edit" = "view") => {
    router.push({
      pathname: "/(menu)/(notes)/noteView",
      params: { id: String(note.id), mode },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      {loading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[cardStyles.label, { marginTop: 8 }]}>
            Loading notes...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
            paddingTop: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {notes.length > 0 ? (
            notes.map((note) => {
              const subjectText = note.subject;
              const imageSource = getSubjectImage(subjectText || "Other");

              return (
                <TouchableOpacity
                  key={note.id}
                  style={styles.cardContainer}
                  onPress={() => openNote(note, "view")} // tap card = view mode
                  activeOpacity={0.9}
                >
                  {/* Top: subject image + created time overlay */}
                  <View style={styles.cardImageWrapper}>
                    <Image
                      source={imageSource}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.createdDateText}>
                      {note.createdTime}
                    </Text>
                  </View>

                  {/* Bottom: title + subject + actions */}
                  <View style={styles.cardBottomRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text
                        style={[
                          cardStyles.labelBold,
                          { fontSize: 18, marginBottom: 2 },
                        ]}
                        numberOfLines={1}
                      >
                        {note.title}
                      </Text>

                      <Text
                        style={[
                          cardStyles.label,
                          { opacity: 0.8 },
                        ]}
                        numberOfLines={1}
                      >
                        {subjectText}
                      </Text>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => openNote(note, "edit")}
                        style={[styles.actionButton, { marginRight: 8 }]}
                      >
                        <Edit3 color={colors.accent} size={16} />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(note.id)}
                        style={[
                          styles.actionButton,
                          { backgroundColor: "#802222" },
                        ]}
                      >
                        <Trash2 color="#FFDADA" size={16} />
                        <Text
                          style={[styles.actionText, { color: "#FFDADA" }]}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <Text style={[cardStyles.label, { color: colors.text }]}>
                No notes yet. Tap + to create or upload a note.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating + button */}
      <TouchableOpacity
        onPress={openActionModal}
        style={{
          position: "absolute",
          bottom: 30,
          right: 25,
          backgroundColor: colors.primary,
          borderRadius: 30,
          padding: 16,
          elevation: 5,
        }}
      >
        <Plus color={colors.accent} size={26} />
      </TouchableOpacity>

      {/* Action chooser modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionModal}>
            <Text
              style={[
                cardStyles.labelBold,
                { fontSize: 18, marginBottom: 12 },
              ]}
            >
              Add note
            </Text>

            <TouchableOpacity
              style={styles.actionOption}
              onPress={handleChooseCreate}
            >
              <Text style={styles.actionOptionText}>Create note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionOption}
              onPress={handleChooseUpload}
            >
              <Text style={styles.actionOptionText}>Upload note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionOption, { marginTop: 8 }]}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={[styles.actionOptionText, { opacity: 0.7 }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Name + Subject form modal */}
      <Modal
        visible={formModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setFormModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModal}>
            <Text
              style={[
                cardStyles.labelBold,
                { fontSize: 18, marginBottom: 12 },
              ]}
            >
              {mode === "create" ? "Create note" : "Upload note"}
            </Text>

            <TextInput
              placeholder="Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* Subject dropdown */}
            <Text style={[cardStyles.label, { marginBottom: 4 }]}>
              Subject
            </Text>

            <TouchableOpacity
              style={[styles.input, { justifyContent: "center" }]}
              onPress={() => setSubjectMenuOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: subject ? "#fff" : "#888",
                  fontSize: 14,
                }}
              >
                {subject || "Select subject"}
              </Text>
            </TouchableOpacity>

            {subjectMenuOpen && (
              <View style={styles.dropdown}>
                {SUBJECT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSubject(option);
                      setSubjectMenuOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {mode === "upload" && pendingFile && (
              <Text
                style={[cardStyles.label, { marginTop: 8, opacity: 0.8 }]}
              >
                File attached
              </Text>
            )}

            <View style={styles.formButtonsRow}>
              <TouchableOpacity
                onPress={() => {
                  setFormModalVisible(false);
                  resetForm();
                }}
                style={[styles.formButton, { backgroundColor: "#444" }]}
              >
                <Text style={[styles.formButtonText, { color: "#eee" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveMeta}
                style={[styles.formButton, { backgroundColor: colors.primary }]}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text
                    style={[styles.formButtonText, { color: colors.accent }]}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardImageWrapper: {
    position: "relative",
    height: 120,
    width: "100%",
    backgroundColor: "#222",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  createdDateText: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 11,
    color: "#fff",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardActionsRow: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#2f2f2f",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#f5f5f5",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionModal: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 16,
    width: "80%",
  },
  actionOption: {
    paddingVertical: 10,
  },
  actionOptionText: {
    color: "#fff",
    fontSize: 16,
  },
  formModal: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 16,
    width: "90%",
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#333",
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: "#444",
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dropdownItemText: {
    color: "#fff",
    fontSize: 14,
  },
  formButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  formButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  formButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
