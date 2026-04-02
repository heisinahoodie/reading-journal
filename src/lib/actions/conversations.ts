"use server";

import { getDb } from "@/lib/db";
import { conversations, messages, settings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function getConversations() {
  const db = getDb();
  return db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversation(id: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  return result[0] || null;
}

export async function getMessagesForConversation(conversationId: string) {
  const db = getDb();
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createConversation(data: {
  bookId?: string;
  title: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = generateId();

  await db.insert(conversations).values({
    id,
    bookId: data.bookId || null,
    title: data.title,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function addMessage(data: {
  conversationId: string;
  role: string;
  content: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = generateId();

  await db.insert(messages).values({
    id,
    conversationId: data.conversationId,
    role: data.role,
    content: data.content,
    createdAt: now,
  });

  await db
    .update(conversations)
    .set({ updatedAt: now })
    .where(eq(conversations.id, data.conversationId));

  return id;
}

export async function updateConversationSummary(id: string, summary: string) {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .update(conversations)
    .set({ summary, updatedAt: now })
    .where(eq(conversations.id, id));
}

export async function deleteConversation(id: string) {
  const db = getDb();
  await db.delete(conversations).where(eq(conversations.id, id));
}

export async function getApiKey(): Promise<string | null> {
  const db = getDb();
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "anthropic_api_key"));
  return result[0]?.value || null;
}

export async function setApiKey(apiKey: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "anthropic_api_key"));

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ value: apiKey })
      .where(eq(settings.key, "anthropic_api_key"));
  } else {
    await db.insert(settings).values({
      key: "anthropic_api_key",
      value: apiKey,
    });
  }
}
