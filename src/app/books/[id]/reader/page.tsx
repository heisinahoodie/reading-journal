import { getBook } from "@/lib/actions/books";
import { getBookmarks } from "@/lib/actions/bookmarks";
import { notFound } from "next/navigation";
import { PdfReaderClient } from "./pdf-reader-client";
import { EpubReaderClient } from "./epub-reader-client";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const bookmarks = await getBookmarks(id);

  const isEpub = book.pdfPath?.endsWith(".epub");

  if (isEpub) {
    return (
      <EpubReaderClient
        bookId={book.id}
        title={book.title}
        author={book.author}
        pdfPath={book.pdfPath}
        currentPage={book.currentPage}
        totalPages={book.totalPages}
        initialBookmarks={bookmarks}
      />
    );
  }

  return (
    <PdfReaderClient
      bookId={book.id}
      title={book.title}
      author={book.author}
      pdfPath={book.pdfPath}
      currentPage={book.currentPage}
      totalPages={book.totalPages}
      initialBookmarks={bookmarks}
    />
  );
}
