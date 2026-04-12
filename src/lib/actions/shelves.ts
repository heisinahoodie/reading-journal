"use server";

import { getDb } from "@/lib/db";
import { shelves, shelfBooks, books } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function getShelves() {
  const db = getDb();
  const allShelves = db
    .select()
    .from(shelves)
    .orderBy(asc(shelves.sortOrder), asc(shelves.name))
    .all();

  // For each shelf, get its books
  const result = [];
  for (const shelf of allShelves) {
    const shelfBookRows = db
      .select({ bookId: shelfBooks.bookId })
      .from(shelfBooks)
      .where(eq(shelfBooks.shelfId, shelf.id))
      .all();

    const bookIds = shelfBookRows.map((r) => r.bookId);
    const shelfBooksData = bookIds.length > 0
      ? db
          .select()
          .from(books)
          .all()
          .filter((b) => bookIds.includes(b.id))
      : [];

    result.push({
      ...shelf,
      books: shelfBooksData.map((b) => ({
        ...b,
        genres: typeof b.genres === "string" ? JSON.parse(b.genres) : b.genres ?? [],
      })),
    });
  }

  return result;
}

export async function createShelf(name: string, color?: string) {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  // Get max sort order
  const existing = db.select().from(shelves).all();
  const maxOrder = existing.reduce((max, s) => Math.max(max, s.sortOrder ?? 0), 0);

  db.insert(shelves)
    .values({
      id,
      name,
      color: color || "#c9982e",
      sortOrder: maxOrder + 1,
      createdAt: now,
    })
    .run();

  return id;
}

export async function updateShelf(
  id: string,
  data: { name?: string; color?: string; sortOrder?: number }
) {
  const db = getDb();
  db.update(shelves).set(data).where(eq(shelves.id, id)).run();
}

export async function deleteShelf(id: string) {
  const db = getDb();
  db.delete(shelves).where(eq(shelves.id, id)).run();
}

export async function addBookToShelf(shelfId: string, bookId: string) {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  // Check if already exists
  const existing = db
    .select()
    .from(shelfBooks)
    .where(eq(shelfBooks.shelfId, shelfId))
    .all()
    .filter((r) => r.bookId === bookId);

  if (existing.length > 0) return;

  db.insert(shelfBooks)
    .values({ id, shelfId, bookId, addedAt: now })
    .run();
}

export async function removeBookFromShelf(shelfId: string, bookId: string) {
  const db = getDb();
  const rows = db
    .select()
    .from(shelfBooks)
    .where(eq(shelfBooks.shelfId, shelfId))
    .all()
    .filter((r) => r.bookId === bookId);

  for (const row of rows) {
    db.delete(shelfBooks).where(eq(shelfBooks.id, row.id)).run();
  }
}
