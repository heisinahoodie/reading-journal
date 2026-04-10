import { NextRequest, NextResponse } from "next/server";
import { fetchCoverUrl } from "@/lib/covers";
import { getBook, updateBook } from "@/lib/actions/books";

/**
 * GET /api/covers?bookId=xxx
 * Fetches a cover from Open Library and saves it to the book record.
 */
export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const book = await getBook(bookId);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Already has a cover
  if (book.coverImageUrl) {
    return NextResponse.json({ coverUrl: book.coverImageUrl });
  }

  const coverUrl = await fetchCoverUrl(book.isbn, book.title, book.author);
  if (coverUrl) {
    await updateBook(bookId, { coverImageUrl: coverUrl });
    return NextResponse.json({ coverUrl });
  }

  return NextResponse.json({ coverUrl: null });
}
