import { getDB } from "./db";

/**
 * Shape of a note row in SQLite.
 * (internal, DB-level representation)
 */
export interface DBNote {
  id: number;
  title: string;
  description: string;
  tags: string | null; // stored as JSON string, first element = subject
  fileUri: string | null;
  mimeType: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Shape used by UI.
 */
export interface UINote {
  id: number;
  title: string;
  description: string;
  subject: string;      // single subject
  time: string;         // updated time (formatted)
  createdTime: string;  // created time (formatted)
  fileUri?: string | null;
  mimeType?: string | null;
}

 //Helper: convert DB row -> UI note
function mapRowToUINote(row: DBNote): UINote {
  let subject = "";
  try {
    const arr = row.tags ? (JSON.parse(row.tags) as string[]) : [];
    subject = arr[0] ?? "";
  } catch {
    subject = "";
  }

  const time = new Date(row.updatedAt).toLocaleString();
  const createdTime = new Date(row.createdAt).toLocaleString();

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subject,
    time,
    createdTime,
    fileUri: row.fileUri,
    mimeType: row.mimeType,
  };
}

// Get all notes from SQLite, newest first.

export async function listNotes(): Promise<UINote[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<DBNote>(
    "SELECT * FROM notes ORDER BY updatedAt DESC"
  );
  return rows.map(mapRowToUINote);
}


// Create a new note.

export async function createNote(input: {
  title: string;
  description: string;
  subject: string;
  fileUri?: string | null;
  mimeType?: string | null;
}): Promise<number> {
  const db = await getDB();
  const now = Date.now();

  // still stored as JSON array in DB for compatibility
  const tagsJson = JSON.stringify([input.subject]);

  const result = await db.runAsync(
    `INSERT INTO notes (title, description, tags, fileUri, mimeType, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description,
      tagsJson,
      input.fileUri ?? null,
      input.mimeType ?? null,
      now,
      now,
    ]
  );

  return result.lastInsertRowId!;
}


//Get a single note by id.
export async function getNoteById(id: number): Promise<UINote | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<DBNote>(
    "SELECT * FROM notes WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return mapRowToUINote(row);
}


// Delete a note.
export async function deleteNote(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM notes WHERE id = ?", [id]);
}

// Update a note.

export async function updateNote(input: {
  id: number;
  title?: string;
  description?: string;
  subject?: string;
  fileUri?: string | null;
  mimeType?: string | null;
}): Promise<void> {
  const db = await getDB();
  const existing = await db.getFirstAsync<DBNote>(
    "SELECT * FROM notes WHERE id = ?",
    [input.id]
  );
  if (!existing) return;

  const now = Date.now();

  const title = input.title ?? existing.title;
  const description = input.description ?? existing.description;

  const tagsJson =
    input.subject !== undefined
      ? JSON.stringify([input.subject])
      : existing.tags;

  const fileUri =
    input.fileUri !== undefined ? input.fileUri : existing.fileUri;
  const mimeType =
    input.mimeType !== undefined ? input.mimeType : existing.mimeType;

  await db.runAsync(
    `
    UPDATE notes
    SET title = ?, description = ?, tags = ?, fileUri = ?, mimeType = ?, updatedAt = ?
    WHERE id = ?
  `,
    [title, description, tagsJson, fileUri, mimeType, now, input.id]
  );
}
