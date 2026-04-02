import { getBooks } from "@/lib/actions/books";
import { READING_STATUSES } from "@/lib/constants";
import { BoardClient } from "@/components/books/board-client";

export default async function BoardPage() {
  const allBooks = await getBooks();

  const columns = READING_STATUSES.map((status) => ({
    status,
    books: allBooks.filter((b) => b.status === status),
  }));

  return (
    <div className="space-y-6">
      <div className="animate-in animate-in-1">
        <h1 className="text-3xl font-semibold tracking-tight">Board</h1>
        <p className="text-muted-foreground mt-1 italic" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Drag books between columns to update their status
        </p>
      </div>

      <BoardClient columns={columns} />
    </div>
  );
}
