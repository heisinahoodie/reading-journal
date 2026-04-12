"use server";

import { getDb } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function getBookmarks(bookId: string) {
  const db = getDb();
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.bookId, bookId))
    .orderBy(desc(bookmarks.createdAt))
    .all();
}

export async function getAllBookmarks() {
  const db = getDb();
  return db
    .select()
    .from(bookmarks)
    .orderBy(desc(bookmarks.createdAt))
    .all();
}

export async function createBookmark(data: {
  bookId: string;
  page?: number;
  chapterTitle?: string;
  note?: string;
  highlightText?: string;
  color?: string;
}) {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  db.insert(bookmarks)
    .values({
      id,
      bookId: data.bookId,
      page: data.page ?? null,
      chapterTitle: data.chapterTitle ?? null,
      note: data.note ?? null,
      highlightText: data.highlightText ?? null,
      color: data.color ?? "yellow",
      createdAt: now,
    })
    .run();

  return id;
}

export async function deleteBookmark(id: string) {
  const db = getDb();
  db.delete(bookmarks).where(eq(bookmarks.id, id)).run();
}
