import { getBooks } from "@/lib/actions/books";
import { BooksClient } from "./books-client";

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-in animate-in-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground italic" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          {books.length} {books.length === 1 ? "book" : "books"} in your
          collection
        </p>
      </div>

      <BooksClient books={books} />
    </div>
  );
}
