"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createEntry, updateEntry } from "@/lib/actions/entries";
import {
  Save,
  Plus,
  Trash2,
  BookOpen,
  Lightbulb,
  Quote,
  Puzzle,
  Users,
  Link2,
} from "lucide-react";

interface EntryData {
  id: string;
  bookId: string;
  title: string;
  chapterRange: string | null;
  thoughts: string | null;
  keyLessons: string[];
  favoriteQuotes: string[];
  themesAndIdeas: string[];
  characters: string[];
  connections: string[];
  createdAt: string;
  updatedAt: string;
}

export function EntryEditor({
  bookId,
  entry,
}: {
  bookId: string;
  entry?: EntryData;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(entry?.title || "");
  const [chapterRange, setChapterRange] = useState(entry?.chapterRange || "");
  const [thoughts, setThoughts] = useState(entry?.thoughts || "");
  const [keyLessons, setKeyLessons] = useState<string[]>(
    entry?.keyLessons || [""]
  );
  const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>(
    entry?.favoriteQuotes || [""]
  );
  const [themesAndIdeas, setThemesAndIdeas] = useState<string[]>(
    entry?.themesAndIdeas || [""]
  );
  const [characters, setCharacters] = useState<string[]>(
    entry?.characters || [""]
  );
  const [connections, setConnections] = useState<string[]>(
    entry?.connections || [""]
  );

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        chapterRange: chapterRange.trim() || undefined,
        thoughts: thoughts.trim() || undefined,
        keyLessons: keyLessons.filter((l) => l.trim()),
        favoriteQuotes: favoriteQuotes.filter((q) => q.trim()),
        themesAndIdeas: themesAndIdeas.filter((t) => t.trim()),
        characters: characters.filter((c) => c.trim()),
        connections: connections.filter((c) => c.trim()),
      };

      if (entry) {
        await updateEntry(entry.id, data);
      } else {
        const id = await createEntry({ bookId, ...data });
        router.push(`/books/${bookId}/entries/${id}`);
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [
    title,
    chapterRange,
    thoughts,
    keyLessons,
    favoriteQuotes,
    themesAndIdeas,
    characters,
    connections,
    entry,
    bookId,
    router,
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Chapter */}
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title (e.g., Entry 1 — Chapters 1–10)"
          className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Chapters:</label>
          <input
            type="text"
            value={chapterRange}
            onChange={(e) => setChapterRange(e.target.value)}
            placeholder="e.g., 1-10"
            className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm w-32"
          />
        </div>
      </div>

      {/* Thoughts */}
      <Section icon={<BookOpen className="h-4 w-4" />} title="Thoughts">
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="What are your thoughts, reactions, and feelings about these chapters?"
          rows={8}
          className="w-full rounded-lg bg-card border border-border p-4 text-sm leading-relaxed resize-y placeholder:text-muted-foreground/50"
        />
      </Section>

      {/* Key Lessons */}
      <Section icon={<Lightbulb className="h-4 w-4" />} title="Key Lessons">
        <ListEditor
          items={keyLessons}
          onChange={setKeyLessons}
          placeholder="What did you learn?"
        />
      </Section>

      {/* Favorite Quotes */}
      <Section icon={<Quote className="h-4 w-4" />} title="Favorite Quotes">
        <ListEditor
          items={favoriteQuotes}
          onChange={setFavoriteQuotes}
          placeholder="Paste a favorite line or passage"
        />
      </Section>

      {/* Themes & Ideas */}
      <Section icon={<Puzzle className="h-4 w-4" />} title="Themes & Ideas">
        <ListEditor
          items={themesAndIdeas}
          onChange={setThemesAndIdeas}
          placeholder="What themes or concepts stood out?"
        />
      </Section>

      {/* Characters / Key Figures */}
      <Section
        icon={<Users className="h-4 w-4" />}
        title="Characters / Key Figures"
      >
        <ListEditor
          items={characters}
          onChange={setCharacters}
          placeholder="Who are the important characters?"
        />
      </Section>

      {/* Connections */}
      <Section
        icon={<Link2 className="h-4 w-4" />}
        title="Connections to Other Books"
      >
        <ListEditor
          items={connections}
          onChange={setConnections}
          placeholder="Does this remind you of another book?"
        />
      </Section>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : entry ? "Update Entry" : "Create Entry"}
        </button>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      onChange([""]);
    } else {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-muted-foreground mt-2.5 text-sm">-</span>
          <textarea
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            rows={1}
            className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-sm resize-y placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => removeItem(i)}
            className="mt-1.5 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add item
      </button>
    </div>
  );
}
