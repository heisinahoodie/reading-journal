"use server";

import { getDb } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

function parseEntryJson(entry: any) {
  if (!entry) return entry;
  const tryParse = (val: any) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  };
  return {
    ...entry,
    keyLessons: tryParse(entry.keyLessons) ?? [],
    favoriteQuotes: tryParse(entry.favoriteQuotes) ?? [],
    themesAndIdeas: tryParse(entry.themesAndIdeas) ?? [],
    characters: tryParse(entry.characters) ?? [],
    connections: tryParse(entry.connections) ?? [],
  };
}

export async function getEntriesForBook(bookId: string) {
  const db = getDb();
  const result = db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.bookId, bookId))
    .orderBy(desc(journalEntries.createdAt))
    .all();
  return result.map(parseEntryJson);
}

export async function getEntry(id: string) {
  const db = getDb();
  const result = db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, id))
    .all();
  return parseEntryJson(result[0]) || null;
}

export async function createEntry(data: {
  bookId: string;
  title: string;
  chapterRange?: string;
  thoughts?: string;
  keyLessons?: string[];
  favoriteQuotes?: string[];
  themesAndIdeas?: string[];
  characters?: string[];
  connections?: string[];
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = generateId();

  db.insert(journalEntries).values({
    id,
    bookId: data.bookId,
    title: data.title,
    chapterRange: data.chapterRange || null,
    thoughts: data.thoughts || null,
    keyLessons: data.keyLessons || [],
    favoriteQuotes: data.favoriteQuotes || [],
    themesAndIdeas: data.themesAndIdeas || [],
    characters: data.characters || [],
    connections: data.connections || [],
    createdAt: now,
    updatedAt: now,
  }).run();

  return id;
}

export async function updateEntry(
  id: string,
  data: Partial<{
    title: string;
    chapterRange: string;
    thoughts: string;
    keyLessons: string[];
    favoriteQuotes: string[];
    themesAndIdeas: string[];
    characters: string[];
    connections: string[];
  }>
) {
  const db = getDb();
  const now = new Date().toISOString();
  db.update(journalEntries)
    .set({ ...data, updatedAt: now })
    .where(eq(journalEntries.id, id))
    .run();
}

export async function deleteEntry(id: string) {
  const db = getDb();
  db.delete(journalEntries).where(eq(journalEntries.id, id)).run();
}
