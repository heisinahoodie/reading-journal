import path from "path";
import { getDb } from "@/lib/db";
import { pdfChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

const CHUNK_SIZE = 3000; // ~3000 chars per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks for context continuity

/**
 * Extract text from a PDF file using pdfjs-dist
 */
async function extractTextFromPdf(
  filePath: string
): Promise<{ text: string; pageTexts: Map<number, string> }> {
  // Dynamic import to avoid issues with SSR
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const absolutePath = path.join(process.cwd(), "data", "uploads", filePath);
  const doc = await pdfjsLib.getDocument(absolutePath).promise;
  const pageTexts = new Map<number, string>();
  let fullText = "";

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pageTexts.set(i, pageText);
    fullText += pageText + "\n\n";
  }

  return { text: fullText, pageTexts };
}

/**
 * Extract PDF text and store as chunks in the database.
 * Returns the number of chunks created.
 */
export async function extractAndStoreChunks(
  bookId: string,
  pdfPath: string
): Promise<number> {
  const db = getDb();

  // Check if chunks already exist for this book
  const existing = db
    .select()
    .from(pdfChunks)
    .where(eq(pdfChunks.bookId, bookId))
    .all();

  if (existing.length > 0) {
    return existing.length; // Already extracted
  }

  const { pageTexts } = await extractTextFromPdf(pdfPath);

  // Build chunks with page tracking
  const chunks: { text: string; pageStart: number; pageEnd: number }[] = [];
  let currentChunk = "";
  let chunkPageStart = 1;
  let currentPage = 1;

  for (const [pageNum, pageText] of pageTexts) {
    currentPage = pageNum;

    if (currentChunk.length + pageText.length > CHUNK_SIZE && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        text: currentChunk.trim(),
        pageStart: chunkPageStart,
        pageEnd: currentPage - 1,
      });

      // Start new chunk with overlap from end of previous
      const overlap = currentChunk.slice(-CHUNK_OVERLAP);
      currentChunk = overlap + " " + pageText;
      chunkPageStart = currentPage;
    } else {
      currentChunk += " " + pageText;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      pageStart: chunkPageStart,
      pageEnd: currentPage,
    });
  }

  // Store chunks in database
  const now = new Date().toISOString();
  for (let i = 0; i < chunks.length; i++) {
    db.insert(pdfChunks)
      .values({
        id: generateId(),
        bookId,
        chunkIndex: i,
        text: chunks[i].text,
        pageStart: chunks[i].pageStart,
        pageEnd: chunks[i].pageEnd,
        createdAt: now,
      })
      .run();
  }

  return chunks.length;
}

/**
 * Re-extract chunks for a book (e.g., after re-uploading a PDF)
 */
export async function reExtractChunks(
  bookId: string,
  pdfPath: string
): Promise<number> {
  const db = getDb();
  db.delete(pdfChunks).where(eq(pdfChunks.bookId, bookId)).run();
  return extractAndStoreChunks(bookId, pdfPath);
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "his", "how", "its", "let",
  "may", "who", "did", "get", "got", "him", "has", "its", "say", "she",
  "too", "use", "way", "about", "also", "been", "from", "have", "into",
  "just", "like", "make", "many", "more", "much", "must", "over", "such",
  "take", "than", "that", "them", "then", "they", "this", "very", "what",
  "when", "will", "with", "your", "some", "could", "would", "should",
  "there", "their", "which", "these", "those", "where", "being", "does",
  "doing", "going", "having", "other", "read", "talk", "discuss", "tell",
  "access", "want", "please", "know", "think", "chapter", "page", "book",
  "look", "come", "give", "help", "show", "find", "here", "were",
]);

/**
 * Detect chapter or page references in a query.
 * Returns { chapters: number[], pages: number[] }
 */
function detectReferences(query: string): { chapters: number[]; pages: number[] } {
  const chapters: number[] = [];
  const pages: number[] = [];

  // Match "chapter 43", "ch. 43", "ch43", "chapters 10-15"
  const chapterPatterns = [
    /chapters?\s*(\d+)\s*(?:[-–to]+\s*(\d+))?/gi,
    /ch\.?\s*(\d+)\s*(?:[-–to]+\s*(\d+))?/gi,
  ];
  for (const pattern of chapterPatterns) {
    let match;
    while ((match = pattern.exec(query)) !== null) {
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : start;
      for (let i = start; i <= end; i++) chapters.push(i);
    }
  }

  // Match "page 100", "pages 50-60", "p. 200"
  const pagePatterns = [
    /pages?\s*(\d+)\s*(?:[-–to]+\s*(\d+))?/gi,
    /p\.?\s*(\d+)\s*(?:[-–to]+\s*(\d+))?/gi,
  ];
  for (const pattern of pagePatterns) {
    let match;
    while ((match = pattern.exec(query)) !== null) {
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : start;
      pages.push(start, end);
    }
  }

  return { chapters: [...new Set(chapters)], pages: [...new Set(pages)] };
}

/**
 * Get relevant chunks for a user's question.
 * Uses chapter/page detection for targeted retrieval, with keyword fallback.
 * Falls back to reader's current position or recent content if no match.
 * Returns top N most relevant chunks.
 */
export function getRelevantChunks(
  bookId: string,
  query: string,
  maxChunks: number = 10,
  currentPage?: number | null
): { text: string; pageStart: number; pageEnd: number; score: number }[] {
  const db = getDb();
  const allChunks = db
    .select()
    .from(pdfChunks)
    .where(eq(pdfChunks.bookId, bookId))
    .all();

  if (allChunks.length === 0) return [];

  const refs = detectReferences(query);

  // If user asked about a specific chapter, find chunks containing that chapter heading
  // and surrounding content
  if (refs.chapters.length > 0) {
    const chapterChunks: typeof allChunks = [];
    const isSingleChapter = refs.chapters.length === 1;

    if (isSingleChapter) {
      // Single chapter mode: grab the full chapter content from heading to next chapter heading
      const chNum = refs.chapters[0];
      const headerPattern = new RegExp(`chapter\\s+${chNum}\\b`, "i");
      const nextHeaderPattern = new RegExp(`chapter\\s+${chNum + 1}\\b`, "i");

      for (let i = 0; i < allChunks.length; i++) {
        if (headerPattern.test(allChunks[i].text)) {
          // Skip table-of-contents chunks (they mention many chapters)
          const chapterMentions = (allChunks[i].text.match(/chapter\s+\d+/gi) || []).length;
          if (chapterMentions > 3) continue;

          // Collect all chunks from this heading until the next chapter heading (or max 15)
          for (let j = i; j < Math.min(i + 15, allChunks.length); j++) {
            // Stop when we hit the next chapter heading (but include the current heading chunk)
            if (j > i && nextHeaderPattern.test(allChunks[j].text)) {
              // Skip TOC chunks for the boundary check too
              const mentions = (allChunks[j].text.match(/chapter\s+\d+/gi) || []).length;
              if (mentions <= 3) break;
            }
            chapterChunks.push(allChunks[j]);
          }
          break;
        }
      }
    } else {
      // Chapter range mode: for each chapter, find heading + next 2 chunks
      const chunkLimit = Math.min(refs.chapters.length * 3, 15);

      for (const chNum of refs.chapters) {
        const headerPattern = new RegExp(`chapter\\s+${chNum}\\b`, "i");
        for (let i = 0; i < allChunks.length; i++) {
          if (headerPattern.test(allChunks[i].text)) {
            // Skip table-of-contents chunks (they mention many chapters)
            const chapterMentions = (allChunks[i].text.match(/chapter\s+\d+/gi) || []).length;
            if (chapterMentions > 3) continue;

            // Add this chunk and the next 2 (heading + 2 continuation chunks)
            for (let j = i; j < Math.min(i + 3, allChunks.length); j++) {
              if (!chapterChunks.includes(allChunks[j])) {
                chapterChunks.push(allChunks[j]);
              }
            }
            break; // Found this chapter's heading, move to next chapter number
          }
        }
      }

      // Trim to the computed limit
      if (chapterChunks.length > chunkLimit) {
        chapterChunks.length = chunkLimit;
      }
    }

    if (chapterChunks.length > 0) {
      return chapterChunks.map((c) => ({
        text: c.text,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        score: 100,
      }));
    }
  }

  // If user asked about specific pages, get chunks covering those pages
  if (refs.pages.length > 0) {
    const minPage = Math.min(...refs.pages);
    const maxPage = Math.max(...refs.pages);
    const pageChunks = allChunks
      .filter((c) => c.pageEnd >= minPage && c.pageStart <= maxPage)
      .slice(0, maxChunks);

    if (pageChunks.length > 0) {
      return pageChunks.map((c) => ({
        text: c.text,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        score: 100,
      }));
    }
  }

  // Keyword-based relevance scoring (fallback)
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  if (queryWords.length === 0) return [];

  const scored = allChunks.map((chunk) => {
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      const matches = chunkLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    // Penalize table-of-contents chunks (they match many keywords but aren't useful)
    const chapterMentions = (chunk.text.match(/chapter\s+\d+/gi) || []).length;
    if (chapterMentions > 5) score = Math.floor(score * 0.1);

    return {
      text: chunk.text,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      score,
    };
  });

  const keywordResults = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);

  if (keywordResults.length > 0) return keywordResults;

  // Fallback: if no keywords matched, provide chunks near the reader's current position
  // or from the latest content (skip first ~10% which is usually front matter)
  if (currentPage && currentPage > 0) {
    const nearCurrent = allChunks
      .filter((c) => c.pageEnd >= currentPage - 5 && c.pageStart <= currentPage + 10)
      .slice(0, maxChunks);
    if (nearCurrent.length > 0) {
      return nearCurrent.map((c) => ({
        text: c.text,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        score: 50,
      }));
    }
  }

  // Last resort: provide chunks from ~20% into the book (past front matter)
  const startIdx = Math.max(5, Math.floor(allChunks.length * 0.2));
  return allChunks.slice(startIdx, startIdx + maxChunks).map((c) => ({
    text: c.text,
    pageStart: c.pageStart,
    pageEnd: c.pageEnd,
    score: 10,
  }));
}

/**
 * Get chunks around a specific page range (useful for "what happens on page X" questions)
 */
export function getChunksForPages(
  bookId: string,
  startPage: number,
  endPage: number
): { text: string; pageStart: number; pageEnd: number }[] {
  const db = getDb();
  const allChunks = db
    .select()
    .from(pdfChunks)
    .where(eq(pdfChunks.bookId, bookId))
    .all();

  return allChunks.filter(
    (c) => c.pageEnd >= startPage && c.pageStart <= endPage
  );
}

/**
 * Check if a book has extracted chunks
 */
export function hasExtractedChunks(bookId: string): boolean {
  const db = getDb();
  const result = db
    .select()
    .from(pdfChunks)
    .where(eq(pdfChunks.bookId, bookId))
    .all();
  return result.length > 0;
}

/**
 * Get total chunk count for a book
 */
export function getChunkCount(bookId: string): number {
  const db = getDb();
  return db
    .select()
    .from(pdfChunks)
    .where(eq(pdfChunks.bookId, bookId))
    .all().length;
}
