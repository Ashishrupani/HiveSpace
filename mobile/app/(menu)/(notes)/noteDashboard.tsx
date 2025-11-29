// app/(menu)/(notes)/noteDashboard.tsx
// NotesDashboard
//  - Shows all notes saved in SQLite
//  - Lets the user create a new note or upload one with an attached file
//  - Navigates to noteView in "view" or "edit" mode
//  - All data access goes through lib/notes-repo and lib/note-upload

import React, { useState, useCallback } from "react";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Modal, TextInput, StyleSheet, Alert, Image,} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Plus, Edit3, Trash2 } from "lucide-react-native";
import { Colors, colors } from "../../../constants/theme";
import cardStyles from "../../../constants/styles/card-styles";
import {listNotes, createNote, deleteNote, UINote,} from "../../../lib/notes-repo";
import { pickAndStoreFile } from "../../../lib/note-upload";

// -----------------------------------------------------------------------------
// Types & constants
// -----------------------------------------------------------------------------

/**
 * Mode for the "Add note" flow.
 * - "create": user will create a blank note and type content in noteView.
 * - "upload": user picks a file and we attach its URI to the note.
 */
type NoteMode = "create" | "upload" | null;

/**
 * Fixed set of subjects that appear in the subject dropdown.
 */
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

/**
 * Static subject → image mapping.
 * NOTE: Make sure these files exist under the same folder as this file:
 *   ./images/English01.jpg
 *   ./images/Math01.jpg
 *   ...
 */
const SUBJECT_IMAGES: Record<string, any> = {
  English: require("./images/English01.jpg"),
  Math: require("./images/Math01.jpg"),
  Physics: require("./images/Physics01.jpg"),
  Chemistry: require("./images/Chemistry.jpg"),
  Biology: require("./images/Biology.jpg"),
  "Computer Science": require("./images/CompSci01.jpg"),
  History: require("./images/History01.jpg"),
  Geography: require("./images/Geography01.jpg"),
  Other: require("./images/others01.jpg"),
};

/**
 * Helper to safely pick an image for a subject.
 */
function getSubjectImage(subject: string) {
  return SUBJECT_IMAGES[subject] ?? SUBJECT_IMAGES.Other;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function NotesDashboard() {
  const router = useRouter();

  // List of all notes from SQLite.
  const [notes, setNotes] = useState<UINote[]>([]);
  const [loading, setLoading] = useState(true);

  // "Save" button state in the form modal.
  const [saving, setSaving] = useState(false);

  // Modal visibility flags.
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);

  // Current "Add note" mode ("create" or "upload").
  const [mode, setMode] = useState<NoteMode>(null);

  // Form fields for the Name + Subject modal.
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);

  // File picked during the "upload" flow.
  const [pendingFile, setPendingFile] = useState<{
    fileUri: string;
    mimeType: string | null;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  /**
   * Load all notes from SQLite and update state.
   */
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

  /**
   * Reload notes whenever the Notes tab/screen gains focus.
   * This ensures new/edited notes appear when you navigate back from noteView.
   */
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Reset all form-related state back to defaults.
   */
  const resetForm = () => {
    setName("");
    setSubject("");
    setPendingFile(null);
    setMode(null);
    setSubjectMenuOpen(false);
  };

  /**
   * Open the "Create or Upload?" action modal.
   */
  const openActionModal = () => {
    setActionModalVisible(true);
  };

  /**
   * User chose "Create note".
   * We just open the form modal in "create" mode.
   */
  const handleChooseCreate = () => {
    setActionModalVisible(false);
    resetForm();
    setMode("create");
    setFormModalVisible(true);
  };

  /**
   * User chose "Upload note".
   * We first pick a file, then open the form modal in "upload" mode.
   */
  const handleChooseUpload = async () => {
    setActionModalVisible(false);
    resetForm();
    setMode("upload");

    const picked = await pickAndStoreFile();
    if (!picked || !picked.fileUri) {
      // User cancelled picker; stop the flow.
      setMode(null);
      return;
    }

    setPendingFile(picked);
    setFormModalVisible(true);
  };

  /**
   * Save the Name + Subject metadata for a new note.
   * - In "create" mode: create an empty note and navigate to noteView (edit).
   * - In "upload" mode: create a note with fileUri and stay on dashboard.
   */
  const handleSaveMeta = async () => {
    if (!name.trim() || !subject.trim()) {
      Alert.alert("Missing info", "Please enter both name and subject.");
      return;
    }

    try {
      setSaving(true);

      if (mode === "create") {
        // Create an empty note and immediately open it in edit mode.
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
        // Create a note that has an attachment.
        await createNote({
          title: name.trim(),
          description: "",
          subject: subject.trim(),
          fileUri: pendingFile.fileUri,
          mimeType: pendingFile.mimeType ?? null,
        });

        setFormModalVisible(false);
        resetForm();
        await loadNotes(); // refresh list so the new card appears
      }
    } catch (err) {
      console.error("Failed to save note metadata:", err);
      Alert.alert("Error", "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Navigate to the noteView screen in either "view" or "edit" mode.
   */
  const openNote = (note: UINote, mode: "view" | "edit" = "view") => {
    router.push({
      pathname: "/(menu)/(notes)/noteView",
      params: { id: String(note.id), mode },
    });
  };

  /**
   * Delete a note after user confirmation.
   */
  const handleDelete = (id: number) => {
    Alert.alert("Delete note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(id);
            await loadNotes();
          } catch (err) {
            console.error("Failed to delete note:", err);
            Alert.alert("Error", "Failed to delete note.");
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={{ flex: 1, backgroundColor: colors.noteBackground }}>
      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[cardStyles.label, { marginTop: 8 }]}>
            Loading notes...
          </Text>
        </View>
      ) : (
        // Notes list
        <ScrollView
          contentContainerStyle={styles.listContentContainer}
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
                          { fontSize: 18, marginBottom: 2 }, { color: Colors.light.text },
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
                      {/* Edit note button */}
                      <TouchableOpacity
                        onPress={() => openNote(note, "edit")}
                        style={[styles.actionButton, { marginRight: 8 }]}
                      >
                        <Edit3 color={colors.accent} size={16} />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>

                      {/* Delete note button */}
                      <TouchableOpacity
                        onPress={() => handleDelete(note.id)}
                        style={[
                          styles.actionButton,
                          { backgroundColor: "#ef6800ff" },
                        ]}
                      >
                        <Trash2 color="#FFDADA" size={16} />
                        <Text
                          style={[styles.actionText, { color: "#ffe5daff" }]}
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
            // Empty state
            <View style={styles.emptyStateContainer}>
              <Text style={[cardStyles.label, { color: Colors.light.text }]}>
                No notes yet. Tap + to create or upload a note.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating + button (open action modal) */}
      <TouchableOpacity onPress={openActionModal} style={styles.fab}>
        <Plus color={colors.accent} size={26} />
      </TouchableOpacity>

      {/* ---------------------------------------------------------------------
         Action chooser modal ("Create note" or "Upload note")
         ------------------------------------------------------------------ */}
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
                { fontSize: 18, marginBottom: 12 }, { color: Colors.light.text }
              ]}
            >
              Add note
            </Text>

            <TouchableOpacity
              style={styles.actionOption}
              onPress={handleChooseCreate}
            >
              <Text style={[styles.actionOptionText, { color: Colors.light.text }]}>Create note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionOption}
              onPress={handleChooseUpload}
            >
              <Text style={[styles.actionOptionText,{ color: Colors.light.text }]}>Upload note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionOption, { marginTop: 8 }]}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={[styles.actionOptionText, { opacity: 0.7 },{ color: Colors.light.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------------------------------------------------------------------
         Name + Subject form modal
         ------------------------------------------------------------------ */}
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
                { fontSize: 18, marginBottom: 12 }, { color: Colors.light.text }
              ]}
            >
              {mode === "create" ? "Create note" : "Upload note"}
            </Text>

            {/* Name input */}
            <TextInput
              placeholder="Name"
              placeholderTextColor="#7a7a7aff"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* Subject dropdown label */}
            <Text style={[cardStyles.label, { marginBottom: 4 }, { color: Colors.light.text }]}>
              Subject
            </Text>

            {/* Subject dropdown trigger */}
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center" }]}
              onPress={() => setSubjectMenuOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: subject ? Colors.light.text : "#888",
                  fontSize: 14,
                }}
              >
                {subject || "Select subject"}
              </Text>
            </TouchableOpacity>

            {/* Subject dropdown list */}
            {subjectMenuOpen && (
              <View style={styles.dropdown}>
                <ScrollView>
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
                </ScrollView>
              </View>
            )}

            {/* Small hint when a file has been attached in upload mode */}
            {mode === "upload" && pendingFile && (
              <Text
                style={[cardStyles.label, { marginTop: 8, opacity: 0.8 }]}
              >
                File attached
              </Text>
            )}

            {/* Form buttons: Cancel / Save */}
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

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 12,
  },

  // Note card
  cardContainer: {
    backgroundColor: colors.noteCard,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardImageWrapper: {
    position: "relative",
    height: 120,
    width: "100%",
    backgroundColor: colors.noteCard,
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

  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },

  // Overlay used by both modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  // "Create or Upload?" modal
  actionModal: {
    backgroundColor: colors.noteCard,
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

  // Name + Subject modal
  formModal: {
    backgroundColor: colors.noteCard,
    borderRadius: 16,
    padding: 16,
    width: "90%",
  },
  input: {
    backgroundColor: colors.noteInput,
    color: Colors.light.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // Subject dropdown
  dropdown: {
    backgroundColor: colors.noteInput,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    maxHeight: 180, // keeps it from getting too tall
    borderWidth: 1,
    borderColor: "#444",
    width: "100%",
    alignSelf: "stretch",
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dropdownItemText: {
    color: Colors.light.text,
    fontSize: 14,
  },

  // Form buttons
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

  // Floating action button (+)
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
});
