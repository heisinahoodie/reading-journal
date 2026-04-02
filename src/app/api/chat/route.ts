import { NextRequest, NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getBook } from "@/lib/actions/books";
import { getEntriesForBook } from "@/lib/actions/entries";
import {
  createConversation,
  addMessage,
  getMessagesForConversation,
  updateConversationSummary,
} from "@/lib/actions/conversations";
import { createEntry } from "@/lib/actions/entries";
import { generateId } from "@/lib/utils";

function getApiKey(): string | null {
  const db = getDb();
  const result = db.select().from(settings).where(eq(settings.key, "anthropic_api_key")).all();
  return result[0]?.value || null;
}

function getModel(): string {
  const db = getDb();
  const result = db.select().from(settings).where(eq(settings.key, "ai_model")).all();
  return result[0]?.value || "claude-sonnet-4-5-20250514";
}

async function buildSystemPrompt(bookId: string | null): Promise<string> {
  let systemPrompt = `You are a thoughtful literary assistant integrated into a personal reading journal app. You help readers explore, analyze, and reflect on their books. You are well-read, insightful, and encouraging. You draw connections between books, themes, and ideas.

Your responses should be:
- Thoughtful and substantive, but conversational
- Rich with literary insight and analysis
- Encouraging of deeper thinking and reflection
- Aware of the reader's personal journey with the book

When discussing a specific book, reference details from the reader's journal entries, quotes, and lessons when available. Help them see new perspectives and connections.`;

  if (bookId) {
    const book = await getBook(bookId);
    if (book) {
      systemPrompt += `\n\n--- BOOK CONTEXT ---
Title: ${book.title}
Author: ${book.author}
Status: ${book.status}
Rating: ${book.rating ? `${book.rating}/5` : "Not rated yet"}
Genres: ${(book.genres as string[])?.join(", ") || "Not specified"}
Reading Mood: ${book.readingMood || "Not specified"}
Progress: ${book.currentPage || 0}/${book.totalPages || "?"} pages`;

      if (book.journalEntry) {
        systemPrompt += `\n\nReader's Journal Entry:\n${book.journalEntry}`;
      }

      if (book.favoriteQuotes && (book.favoriteQuotes as string[]).length > 0) {
        systemPrompt += `\n\nFavorite Quotes:\n${(book.favoriteQuotes as string[]).map((q) => `- "${q}"`).join("\n")}`;
      }

      if (book.keyLessons && (book.keyLessons as string[]).length > 0) {
        systemPrompt += `\n\nKey Lessons:\n${(book.keyLessons as string[]).map((l) => `- ${l}`).join("\n")}`;
      }

      // Fetch journal entries for additional context
      const entries = await getEntriesForBook(bookId);
      if (entries.length > 0) {
        systemPrompt += `\n\nJournal Entries:`;
        for (const entry of entries.slice(0, 5)) {
          systemPrompt += `\n\n[${entry.title}${entry.chapterRange ? ` - ${entry.chapterRange}` : ""}]`;
          if (entry.thoughts) systemPrompt += `\nThoughts: ${entry.thoughts}`;
          if ((entry.themesAndIdeas as string[])?.length > 0)
            systemPrompt += `\nThemes: ${(entry.themesAndIdeas as string[]).join(", ")}`;
          if ((entry.characters as string[])?.length > 0)
            systemPrompt += `\nCharacters discussed: ${(entry.characters as string[]).join(", ")}`;
          if ((entry.favoriteQuotes as string[])?.length > 0)
            systemPrompt += `\nQuotes: ${(entry.favoriteQuotes as string[]).map((q) => `"${q}"`).join("; ")}`;
          if ((entry.keyLessons as string[])?.length > 0)
            systemPrompt += `\nLessons: ${(entry.keyLessons as string[]).join("; ")}`;
        }
      }

      systemPrompt += `\n--- END BOOK CONTEXT ---\n\nThe reader is currently discussing "${book.title}" by ${book.author}. Use the context above to provide personalized, relevant responses.`;
    }
  }

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key configured. Please add your Anthropic API key in Settings." },
      { status: 401 }
    );
  }

  const { message, conversationId, bookId, summarize } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const modelId = getModel();
  const anthropic = createAnthropic({ apiKey });

  // Create or use existing conversation
  let convId = conversationId;
  if (!convId) {
    const title =
      message.length > 60 ? message.substring(0, 57) + "..." : message;
    convId = await createConversation({ bookId: bookId || undefined, title });
  }

  // Save user message
  await addMessage({ conversationId: convId, role: "user", content: message });

  // Build conversation history
  const previousMessages = await getMessagesForConversation(convId);
  const systemPrompt = await buildSystemPrompt(bookId);

  const formattedMessages = previousMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send conversation ID first if it's new
        if (!conversationId) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "conversation", id: convId })}\n\n`
            )
          );
        }

        const result = streamText({
          model: anthropic(modelId),
          system: systemPrompt,
          messages: formattedMessages,
        });

        let fullResponse = "";

        for await (const chunk of (await result).textStream) {
          fullResponse += chunk;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`
            )
          );
        }

        // Save assistant message
        await addMessage({
          conversationId: convId,
          role: "assistant",
          content: fullResponse,
        });

        // If summarize request, update conversation summary
        if (summarize && fullResponse) {
          await updateConversationSummary(convId, fullResponse.substring(0, 500));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "text", content: `\n\nError: ${errorMessage}` })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function PUT(request: NextRequest) {
  // Save AI message as journal entry
  const { bookId, content } = await request.json();

  if (!bookId || !content) {
    return NextResponse.json(
      { error: "Book ID and content are required" },
      { status: 400 }
    );
  }

  const entryId = await createEntry({
    bookId,
    title: "AI Discussion Note",
    thoughts: content,
  });

  return NextResponse.json({ id: entryId });
}
