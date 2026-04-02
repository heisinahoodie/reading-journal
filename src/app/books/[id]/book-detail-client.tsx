"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Edit3,
  FileText,
  Hash,
  Lightbulb,
  MessageSquare,
  Plus,
  Quote,
  Sparkles,
  MapPin,
} from "lucide-react";
import { cn, formatDate, getProgressPercent } from "@/lib/utils";
import { updateBook } from "@/lib/actions/books";
import {
  READING_STATUSES,
  STATUS_LABELS,
  READING_MOODS,
  type ReadingStatus,
} from "@/lib/constants";
import { StatusBadge } from "@/components/books/status-badge";
import { RatingStars } from "@/components/books/rating-stars";

type Book = {
  id: string;
  title: string;
  author: string;
  genres: string[] | null;
  rating: number | null;
  status: string;
  readingMood: string | null;
  startDate: string | null;
  finishDate: string | null;
  currentPage: number | null;
  totalPages: number | null;
  coverImageUrl: string | null;
  isbn: string | null;
  keyLessons: string[] | null;
  favoriteQuotes: string[] | null;
  aiDiscussion: string | null;
  aiRecommended: boolean | null;
  place: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

type Entry = {
  id: string;
  bookId: string;
  title: string;
  chapterRange: string | null;
  thoughts: string | null;
  keyLessons: string[] | null;
  favoriteQuotes: string[] | null;
  themesAndIdeas: string[] | null;
  characters: string[] | null;
  connections: string[] | null;
  createdAt: string;
  updatedAt: string;
};

const TABS = [
  { key: "entries", label: "Journal Entries", icon: FileText },
  { key: "quotes", label: "Quotes", icon: Quote },
  { key: "lessons", label: "Key Lessons", icon: Lightbulb },
  { key: "ai", label: "AI Discussion", icon: Sparkles },
] as const;

type TabKey = (typeof TABS)[number]["key"];

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

export function BookDetailClient({
  book,
  entries,
}: {
  book: Book;
  entries: Entry[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("entries");
  const [isPending, startTransition] = useTransition();

  const progress = getProgressPercent(book.currentPage, book.totalPages);
  const moodEntry = READING_MOODS.find((m) => m.value === book.readingMood);

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      await updateBook(book.id, { status: newStatus });
      router.refresh();
    });
  }

  function handleMoodChange(newMood: string) {
    startTransition(async () => {
      await updateBook(book.id, { readingMood: newMood || undefined });
      router.refresh();
    });
  }

  function handlePageChange(pages: string) {
    const val = parseInt(pages, 10);
    if (isNaN(val) || val < 0) return;
    startTransition(async () => {
      await updateBook(book.id, { currentPage: val });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Back nav */}
      <Link
        href="/books"
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to Library
      </Link>

      {/* Hero section */}
      <div className="flex gap-8">
        {/* Cover placeholder */}
        <div className="flex h-64 w-44 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary shadow-lg">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <BookOpen size={32} />
              <span className="text-[10px] uppercase tracking-widest">
                No Cover
              </span>
            </div>
          )}
        </div>

        {/* Book info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="space-y-3">
            {/* Title + AI badge */}
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                {book.title}
              </h1>
              {book.aiRecommended && (
                <span className="mt-1.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Sparkles size={12} />
                  AI Pick
                </span>
              )}
            </div>

            {/* Author */}
            <p className="text-lg text-muted-foreground">
              by{" "}
              <span className="font-medium text-foreground">{book.author || "Unknown"}</span>
            </p>

            {/* Genres */}
            {(book.genres ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(book.genres ?? []).map((genre) => (
                  <span
                    key={genre}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      GENRE_COLORS[genre] ?? "bg-secondary text-muted-foreground"
                    )}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3">
              <RatingStars
                bookId={book.id}
                rating={book.rating}
                editable
                size={20}
              />
              {book.rating && (
                <span className="text-sm text-muted-foreground">
                  {book.rating}/5
                </span>
              )}
            </div>
          </div>

          {/* ISBN */}
          {book.isbn && (
            <p className="mt-2 text-xs text-muted-foreground">
              ISBN: {book.isbn}
            </p>
          )}
        </div>
      </div>

      {/* Editable properties grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Status */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          <select
            value={book.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {READING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Current Page */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Progress
          </p>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              defaultValue={book.currentPage ?? 0}
              min={0}
              max={book.totalPages ?? undefined}
              onBlur={(e) => handlePageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">
              / {book.totalPages ?? "?"}
            </span>
          </div>
          {book.totalPages && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}
        </div>

        {/* Mood */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mood
          </p>
          <select
            value={book.readingMood ?? ""}
            onChange={(e) => handleMoodChange(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="">None</option>
            {READING_MOODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.emoji} {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Started
          </p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            {book.startDate ? formatDate(book.startDate) : "Not started"}
          </div>
        </div>

        {/* Finish Date */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Finished
          </p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            {book.finishDate ? formatDate(book.finishDate) : "\u2014"}
          </div>
        </div>

        {/* Place */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Place
          </p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin size={14} className="text-muted-foreground" />
            {book.place || "\u2014"}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/chat?bookId=${book.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          <MessageSquare size={16} />
          Discuss with AI
        </Link>
        <Link
          href={`/books/${book.id}/entries/new`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
        >
          <Plus size={16} />
          Add Entry
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === "entries" && (
          <EntriesTab entries={entries} bookId={book.id} />
        )}
        {activeTab === "quotes" && (
          <QuotesTab quotes={book.favoriteQuotes ?? []} />
        )}
        {activeTab === "lessons" && (
          <LessonsTab lessons={book.keyLessons ?? []} />
        )}
        {activeTab === "ai" && (
          <AITab discussion={book.aiDiscussion} bookId={book.id} />
        )}
      </div>
    </div>
  );
}

/* ---- Tab Components ---- */

function EntriesTab({
  entries,
  bookId,
}: {
  entries: Entry[];
  bookId: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText size={32} className="mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No journal entries yet
        </p>
        <Link
          href={`/books/${bookId}/entries/new`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={14} />
          Write your first entry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/books/${bookId}/entries/${entry.id}`}
          className="block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/50"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-card-foreground">
                {entry.title}
              </h3>
              {entry.chapterRange && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash size={12} />
                  {entry.chapterRange}
                </p>
              )}
              {entry.thoughts && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {entry.thoughts}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />
              {formatDate(entry.createdAt)}
            </div>
          </div>

          {/* Tags summary */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(entry.keyLessons ?? []).length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                <Lightbulb size={10} />
                {(entry.keyLessons ?? []).length} lessons
              </span>
            )}
            {(entry.favoriteQuotes ?? []).length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                <Quote size={10} />
                {(entry.favoriteQuotes ?? []).length} quotes
              </span>
            )}
            {(entry.themesAndIdeas ?? []).length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                <Sparkles size={10} />
                {(entry.themesAndIdeas ?? []).length} themes
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function QuotesTab({ quotes }: { quotes: string[] }) {
  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Quote size={32} className="mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No favorite quotes saved yet
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2">
      {quotes.map((quote, i) => (
        <div
          key={i}
          className="mb-4 break-inside-avoid rounded-xl border border-border bg-card p-5"
        >
          <Quote
            size={16}
            className="mb-2 text-primary/60"
          />
          <p className="text-sm italic leading-relaxed text-card-foreground">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}

function LessonsTab({ lessons }: { lessons: string[] }) {
  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lightbulb size={32} className="mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No key lessons recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {i + 1}
          </div>
          <p className="text-sm leading-relaxed text-card-foreground">
            {lesson}
          </p>
        </div>
      ))}
    </div>
  );
}

function AITab({
  discussion,
  bookId,
}: {
  discussion: string | null;
  bookId: string;
}) {
  if (!discussion) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles size={32} className="mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Start an AI-powered discussion about this book
        </p>
        <Link
          href={`/chat?bookId=${bookId}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <MessageSquare size={14} />
          Discuss with AI
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-medium text-primary mb-4">
        <Sparkles size={14} />
        AI Discussion Summary
      </div>
      <div className="prose prose-sm prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
          {discussion}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href={`/chat?bookId=${bookId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <MessageSquare size={12} />
          Continue discussion
        </Link>
      </div>
    </div>
  );
}
