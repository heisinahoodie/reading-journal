import { getBook } from "@/lib/actions/books";
import { notFound } from "next/navigation";
import { EntryEditor } from "@/components/entries/entry-editor";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          New entry for{" "}
          <a href={`/books/${book.id}`} className="text-primary hover:underline">
            {book.title}
          </a>
        </p>
        <h1 className="text-2xl font-bold">New Journal Entry</h1>
      </div>
      <EntryEditor bookId={book.id} />
    </div>
  );
}
