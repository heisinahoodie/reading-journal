import { getBook } from "@/lib/actions/books";
import { notFound } from "next/navigation";
import { PdfReaderClient } from "./pdf-reader-client";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  return (
    <PdfReaderClient
      bookId={book.id}
      title={book.title}
      author={book.author}
      pdfPath={book.pdfPath}
      currentPage={book.currentPage}
      totalPages={book.totalPages}
    />
  );
}
