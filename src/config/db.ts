import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "database.sqlite"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
// Enable foreign keys for ON DELETE CASCADE to work
db.pragma("foreign_keys = ON");

// 2. Create tables if they don't exist
// Storing dates as UTC ISO strings using strftime
db.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS cards (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id          INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front            TEXT NOT NULL,
    back             TEXT NOT NULL,
    easiness_factor  REAL DEFAULT 2.5,
    interval         INTEGER DEFAULT 0,
    repetitions      INTEGER DEFAULT 0,
    due_date         TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    created_at       TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);

// 3. Export the db instance
export default db;
