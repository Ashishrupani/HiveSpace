// mobile/lib/note-upload.ts
// -----------------------------------------------------------------------------
// Handles picking a document from the device and copying it into the app's
// own documents folder. The returned URI is what we store in SQLite.
//
// We rely on DocumentPicker + legacy FileSystem for simplicity in this project.
// -----------------------------------------------------------------------------

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

type PickedFileResult = {
  fileUri: string;
  mimeType: string | null;
} | null;

/**
 * Let the user pick a single file and copy it into:
 *   FileSystem.documentDirectory + "notes/<filename>"
 *
 * Returns:
 *  - { fileUri, mimeType } on success
 *  - null if the user cancels the picker
 */
export async function pickAndStoreFile(): Promise<PickedFileResult> {
  // Open the system file picker (any type, single file).
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*", // could be restricted to "application/pdf" if needed
    multiple: false,
    copyToCacheDirectory: true,
  });

  // User pressed "cancel" or we didn't get a valid asset back.
  if (result.canceled || !result.assets?.length) {
    console.log("User canceled file picker");
    return null;
  }

  // We only asked for a single file, so take the first asset.
  const asset = result.assets[0]; // { uri, name, mimeType, size, ... }

  // In current Expo, when copyToCacheDirectory = true,
  // asset.uri already points to the cached copy.
  const sourceUri = asset.uri;

  console.log(
    "Picked file:",
    asset.uri,
    "name:",
    asset.name,
    "mime:",
    asset.mimeType
  );
  console.log("Source URI to copy from:", sourceUri);

  // ---------------------------------------------------------------------------
  // Ensure we have a stable "notes" directory inside the app's documentDirectory.
  // This lives in the app sandbox and is what we reference later from SQLite.
  // ---------------------------------------------------------------------------

  const notesDir = FileSystem.documentDirectory + "notes/";

  try {
    await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
  } catch (e) {
    // It's fine if the directory already exists.
    console.log("notes directory already exists or could not be created:", e);
  }

  // Use the original file name when possible; otherwise, generate a fallback.
  const fileName = asset.name ?? `attachment-${Date.now()}.pdf`;
  const destUri = notesDir + fileName;

  // ---------------------------------------------------------------------------
  // Copy the file into our own notes directory so the path is stable.
  // ---------------------------------------------------------------------------

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });

  console.log("Stored attachment at:", destUri);

  // This is what gets saved in SQLite and used later to share/open the file.
  return {
    fileUri: destUri,
    mimeType: asset.mimeType ?? null,
  };
}
