import { NextRequest, NextResponse } from "next/server";
import { getBook } from "@/lib/actions/books";
import {
  extractAndStoreChunks,
  reExtractChunks,
  hasExtractedChunks,
  getChunkCount,
} from "@/lib/pdf-extract";

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const has = hasExtractedChunks(bookId);
  const count = has ? getChunkCount(bookId) : 0;
  return NextResponse.json({ hasChunks: has, chunkCount: count });
}

export async function POST(request: NextRequest) {
  const { bookId, force } = await request.json();
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const book = await getBook(bookId);
  if (!book?.pdfPath) {
    return NextResponse.json(
      { error: "No PDF uploaded for this book" },
      { status: 404 }
    );
  }

  try {
    const count = force
      ? await reExtractChunks(bookId, book.pdfPath)
      : await extractAndStoreChunks(bookId, book.pdfPath);
    return NextResponse.json({ success: true, chunkCount: count });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
