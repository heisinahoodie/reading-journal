import { getBooks } from "@/lib/actions/books";
import { getShelves } from "@/lib/actions/shelves";
import { ShelvesClient } from "./shelves-client";

export default async function ShelvesPage() {
  const books = await getBooks();
  const customShelves = await getShelves();

  return (
    <div className="space-y-6">
      <div className="animate-in animate-in-1">
        <h1>Shelves</h1>
        <p className="quote-text text-muted-foreground mt-1 text-base">
          Your library, organized by collection
        </p>
      </div>

      <ShelvesClient books={books} customShelves={customShelves} />
    </div>
  );
}
