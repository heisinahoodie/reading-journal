"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STATUS_LABELS,
  READING_STATUSES,
  type ReadingStatus,
} from "@/lib/constants";
import { RatingStars } from "@/components/books/rating-stars";
import { StatusBadge } from "@/components/books/status-badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
  currentPage: number | null;
  totalPages: number | null;
  rating: number | null;
  genres: string[] | null;
  coverImageUrl: string | null;
}

/* ------------------------------------------------------------------ */
/*  Cover placeholder gradients                                        */
/* ------------------------------------------------------------------ */

const gradients = [
  "from-amber-700/80 to-yellow-900/60",
  "from-emerald-700/80 to-teal-900/60",
  "from-blue-700/80 to-indigo-900/60",
  "from-rose-700/80 to-pink-900/60",
  "from-violet-700/80 to-purple-900/60",
  "from-cyan-700/80 to-sky-900/60",
  "from-orange-700/80 to-red-900/60",
  "from-lime-700/80 to-green-900/60",
];

function getGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Filter bar                                                         */
/* ------------------------------------------------------------------ */

type FilterValue = "all" | ReadingStatus;

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reading", label: "Currently Reading" },
  { value: "finished", label: "Finished" },
  { value: "to-read", label: "To Read" },
];

/* ------------------------------------------------------------------ */
/*  Book card                                                          */
/* ------------------------------------------------------------------ */

function GalleryCard({ book }: { book: Book }) {
  const gradient = getGradient(book.title);
  const initials = getInitials(book.title);
  const [coverUrl, setCoverUrl] = useState<string | null>(book.coverImageUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!coverUrl && !imgError) {
      fetch(`/api/covers?bookId=${book.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.coverUrl) setCoverUrl(data.coverUrl);
        })
        .catch(() => {});
    }
  }, [book.id, coverUrl, imgError]);

  const showCover = coverUrl && !imgError;

  return (
    <Link
      href={`/books/${book.id}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden card-hover"
    >
      {/* Cover */}
      <div
        className={cn(
          "relative aspect-[2/3] bg-gradient-to-br flex items-center justify-center gallery-cover",
          gradient
        )}
      >
        {showCover ? (
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <>
            <span className="text-3xl font-bold text-white/70 select-none tracking-widest" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
              {initials}
            </span>
            {/* Decorative book spine line */}
            <div className="absolute inset-y-0 left-3 w-px bg-white/10" />
            <div className="absolute inset-y-0 left-4 w-px bg-white/5" />
          </>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={book.status} />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Reading progress bar overlay */}
        {book.status === "reading" &&
          book.currentPage != null &&
          book.totalPages != null &&
          book.totalPages > 0 && (
            <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
              <div className="h-1 rounded-full bg-black/30 overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full rounded-full progress-glow transition-all"
                  style={{
                    width: `${Math.round(
                      (book.currentPage / book.totalPages) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{book.author}</p>

        {/* Genre tags */}
        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {book.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
              >
                {genre}
              </span>
            ))}
            {book.genres.length > 2 && (
              <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{book.genres.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {book.status === "finished" && (
          <RatingStars rating={book.rating} size={12} />
        )}
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery grid                                                       */
/* ------------------------------------------------------------------ */

export function GalleryGrid({ books }: { books: Book[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered =
    filter === "all" ? books : books.filter((b) => b.status === filter);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count =
            f.value === "all"
              ? books.length
              : books.filter((b) => b.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs",
                  filter === f.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((book) => (
            <GalleryCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No books found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            {filter === "all"
              ? "Add your first book to start building your library."
              : `No books with "${filters.find((f) => f.value === filter)?.label}" status.`}
          </p>
        </div>
      )}
    </>
  );
}
