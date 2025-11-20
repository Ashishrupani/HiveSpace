// mobile/lib/note-upload.ts
import * as DocumentPicker from "expo-document-picker";

export async function pickAndStoreFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",           // or "application/pdf" if you only want PDFs
    multiple: false,
    copyToCacheDirectory: false,
  });

  if (result.canceled || !result.assets?.length) {
    console.log(" User canceled file picker");
    return null;
  }

  const asset = result.assets[0]; // { uri, mimeType, name, size }

  console.log(" Picked file:", asset.uri, asset.mimeType);

  return {
    fileUri: asset.uri,
    mimeType: asset.mimeType ?? null,
  };
}
