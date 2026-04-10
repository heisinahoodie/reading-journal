import { getBooks } from "@/lib/actions/books";
import { GalleryGrid } from "./gallery-grid";

export default async function GalleryPage() {
  const books = await getBooks();

  return (
    <div className="space-y-6">
      <div className="animate-in animate-in-1">
        <h1>Gallery</h1>
        <p className="quote-text text-muted-foreground mt-1 text-base">
          Browse your library at a glance
        </p>
      </div>

      <GalleryGrid books={books} />
    </div>
  );
}
