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
import {
  getRelevantChunks,
  hasExtractedChunks,
  extractAndStoreChunks,
  extractAndStoreEpubChunks,
} from "@/lib/pdf-extract";

function getApiKey(): string | null {
  const db = getDb();
  const result = db.select().from(settings).where(eq(settings.key, "anthropic_api_key")).all();
  return result[0]?.value || null;
}

function getModel(): string {
  const db = getDb();
  const result = db.select().from(settings).where(eq(settings.key, "ai_model")).all();
  return result[0]?.value || "claude-sonnet-4-20250514";
}

async function buildSystemPrompt(bookId: string | null, userMessage: string = ""): Promise<string> {
  let systemPrompt = `You are a thoughtful literary assistant integrated into a personal reading journal app. You help readers explore, analyze, and reflect on their books. You are well-read, insightful, and encouraging. You draw connections between books, themes, and ideas.

Your responses should be:
- Thoughtful and substantive, but conversational
- Rich with literary insight and analysis
- Encouraging of deeper thinking and reflection
- Aware of the reader's personal journey with the book

When discussing a specific book, reference details from the reader's journal entries, quotes, and lessons when available. Help them see new perspectives and connections.

IMPORTANT: You DO have access to the reader's uploaded PDF books. The system automatically extracts relevant passages from the PDF based on what the reader asks about. These passages appear in the BOOK TEXT EXCERPTS section below when available. You CAN and SHOULD discuss the actual text content. Never tell the reader you cannot access or read their PDF — you can, and the excerpts prove it. If no excerpts appear for a particular question, it means the retrieval didn't find a strong match — ask the reader which specific chapter, scene, or topic they want to discuss so the system can find the right passages.`;

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

      // Inject relevant PDF text chunks if available
      if (userMessage && book.pdfPath) {
        const hasChunks = hasExtractedChunks(bookId!);
        if (!hasChunks) {
          // Trigger extraction in background for next time
          const isEpub = book.pdfPath.toLowerCase().endsWith(".epub");
          if (isEpub) {
            extractAndStoreEpubChunks(bookId!, book.pdfPath).catch((err) =>
              console.error("EPUB extraction failed:", err)
            );
          } else {
            extractAndStoreChunks(bookId!, book.pdfPath).catch((err) =>
              console.error("PDF extraction failed:", err)
            );
          }
        } else {
          // Use more chunks for chapter-specific queries, fewer for general questions
          const isChapterQuery = /chapter|ch\.?\s*\d|part\s+\d/i.test(userMessage);
          const chunkLimit = isChapterQuery ? 20 : 12;
          const relevantChunks = getRelevantChunks(bookId!, userMessage, chunkLimit, book.currentPage);
          if (relevantChunks.length > 0) {
            systemPrompt += `\n\n--- BOOK TEXT EXCERPTS ---
The following are relevant passages from the actual book text, matched to the reader's question. Use these to provide specific, textually-grounded responses. Reference page numbers when citing passages.\n`;
            for (const chunk of relevantChunks) {
              systemPrompt += `\n[Pages ${chunk.pageStart}–${chunk.pageEnd}]\n${chunk.text}\n`;
            }
            systemPrompt += `\n--- END BOOK TEXT EXCERPTS ---`;
          }
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
  const anthropic = createAnthropic({ apiKey, baseURL: "https://api.anthropic.com/v1" });

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
  const systemPrompt = await buildSystemPrompt(bookId, message);

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
        console.error("Chat API error:", error);
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
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 401 });
  }

  const { bookId, conversationId } = await request.json();

  if (!bookId) {
    return NextResponse.json(
      { error: "Book ID is required" },
      { status: 400 }
    );
  }

  // Get the full conversation to synthesize from
  let conversationText = "";
  if (conversationId) {
    const msgs = await getMessagesForConversation(conversationId);
    conversationText = msgs
      .map((m) => `${m.role === "user" ? "READER" : "AI"}: ${m.content}`)
      .join("\n\n");
  }

  if (!conversationText) {
    return NextResponse.json(
      { error: "No conversation to synthesize" },
      { status: 400 }
    );
  }

  const book = await getBook(bookId);
  const modelId = getModel();
  const anthropic = createAnthropic({ apiKey, baseURL: "https://api.anthropic.com/v1" });

  const { generateText } = await import("ai");

  const synthesisPrompt = `You are creating a personal reading journal entry from a conversation between a reader and an AI literary assistant about "${book?.title || "a book"}" by ${book?.author || "an author"}.

Your job is to write the entry FROM THE READER'S PERSPECTIVE — as if the reader themselves wrote it. Capture:
- Their original thoughts, reactions, and observations (these are the core)
- Elaborate on their ideas with additional literary insight they'd appreciate
- Weave in any connections or themes that emerged naturally in the discussion

Return a JSON object with these fields:
{
  "title": "A descriptive title for this entry (e.g. 'Chapter 43 — Brethren and the Descent into Darkness')",
  "chapterRange": "The chapter range discussed, if identifiable (e.g. '43-45'), or null",
  "thoughts": "The main journal entry text, written from the reader's perspective. Summarize and elaborate on THEIR thinking. Use first person. 3-5 paragraphs.",
  "keyLessons": ["Extract 2-5 key insights or lessons from the reader's observations"],
  "favoriteQuotes": ["Any book quotes the reader highlighted or that were significant in the discussion"],
  "themesAndIdeas": ["Key themes discussed"],
  "characters": ["Characters discussed"]
}

IMPORTANT: The entry should feel like the READER wrote it with help — not like an AI summary. Prioritize their voice, their observations, their reactions. Add depth and articulation to what they expressed, don't replace it.

Return ONLY valid JSON, no markdown fences.`;

  try {
    const result = await generateText({
      model: anthropic(modelId),
      system: synthesisPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the conversation to synthesize into a journal entry:\n\n${conversationText}`,
        },
      ],
    });

    let entry;
    try {
      const cleaned = result.text.replace(/```json\s*|```\s*/g, "").trim();
      entry = JSON.parse(cleaned);
    } catch {
      // Fallback if JSON parsing fails
      entry = {
        title: "Discussion Note",
        thoughts: result.text,
        keyLessons: [],
        favoriteQuotes: [],
        themesAndIdeas: [],
        characters: [],
      };
    }

    const entryId = await createEntry({
      bookId,
      title: entry.title || "Discussion Note",
      chapterRange: entry.chapterRange || undefined,
      thoughts: entry.thoughts || "",
      keyLessons: entry.keyLessons || [],
      favoriteQuotes: entry.favoriteQuotes || [],
      themesAndIdeas: entry.themesAndIdeas || [],
      characters: entry.characters || [],
    });

    return NextResponse.json({ id: entryId, entry });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Synthesis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
