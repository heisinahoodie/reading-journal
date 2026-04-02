"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Sparkles,
  Library,
  BookMarked,
  CheckCircle2,
  Bookmark,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { READING_MOODS } from "@/lib/constants";
import { StatusBadge } from "@/components/books/status-badge";
import { RatingStars } from "@/components/books/rating-stars";
import { AddBookDialog } from "@/components/books/add-book-dialog";

type Book = {
  id: string;
  title: string;
  author: string;
  genres: string[] | null;
  rating: number | null;
  status: string;
  readingMood: string | null;
  currentPage: number | null;
  totalPages: number | null;
  aiRecommended: boolean | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

type SortKey = "title" | "author" | "rating" | "status" | "totalPages" | "updatedAt";
type SortDir = "asc" | "desc";

const GENRE_COLORS: Record<string, string> = {
  Fiction: "bg-blue-500/15 text-blue-400",
  "Non-fiction": "bg-emerald-500/15 text-emerald-400",
  Philosophy: "bg-violet-500/15 text-violet-400",
  Classics: "bg-amber-500/15 text-amber-400",
  "Russian Literature": "bg-red-500/15 text-red-400",
  Mystery: "bg-slate-500/15 text-slate-300",
  "Science Fiction": "bg-cyan-500/15 text-cyan-400",
  Biography: "bg-orange-500/15 text-orange-400",
  History: "bg-yellow-500/15 text-yellow-400",
  Poetry: "bg-pink-500/15 text-pink-400",
  Fantasy: "bg-purple-500/15 text-purple-400",
};

interface FilterDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  filter: (book: Book) => boolean;
}

const FILTERS: FilterDef[] = [
  { key: "all", label: "All", icon: <Library size={14} />, filter: () => true },
  {
    key: "reading",
    label: "Currently Reading",
    icon: <BookOpen size={14} />,
    filter: (b) => b.status === "reading",
  },
  {
    key: "to-read",
    label: "To Read",
    icon: <Bookmark size={14} />,
    filter: (b) => b.status === "to-read",
  },
  {
    key: "finished",
    label: "Finished",
    icon: <CheckCircle2 size={14} />,
    filter: (b) => b.status === "finished",
  },
  {
    key: "ai-recommended",
    label: "AI Recommended",
    icon: <Sparkles size={14} />,
    filter: (b) => b.aiRecommended === true,
  },
  {
    key: "philosophy",
    label: "Philosophy",
    icon: <Flame size={14} />,
    filter: (b) => (b.genres ?? []).includes("Philosophy"),
  },
  {
    key: "fiction",
    label: "Fiction",
    icon: <BookMarked size={14} />,
    filter: (b) => (b.genres ?? []).includes("Fiction"),
  },
];

export function BooksClient({ books }: { books: Book[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const activeFilterDef = FILTERS.find((f) => f.key === activeFilter)!;

  const filteredBooks = useMemo(() => {
    return books.filter(activeFilterDef.filter);
  }, [books, activeFilterDef]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredBooks, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) {
      return <ArrowUpDown size={14} className="text-muted-foreground/40" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp size={14} className="text-primary" />
    ) : (
      <ArrowDown size={14} className="text-primary" />
    );
  }

  function getMoodLabel(mood: string | null) {
    if (!mood) return null;
    const found = READING_MOODS.find((m) => m.value === mood);
    return found ? `${found.emoji} ${found.label}` : mood;
  }

  return (
    <>
      {/* Filter bar + Add button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeFilter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          <Plus size={16} />
          Add Book
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {(
                  [
                    ["title", "Title"],
                    ["author", "Author"],
                    ["genres", "Genre"],
                    ["status", "Status"],
                    ["rating", "Rating"],
                    ["totalPages", "Pages"],
                    ["mood", "Mood"],
                  ] as const
                ).map(([key, label]) => {
                  const sortable = !["genres", "mood"].includes(key);
                  return (
                    <th
                      key={key}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                        sortable && "cursor-pointer select-none hover:text-foreground"
                      )}
                      onClick={() => sortable && handleSort(key as SortKey)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {label}
                        {sortable && <SortIcon column={key as SortKey} />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen size={32} className="text-muted-foreground/40" />
                      <p className="text-sm">No books found</p>
                      <button
                        onClick={() => setDialogOpen(true)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                      >
                        <Plus size={14} />
                        Add your first book
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedBooks.map((book) => (
                  <tr
                    key={book.id}
                    onClick={() => router.push(`/books/${book.id}`)}
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                  >
                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-7 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
                          <BookOpen size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-card-foreground">
                            {book.title}
                          </p>
                          {book.aiRecommended && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                              <Sparkles size={10} />
                              AI Pick
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {book.author || "\u2014"}
                    </td>

                    {/* Genres */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(book.genres ?? []).slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                              GENRE_COLORS[genre] ?? "bg-secondary text-muted-foreground"
                            )}
                          >
                            {genre}
                          </span>
                        ))}
                        {(book.genres ?? []).length > 2 && (
                          <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            +{(book.genres ?? []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={book.status} />
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <RatingStars rating={book.rating} size={14} />
                    </td>

                    {/* Pages */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {book.currentPage || book.totalPages ? (
                        <span>
                          {book.currentPage ?? 0}
                          {book.totalPages ? ` / ${book.totalPages}` : ""}
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>

                    {/* Mood */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {getMoodLabel(book.readingMood) ?? "\u2014"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddBookDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
