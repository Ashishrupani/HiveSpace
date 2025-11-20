import { getDB } from "./db";

/**
 * Shape of a note row in SQLite.
 * (internal, DB-level representation)
 */
export interface DBNote {
  id: number;
  title: string;
  description: string;
  tags: string | null; // stored as JSON string
  fileUri: string | null;
  mimeType: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Shape used by your UI (matches your NoteCard interface).
 */
export interface UINote {
  id: number;
  title: string;
  description: string;
  tags: string[];
  time: string; // formatted string like "2h ago" or date
  fileUri?: string | null;
  mimeType?: string | null;
}

/**
 * Helper: convert DB row -> UI note
 */
function mapRowToUINote(row: DBNote): UINote {
  let tags: string[] = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    tags = [];
  }

  // For now we'll just show a readable date/time.
  const time = new Date(row.updatedAt).toLocaleString();

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags,
    time,
    fileUri: row.fileUri,
    mimeType: row.mimeType,
  };
}

/**
 * Get all notes from SQLite, newest first.
 */
export async function listNotes(): Promise<UINote[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<DBNote>(
    "SELECT * FROM notes ORDER BY updatedAt DESC"
  );
  return rows.map(mapRowToUINote);
}

/**
 * Create a new note.
 */
export async function createNote(input: {
  title: string;
  description: string;
  tags?: string[];
  fileUri?: string | null;
  mimeType?: string | null;
}): Promise<number> {
  const db = await getDB();
  const now = Date.now();
  const tagsJson = input.tags ? JSON.stringify(input.tags) : null;

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

/**
 * Optional: get a single note by id (for later use in noteView if you want).
 */
export async function getNoteById(id: number): Promise<UINote | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<DBNote>(
    "SELECT * FROM notes WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return mapRowToUINote(row);
}

/**
 * Optional: delete a note.
 */
export async function deleteNote(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM notes WHERE id = ?", [id]);
}

export async function updateNote(input: {
  id: number;
  title?: string;
  description?: string;
  tags?: string[];
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
    input.tags !== undefined ? JSON.stringify(input.tags) : existing.tags;
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
