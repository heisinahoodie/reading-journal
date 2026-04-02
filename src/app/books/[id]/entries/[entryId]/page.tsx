import { getBook } from "@/lib/actions/books";
import { getEntry } from "@/lib/actions/entries";
import { notFound } from "next/navigation";
import { EntryEditor } from "@/components/entries/entry-editor";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { id, entryId } = await params;
  const [book, entry] = await Promise.all([getBook(id), getEntry(entryId)]);
  if (!book || !entry) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <a href={`/books/${book.id}`} className="text-primary hover:underline">
            {book.title}
          </a>
        </p>
        <h1 className="text-2xl font-bold">{entry.title}</h1>
      </div>
      <EntryEditor bookId={book.id} entry={entry} />
    </div>
  );
}
