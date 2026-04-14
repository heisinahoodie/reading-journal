"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Library,
  Plus,
  X,
  Pencil,
  Trash2,
  Check,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createShelf,
  updateShelf,
  deleteShelf,
  addBookToShelf,
  removeBookFromShelf,
} from "@/lib/actions/shelves";

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

interface CustomShelf {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number | null;
  createdAt: string;
  books: Book[];
}

/* ------------------------------------------------------------------ */
/*  Cover gradients                                                    */
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
/*  Shelf accent colors per genre                                      */
/* ------------------------------------------------------------------ */

const shelfColors: Record<string, string> = {
  fantasy: "#f59e0b",
  "sci-fi": "#06b6d4",
  "science fiction": "#06b6d4",
  fiction: "#8b5cf6",
  philosophy: "#a78bfa",
  theology: "#f472b6",
  "church history": "#fb923c",
  history: "#eab308",
  biography: "#f97316",
  classics: "#c9982e",
  mystery: "#64748b",
  "non-fiction": "#10b981",
  poetry: "#ec4899",
  religion: "#f472b6",
  russian: "#ef4444",
};

function getShelfColor(genre: string): string {
  return shelfColors[genre.toLowerCase()] || "#c9982e";
}

/* ------------------------------------------------------------------ */
/*  Color picker options                                               */
/* ------------------------------------------------------------------ */

const colorOptions = [
  "#c9982e", "#f59e0b", "#ef4444", "#f472b6", "#a78bfa",
  "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#4ade80",
  "#64748b", "#fb923c",
];

/* ------------------------------------------------------------------ */
/*  Book cover component                                               */
/* ------------------------------------------------------------------ */

function ShelfBook({
  book,
  onRemove,
}: {
  book: Book;
  onRemove?: () => void;
}) {
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
    <div className="group/book shrink-0 relative">
      <Link
        href={`/books/${book.id}`}
        className="block transition-transform duration-200 hover:scale-105 hover:-translate-y-1"
        title={`${book.title} by ${book.author}`}
      >
        <div
          className={cn(
            "relative w-[120px] h-[180px] rounded-lg overflow-hidden shadow-lg",
            "bg-gradient-to-br",
            gradient
          )}
        >
          {showCover ? (
            <Image
              src={coverUrl}
              alt={book.title}
              fill
              className="object-cover"
              sizes="120px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xl font-bold text-white/70 select-none tracking-widest"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                {initials}
              </span>
              <div className="absolute inset-y-0 left-2 w-px bg-white/10" />
              <div className="absolute inset-y-0 left-3 w-px bg-white/5" />
            </div>
          )}

          {/* Hover shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover/book:from-white/10 group-hover/book:via-transparent group-hover/book:to-transparent transition-all duration-300" />

          {/* Progress bar for reading books */}
          {book.status === "reading" && book.currentPage && book.totalPages && (
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <div
                className="h-full progress-glow"
                style={{
                  width: `${Math.round((book.currentPage / book.totalPages) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="w-[120px] mt-2 px-0.5">
          <p className="text-xs font-medium leading-tight line-clamp-2 text-foreground group-hover/book:text-primary transition-colors">
            {book.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {book.author}
          </p>
        </div>
      </Link>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/book:opacity-100 transition-opacity z-20 shadow-md"
          title="Remove from shelf"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add books dialog                                                   */
/* ------------------------------------------------------------------ */

function AddBooksDialog({
  allBooks,
  shelfBookIds,
  onAdd,
  onClose,
}: {
  allBooks: Book[];
  shelfBookIds: Set<string>;
  onAdd: (bookId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const filtered = allBooks.filter(
    (b) =>
      !shelfBookIds.has(b.id) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-backdrop">
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 animate-in animate-in-1"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Add Books to Shelf</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full rounded-lg bg-background border border-border pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50"
            autoFocus
          />
        </div>

        {/* Book list */}
        <div className="max-h-72 overflow-y-auto space-y-1">
          {filtered.map((book) => (
            <button
              key={book.id}
              onClick={() => onAdd(book.id)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {book.author}
                </p>
              </div>
              <Plus className="h-4 w-4 shrink-0 text-primary" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {search ? "No matching books found" : "All books are already on this shelf"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single shelf row                                                   */
/* ------------------------------------------------------------------ */

function ShelfRow({
  genre,
  books: shelfBooks,
  index,
  accentColor,
  isCustom,
  shelfId,
  allBooks,
  onRefresh,
}: {
  genre: string;
  books: Book[];
  index: number;
  accentColor: string;
  isCustom: boolean;
  shelfId?: string;
  allBooks: Book[];
  onRefresh: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(genre);
  const [editColor, setEditColor] = useState(accentColor);
  const [showAddBooks, setShowAddBooks] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState);
      return () => el.removeEventListener("scroll", updateScrollState);
    }
  }, [shelfBooks]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  async function handleSaveEdit() {
    if (!shelfId) return;
    await updateShelf(shelfId, { name: editName, color: editColor });
    setIsEditing(false);
    onRefresh();
  }

  async function handleDelete() {
    if (!shelfId) return;
    if (!confirm(`Delete shelf "${genre}"? Books won't be deleted.`)) return;
    await deleteShelf(shelfId);
    onRefresh();
  }

  async function handleAddBook(bookId: string) {
    if (!shelfId) return;
    await addBookToShelf(shelfId, bookId);
    onRefresh();
  }

  async function handleRemoveBook(bookId: string) {
    if (!shelfId) return;
    await removeBookFromShelf(shelfId, bookId);
    onRefresh();
  }

  const shelfBookIds = new Set(shelfBooks.map((b) => b.id));

  return (
    <div
      className={`animate-in animate-in-${Math.min(index + 2, 8)}`}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Shelf header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full"
              style={{ background: accentColor }}
            />
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-md bg-background border border-border px-2 py-1 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-primary/50"
                  style={{ color: editColor }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                />
                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-6 h-6 rounded-full border-2 border-border"
                    style={{ background: editColor }}
                  />
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 z-50 flex flex-wrap gap-1 p-2 rounded-lg border border-border bg-popover shadow-xl w-32">
                      {colorOptions.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setEditColor(c);
                            setShowColorPicker(false);
                          }}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                            editColor === c
                              ? "border-foreground scale-110"
                              : "border-transparent"
                          )}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="p-1 rounded-md hover:bg-accent text-primary"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <h3
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                {genre}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Library className="h-3 w-3" />
              {shelfBooks.length}
            </span>

            {/* Custom shelf actions */}
            {isCustom && !isEditing && (
              <>
                <button
                  onClick={() => setShowAddBooks(true)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                  title="Add books"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit shelf"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete shelf"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* Scroll arrows */}
            <div className="flex gap-1 ml-1">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="p-1 rounded-md hover:bg-accent transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="p-1 rounded-md hover:bg-accent transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable book row */}
        <div className="relative">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-5 py-5 scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {shelfBooks.map((book) => (
              <ShelfBook
                key={book.id}
                book={book}
                onRemove={
                  isCustom ? () => handleRemoveBook(book.id) : undefined
                }
              />
            ))}

            {/* Add book placeholder for custom shelves */}
            {isCustom && (
              <button
                onClick={() => setShowAddBooks(true)}
                className="shrink-0 w-[120px] h-[180px] rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-colors group/add"
              >
                <Plus className="h-6 w-6 text-muted-foreground/40 group-hover/add:text-primary transition-colors" />
                <span className="text-[10px] text-muted-foreground/40 group-hover/add:text-muted-foreground transition-colors">
                  Add book
                </span>
              </button>
            )}

            {shelfBooks.length === 0 && !isCustom && (
              <p className="text-sm text-muted-foreground py-8">
                No books in this shelf yet.
              </p>
            )}
          </div>

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
          )}

          {/* Shelf accent line */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}33, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Add books dialog */}
      {showAddBooks && shelfId && (
        <AddBooksDialog
          allBooks={allBooks}
          shelfBookIds={shelfBookIds}
          onAdd={handleAddBook}
          onClose={() => setShowAddBooks(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create shelf dialog                                                */
/* ------------------------------------------------------------------ */

function CreateShelfDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#c9982e");
  const [creating, setCreating] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    await createShelf(name.trim(), color);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-backdrop">
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 animate-in animate-in-1"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Create New Shelf</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-caps block mb-1.5">Shelf Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Favorites, Dark Fantasy, Must Re-read..."
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>

          <div>
            <label className="label-caps block mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Create Shelf
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main shelves component                                             */
/* ------------------------------------------------------------------ */

export function ShelvesClient({
  books,
  customShelves: initialCustomShelves,
}: {
  books: Book[];
  customShelves: CustomShelf[];
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"custom" | "genre" | "status">(
    initialCustomShelves.length > 0 ? "custom" : "genre"
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  function handleRefresh() {
    router.refresh();
  }

  // Genre shelves
  const genreMap = new Map<string, Book[]>();
  for (const book of books) {
    const genres =
      book.genres && book.genres.length > 0 ? book.genres : ["Uncategorized"];
    for (const genre of genres) {
      const normalized = genre.charAt(0).toUpperCase() + genre.slice(1);
      if (!genreMap.has(normalized)) {
        genreMap.set(normalized, []);
      }
      genreMap.get(normalized)!.push(book);
    }
  }
  const genreShelves = Array.from(genreMap.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  // Status shelves
  const statusShelves = [
    { label: "Currently Reading", books: books.filter((b) => b.status === "reading") },
    { label: "Finished", books: books.filter((b) => b.status === "finished") },
    { label: "To Read", books: books.filter((b) => b.status === "to-read") },
  ].filter((s) => s.books.length > 0);

  return (
    <div className="space-y-4">
      {/* View toggle + Create button */}
      <div className="flex items-center justify-between animate-in animate-in-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("custom")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              viewMode === "custom"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            My Shelves
          </button>
          <button
            onClick={() => setViewMode("genre")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              viewMode === "genre"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            By Genre
          </button>
          <button
            onClick={() => setViewMode("status")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              viewMode === "status"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            By Status
          </button>
        </div>

        {viewMode === "custom" && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-glow"
          >
            <Plus className="h-4 w-4" />
            New Shelf
          </button>
        )}
      </div>

      {/* Shelves */}
      <div className="space-y-5">
        {viewMode === "custom" && (
          <>
            {initialCustomShelves.map((shelf, i) => (
              <ShelfRow
                key={shelf.id}
                genre={shelf.name}
                books={shelf.books}
                index={i}
                accentColor={shelf.color || "#c9982e"}
                isCustom={true}
                shelfId={shelf.id}
                allBooks={books}
                onRefresh={handleRefresh}
              />
            ))}
            {initialCustomShelves.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center animate-in animate-in-3">
                <div className="ambient-ring inline-flex items-center justify-center">
                  <Library className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg mt-8">No custom shelves yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                  Create shelves to organize your books however you want — by mood, favorites, series, or anything else.
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
                >
                  <Plus className="h-4 w-4" />
                  Create your first shelf
                </button>
              </div>
            )}
          </>
        )}

        {viewMode === "genre" &&
          genreShelves.map(([genre, bks], i) => (
            <ShelfRow
              key={genre}
              genre={genre}
              books={bks}
              index={i}
              accentColor={getShelfColor(genre)}
              isCustom={false}
              allBooks={books}
              onRefresh={handleRefresh}
            />
          ))}

        {viewMode === "status" &&
          statusShelves.map((shelf, i) => (
            <ShelfRow
              key={shelf.label}
              genre={shelf.label}
              books={shelf.books}
              index={i}
              accentColor={getShelfColor(shelf.label)}
              isCustom={false}
              allBooks={books}
              onRefresh={handleRefresh}
            />
          ))}
      </div>

      {/* Empty state for all books */}
      {books.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center animate-in animate-in-3">
          <div className="ambient-ring inline-flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg mt-8">No books yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Add books to your library and they&apos;ll appear on shelves.
          </p>
          <Link
            href="/books"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
          >
            <Plus className="h-4 w-4" />
            Add your first book
          </Link>
        </div>
      )}

      {/* Create shelf dialog */}
      {showCreateDialog && (
        <CreateShelfDialog
          onClose={() => setShowCreateDialog(false)}
          onCreated={handleRefresh}
        />
      )}
    </div>
  );
}
