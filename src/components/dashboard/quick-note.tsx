"use client";

import { useState, useRef } from "react";
import { createEntry } from "@/lib/actions/entries";
import { useRouter } from "next/navigation";
import { PenLine, Send, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
}

export function QuickNote({ books }: { books: Book[] }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(
    books.length > 0 ? books[0] : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    if (!note.trim() || !selectedBook) return;
    setSaving(true);
    try {
      const now = new Date();
      const title = `Quick note — ${now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
      await createEntry({
        bookId: selectedBook.id,
        title,
        thoughts: note.trim(),
      });
      setNote("");
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.refresh();
      }, 1500);
    } finally {
      setSaving(false);
    }
  }

  if (books.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <PenLine className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold not-italic">Quick Note</h3>
      </div>

      {/* Book picker */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left rounded-lg border border-border px-3 py-2 bg-background"
        >
          <span className="flex-1 truncate">
            {selectedBook ? (
              <>
                <span className="text-foreground font-medium">
                  {selectedBook.title}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  by {selectedBook.author}
                </span>
              </>
            ) : (
              "Select a book..."
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              showPicker && "rotate-180"
            )}
          />
        </button>
        {showPicker && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 max-h-48 overflow-auto rounded-lg border border-border bg-card shadow-xl">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => {
                  setSelectedBook(book);
                  setShowPicker(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2",
                  selectedBook?.id === book.id && "bg-primary/10 text-primary"
                )}
              >
                <span className="flex-1 truncate">{book.title}</span>
                {selectedBook?.id === book.id && (
                  <Check className="h-3 w-3 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note input */}
      <textarea
        ref={textareaRef}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot down a thought, quote, or reaction..."
        rows={3}
        className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      {/* Submit */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/50">
          Ctrl+Enter to save
        </span>
        <button
          onClick={handleSubmit}
          disabled={!note.trim() || !selectedBook || saving}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all disabled:opacity-40",
            saved
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved!
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Save Note
            </>
          )}
        </button>
      </div>
    </div>
  );
}
