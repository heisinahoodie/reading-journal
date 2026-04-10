import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recommendations, books, settings } from "@/lib/db/schema";
import { getApiKey } from "@/lib/actions/conversations";
import { getBooks, createBook } from "@/lib/actions/books";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

function getModel(): string {
  const db = getDb();
  const result = db.select().from(settings).where(eq(settings.key, "ai_model")).all();
  return result[0]?.value || "claude-sonnet-4-20250514";
}

export async function GET() {
  try {
    const db = getDb();
    const recs = db.select().from(recommendations).all();
    return NextResponse.json({ recommendations: recs });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}

export async function POST() {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key configured. Add your Anthropic API key in Settings." },
        { status: 401 }
      );
    }

    const allBooks = await getBooks();
    const readingProfile = allBooks
      .map(
        (b) =>
          `- "${b.title}" by ${b.author} (${b.status}, rating: ${b.rating || "unrated"}, genres: ${(b.genres as string[])?.join(", ") || "none"}, mood: ${b.readingMood || "none"})`
      )
      .join("\n");

    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const { generateText } = await import("ai");

    const anthropic = createAnthropic({ apiKey, baseURL: "https://api.anthropic.com/v1" });
    const modelId = getModel();

    const { text } = await generateText({
      model: anthropic(modelId),
      prompt: `Based on this reading history, recommend exactly 5 books the reader would enjoy. Return ONLY a JSON array with no other text.

Reading history:
${readingProfile}

Return format (JSON array only):
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "reason": "Why this reader would enjoy it (1-2 sentences)",
    "genres": ["Genre1", "Genre2"],
    "isbn": "ISBN if known or null"
  }
]`,
    });

    let parsed: any[];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();
    const newRecs = parsed.map((rec: any) => ({
      id: generateId(),
      title: rec.title,
      author: rec.author,
      reason: rec.reason || null,
      genres: JSON.stringify(rec.genres || []),
      coverImageUrl: rec.isbn
        ? `https://covers.openlibrary.org/b/isbn/${rec.isbn}-M.jpg`
        : null,
      isbn: rec.isbn || null,
      addedToLibrary: 0,
      bookId: null,
      createdAt: now,
    }));

    // Clear old recommendations and insert new
    db.delete(recommendations).run();
    for (const rec of newRecs) {
      db.insert(recommendations).values(rec as any).run();
    }

    const allRecs = db.select().from(recommendations).all();
    return NextResponse.json({ recommendations: allRecs });
  } catch (error: any) {
    const msg = error.message || "Failed to generate recommendations";
    // Surface friendly errors for common issues
    if (msg.includes("401") || msg.includes("authentication") || msg.includes("invalid")) {
      return NextResponse.json(
        { error: "Invalid API key. Check your key in Settings." },
        { status: 401 }
      );
    }
    if (msg.includes("model") || msg.includes("not_found")) {
      return NextResponse.json(
        { error: "Model not available. Try changing the AI model in Settings." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { recommendationId } = await request.json();
    const db = getDb();

    const rec = db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, recommendationId))
      .get();

    if (!rec) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bookId = await createBook({
      title: rec.title,
      author: rec.author,
      genres: rec.genres as string[],
      aiRecommended: true,
      isbn: rec.isbn || undefined,
    });

    db.update(recommendations)
      .set({ addedToLibrary: 1 as any, bookId })
      .where(eq(recommendations.id, recommendationId))
      .run();

    return NextResponse.json({ success: true, bookId });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
