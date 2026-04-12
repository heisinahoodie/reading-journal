import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull().default(""),
  genres: text("genres", { mode: "json" }).$type<string[]>().default([]),
  rating: integer("rating"),
  status: text("status").notNull().default("to-read"),
  readingMood: text("reading_mood"),
  startDate: text("start_date"),
  finishDate: text("finish_date"),
  currentPage: integer("current_page").default(0),
  totalPages: integer("total_pages"),
  pdfPath: text("pdf_path"),
  coverImageUrl: text("cover_image_url"),
  isbn: text("isbn"),
  journalEntry: text("journal_entry"),
  keyLessons: text("key_lessons", { mode: "json" }).$type<string[]>().default([]),
  favoriteQuotes: text("favorite_quotes", { mode: "json" }).$type<string[]>().default([]),
  aiDiscussion: text("ai_discussion"),
  aiRecommended: integer("ai_recommended", { mode: "boolean" }).default(false),
  place: text("place"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  chapterRange: text("chapter_range"),
  thoughts: text("thoughts"),
  keyLessons: text("key_lessons", { mode: "json" }).$type<string[]>().default([]),
  favoriteQuotes: text("favorite_quotes", { mode: "json" }).$type<string[]>().default([]),
  themesAndIdeas: text("themes_and_ideas", { mode: "json" }).$type<string[]>().default([]),
  characters: text("characters", { mode: "json" }).$type<string[]>().default([]),
  connections: text("connections", { mode: "json" }).$type<string[]>().default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  bookId: text("book_id").references(() => books.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  summary: text("summary"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  reason: text("reason"),
  genres: text("genres", { mode: "json" }).$type<string[]>().default([]),
  coverImageUrl: text("cover_image_url"),
  isbn: text("isbn"),
  addedToLibrary: integer("added_to_library", { mode: "boolean" }).default(false),
  bookId: text("book_id").references(() => books.id),
  createdAt: text("created_at").notNull(),
});

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  page: integer("page"),
  chapterTitle: text("chapter_title"),
  note: text("note"),
  highlightText: text("highlight_text"),
  color: text("color").default("yellow"),
  createdAt: text("created_at").notNull(),
});

export const pdfChunks = sqliteTable("pdf_chunks", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  pageStart: integer("page_start").notNull(),
  pageEnd: integer("page_end").notNull(),
  createdAt: text("created_at").notNull(),
});

export const shelves = sqliteTable("shelves", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#c9982e"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").notNull(),
});

export const shelfBooks = sqliteTable("shelf_books", {
  id: text("id").primaryKey(),
  shelfId: text("shelf_id")
    .notNull()
    .references(() => shelves.id, { onDelete: "cascade" }),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  addedAt: text("added_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
