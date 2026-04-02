import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "reading-journal.db");

let db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    db = drizzle(sqlite, { schema });

    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT '',
        genres TEXT DEFAULT '[]',
        rating INTEGER,
        status TEXT NOT NULL DEFAULT 'to-read',
        reading_mood TEXT,
        start_date TEXT,
        finish_date TEXT,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER,
        pdf_path TEXT,
        cover_image_url TEXT,
        isbn TEXT,
        journal_entry TEXT,
        key_lessons TEXT DEFAULT '[]',
        favorite_quotes TEXT DEFAULT '[]',
        ai_discussion TEXT,
        ai_recommended INTEGER DEFAULT 0,
        place TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        chapter_range TEXT,
        thoughts TEXT,
        key_lessons TEXT DEFAULT '[]',
        favorite_quotes TEXT DEFAULT '[]',
        themes_and_ideas TEXT DEFAULT '[]',
        characters TEXT DEFAULT '[]',
        connections TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        summary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        reason TEXT,
        genres TEXT DEFAULT '[]',
        cover_image_url TEXT,
        isbn TEXT,
        added_to_library INTEGER DEFAULT 0,
        book_id TEXT REFERENCES books(id),
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        page INTEGER,
        chapter_title TEXT,
        note TEXT,
        highlight_text TEXT,
        color TEXT DEFAULT 'yellow',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }
  return db;
}
