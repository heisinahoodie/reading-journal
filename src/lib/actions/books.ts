"use server";

import { getDb } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

function parseJsonFields(book: any) {
  if (!book) return book;
  const tryParse = (val: any) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  };
  return {
    ...book,
    genres: tryParse(book.genres) ?? [],
    keyLessons: tryParse(book.keyLessons) ?? [],
    favoriteQuotes: tryParse(book.favoriteQuotes) ?? [],
  };
}

export async function getBooks() {
  const db = getDb();
  const result = db.select().from(books).orderBy(desc(books.updatedAt)).all();
  return result.map(parseJsonFields);
}

export async function getBook(id: string) {
  const db = getDb();
  const result = db.select().from(books).where(eq(books.id, id)).all();
  return parseJsonFields(result[0]) || null;
}

export async function getBooksByStatus(status: string) {
  const db = getDb();
  const result = db
    .select()
    .from(books)
    .where(eq(books.status, status))
    .orderBy(desc(books.updatedAt))
    .all();
  return result.map(parseJsonFields);
}

export async function createBook(data: {
  title: string;
  author: string;
  genres?: string[];
  status?: string;
  totalPages?: number;
  isbn?: string;
  coverImageUrl?: string;
  aiRecommended?: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = generateId();

  db.insert(books).values({
    id,
    title: data.title,
    author: data.author,
    genres: data.genres || [],
    status: data.status || "to-read",
    totalPages: data.totalPages || null,
    isbn: data.isbn || null,
    coverImageUrl: data.coverImageUrl || null,
    aiRecommended: data.aiRecommended || false,
    createdAt: now,
    updatedAt: now,
  }).run();

  return id;
}

export async function updateBook(
  id: string,
  data: Partial<{
    title: string;
    author: string;
    genres: string[];
    rating: number;
    status: string;
    readingMood: string;
    startDate: string;
    finishDate: string;
    currentPage: number;
    totalPages: number;
    pdfPath: string | null;
    coverImageUrl: string;
    isbn: string;
    journalEntry: string;
    keyLessons: string[];
    favoriteQuotes: string[];
    aiDiscussion: string;
    aiRecommended: boolean;
    place: string;
  }>
) {
  const db = getDb();
  const now = new Date().toISOString();

  // Auto-set dates based on status change
  const updates: Record<string, unknown> = { ...data, updatedAt: now };
  if (data.status === "reading" && !data.startDate) {
    updates.startDate = now.split("T")[0];
  }
  if (data.status === "finished" && !data.finishDate) {
    updates.finishDate = now.split("T")[0];
  }

  db.update(books).set(updates).where(eq(books.id, id)).run();
}

export async function deleteBook(id: string) {
  const db = getDb();
  db.delete(books).where(eq(books.id, id)).run();
}
