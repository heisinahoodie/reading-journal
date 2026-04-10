"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  FileUp,
  Hash,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  Quote,
  Sparkles,
  MapPin,
  BookOpenCheck,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { cn, formatDate, getProgressPercent } from "@/lib/utils";
import { updateBook } from "@/lib/actions/books";
import { deleteEntry } from "@/lib/actions/entries";
import {
  READING_STATUSES,
  STATUS_LABELS,
  READING_MOODS,
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
  pdfPath: string | null;
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

const GENRE_CLASS: Record<string, string> = {
  Fiction: "genre-fiction",
  "Non-fiction": "genre-non-fiction",
  Philosophy: "genre-philosophy",
  Classics: "genre-classics",
  "Russian Literature": "genre-russian",
  Mystery: "genre-mystery",
  "Science Fiction": "genre-sci-fi",
  Biography: "genre-biography",
  History: "genre-history",
  Poetry: "genre-poetry",
  Fantasy: "genre-fantasy",
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
  const [coverUrl, setCoverUrl] = useState(book.coverImageUrl);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const progress = getProgressPercent(book.currentPage, book.totalPages);
  const moodEntry = READING_MOODS.find((m) => m.value === book.readingMood);

  // Auto-fetch cover from Open Library if we don't have one
  useEffect(() => {
    if (!coverUrl) {
      fetch(`/api/covers?bookId=${book.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.coverUrl) setCoverUrl(data.coverUrl);
        })
        .catch(() => {});
    }
  }, [book.id, coverUrl]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookId", book.id);
    formData.append("type", "cover");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setCoverUrl(data.url || `/api/files/covers/${file.name}`);
        router.refresh();
      }
    } finally {
      setUploadingCover(false);
    }
  }

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
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary animate-in animate-in-1"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Library
      </Link>

      {/* Hero section */}
      <div className="flex gap-8 animate-in animate-in-2">
        {/* Cover */}
        <div className="relative group flex h-64 w-44 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 book-hero-cover book-spine">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <BookOpen size={36} className="text-primary/40" />
              <span className="label-caps">No Cover</span>
            </div>
          )}
          {/* Cover upload overlay */}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {uploadingCover ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Book info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="space-y-4">
            {/* Title + AI badge */}
            <div className="flex items-start gap-3">
              <h1 className="leading-tight">
                {book.title}
              </h1>
              {book.aiRecommended && (
                <span className="mt-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                  <Sparkles size={12} />
                  AI Pick
                </span>
              )}
            </div>

            {/* Author */}
            <p className="text-lg text-muted-foreground quote-text">
              by{" "}
              <span className="text-foreground">{book.author || "Unknown"}</span>
            </p>

            {/* Genres */}
            {(book.genres ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(book.genres ?? []).map((genre) => (
                  <span
                    key={genre}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      GENRE_CLASS[genre] ?? "bg-secondary text-muted-foreground"
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
            <p className="mt-2 label-caps">
              ISBN: {book.isbn}
            </p>
          )}
        </div>
      </div>

      {/* Editable properties grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 animate-in animate-in-3">
        {/* Status */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="label-caps mb-2">Status</p>
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
          <p className="label-caps mb-2">Progress</p>
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
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full progress-glow transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 label-caps">{progress}% complete</p>
            </div>
          )}
        </div>

        {/* Mood */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="label-caps mb-2">Mood</p>
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
          <p className="label-caps mb-2">Started</p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            {book.startDate ? formatDate(book.startDate) : "Not started"}
          </div>
        </div>

        {/* Finish Date */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="label-caps mb-2">Finished</p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            {book.finishDate ? formatDate(book.finishDate) : "\u2014"}
          </div>
        </div>

        {/* Place */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="label-caps mb-2">Place</p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin size={14} className="text-muted-foreground" />
            {book.place || "\u2014"}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 animate-in animate-in-4">
        <Link
          href={`/chat?bookId=${book.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
        >
          <MessageSquare size={16} />
          Discuss with AI
        </Link>
        <Link
          href={`/books/${book.id}/entries/new`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
        >
          <Plus size={16} />
          Add Entry
        </Link>
        <Link
          href={`/books/${book.id}/reader`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
        >
          <BookOpenCheck size={16} />
          {book.pdfPath ? "Read PDF" : "Upload PDF"}
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-border animate-in animate-in-5">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative",
                  activeTab === tab.key
                    ? "text-primary tab-active"
                    : "text-muted-foreground hover:text-foreground"
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
      <div className="min-h-[200px] animate-fade">
        {activeTab === "entries" && (
          <EntriesTab entries={entries} bookId={book.id} onEntryDeleted={() => router.refresh()} />
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

/* ═══════════════════════════════════════════════════════════
   Tab Components
   ═══════════════════════════════════════════════════════════ */

function EntriesTab({
  entries,
  bookId,
  onEntryDeleted,
}: {
  entries: Entry[];
  bookId: string;
  onEntryDeleted: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent, entryId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this journal entry? This cannot be undone.")) return;
    setDeletingId(entryId);
    try {
      await deleteEntry(entryId);
      onEntryDeleted();
    } finally {
      setDeletingId(null);
    }
  }
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="ambient-ring inline-flex items-center justify-center">
          <FileText size={32} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          No journal entries yet
        </p>
        <Link
          href={`/books/${bookId}/entries/new`}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground btn-glow"
        >
          <Plus size={14} />
          Write your first entry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <Link
          key={entry.id}
          href={`/books/${bookId}/entries/${entry.id}`}
          className={`group block rounded-xl border border-border bg-card p-5 card-hover animate-in animate-in-${Math.min(i + 1, 8)}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-card-foreground not-italic">
                {entry.title}
              </h3>
              {entry.chapterRange && (
                <p className="mt-0.5 flex items-center gap-1.5 label-caps">
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
            <div className="flex shrink-0 items-center gap-3">
              <span className="flex items-center gap-1.5 label-caps">
                <Clock size={12} />
                {formatDate(entry.createdAt)}
              </span>
              <button
                onClick={(e) => handleDelete(e, entry.id)}
                disabled={deletingId === entry.id}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Tags summary */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(entry.keyLessons ?? []).length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/15">
                <Lightbulb size={10} />
                {(entry.keyLessons ?? []).length} lessons
              </span>
            )}
            {(entry.favoriteQuotes ?? []).length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/15">
                <Quote size={10} />
                {(entry.favoriteQuotes ?? []).length} quotes
              </span>
            )}
            {(entry.themesAndIdeas ?? []).length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 border border-violet-500/15">
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="ambient-ring inline-flex items-center justify-center">
          <Quote size={32} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          No favorite quotes saved yet
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2">
      {quotes.map((quote, i) => (
        <div
          key={i}
          className="mb-5 break-inside-avoid rounded-xl border border-border bg-card p-6 quote-card"
        >
          <p className="quote-text text-sm text-card-foreground">
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="ambient-ring inline-flex items-center justify-center">
          <Lightbulb size={32} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground mt-8">
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
          className="flex gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="lesson-number shrink-0">
            {i + 1}
          </div>
          <p className="text-sm leading-relaxed text-card-foreground pt-0.5">
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="ambient-ring inline-flex items-center justify-center">
          <Sparkles size={32} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          Start an AI-powered discussion about this book
        </p>
        <Link
          href={`/chat?bookId=${bookId}`}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground btn-glow"
        >
          <MessageSquare size={14} />
          Discuss with AI
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 label-caps text-primary mb-4">
        <Sparkles size={14} />
        AI Discussion Summary
      </div>
      <div className="prose prose-sm prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
          {discussion}
        </p>
      </div>
      <div className="mt-5 pt-4 border-t border-border">
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
