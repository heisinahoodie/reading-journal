import { notFound } from "next/navigation";
import { getBook } from "@/lib/actions/books";
import { getEntriesForBook } from "@/lib/actions/entries";
import { BookDetailClient } from "./book-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [book, entries] = await Promise.all([
    getBook(id),
    getEntriesForBook(id),
  ]);

  if (!book) {
    notFound();
  }

  return <BookDetailClient book={book} entries={entries} />;
}
