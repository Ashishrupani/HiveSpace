// mobile/lib/note-upload.ts
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

export async function pickAndStoreFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    console.log("User canceled file picker");
    return null;
  }

  const asset = result.assets[0]; // { uri, fileCopyUri, name, mimeType, size }

  // Prefer the copied file path inside our app, fall back to original
  const sourceUri = asset.fileCopyUri ?? asset.uri;

  console.log(
    "Picked file:",
    asset.uri,
    "copy:",
    asset.fileCopyUri,
    "mime:",
    asset.mimeType
  );
  console.log("Source URI to copy from:", sourceUri);

  // 🔹 Make a stable notes folder in documentDirectory
  const notesDir = FileSystem.documentDirectory + "notes/";
  try {
    await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
  } catch (e) {
    // it's fine if it already exists
  }

  const fileName = asset.name ?? `attachment-${Date.now()}.pdf`;
  const destUri = notesDir + fileName;

  // 🔹 Copy the file into our own documents folder
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });

  console.log("Stored attachment at:", destUri);

  return {
    fileUri: destUri,                  // 👈 this is what goes into SQLite
    mimeType: asset.mimeType ?? null,
  };
}
