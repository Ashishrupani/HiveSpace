import * as SQLite from "expo-sqlite";

// Reuse the same DB connection everywhere
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("hive-notes.db");
  }
  return dbPromise;
}

// Run once to create the table if it doesn't exist
export async function migrate() {
  const db = await getDB();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT,
      fileUri TEXT,
      mimeType TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
}
