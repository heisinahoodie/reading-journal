import { getBooks } from "@/lib/actions/books";
import { GalleryGrid } from "./gallery-grid";

export default async function GalleryPage() {
  const books = await getBooks();

  return (
    <div className="space-y-6">
      <div className="animate-in animate-in-1">
        <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
        <p className="text-muted-foreground mt-1 italic" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Browse your library at a glance
        </p>
      </div>

      <GalleryGrid books={books} />
    </div>
  );
}
