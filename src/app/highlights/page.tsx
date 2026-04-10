import { getBooks } from "@/lib/actions/books";
import { getEntriesForBook } from "@/lib/actions/entries";
import {
  Quote,
  Lightbulb,
  BookOpen,
  Layers,
  Users,
  Link2,
  Flame,
  Sparkles,
  Star,
} from "lucide-react";

interface QuoteItem {
  text: string;
  book: string;
  author: string;
  bookId: string;
}

interface LessonItem {
  text: string;
  book: string;
  bookId: string;
}

interface ThemeItem {
  name: string;
  books: string[];
}

interface CharacterItem {
  name: string;
  book: string;
  bookId: string;
}

interface EntryRecap {
  id: string;
  title: string;
  bookTitle: string;
  bookId: string;
  author: string;
  thoughts: string;
  chapterRange: string | null;
  themes: string[];
  characters: string[];
  quotes: string[];
  lessons: string[];
}

export default async function HighlightsPage() {
  const allBooks = await getBooks();

  // Collect everything from books and their journal entries
  const allQuotes: QuoteItem[] = [];
  const allLessons: LessonItem[] = [];
  const themeMap = new Map<string, Set<string>>();
  const allCharacters: CharacterItem[] = [];
  const allRecaps: EntryRecap[] = [];

  for (const book of allBooks) {
    // Book-level quotes and lessons
    const bookQuotes = book.favoriteQuotes ?? [];
    for (const q of bookQuotes) {
      if (q) allQuotes.push({ text: q, book: book.title, author: book.author, bookId: book.id });
    }
    const bookLessons = book.keyLessons ?? [];
    for (const l of bookLessons) {
      if (l) allLessons.push({ text: l, book: book.title, bookId: book.id });
    }

    // Journal entries
    const entries = await getEntriesForBook(book.id);
    for (const entry of entries) {
      // Entry quotes
      const entryQuotes = entry.favoriteQuotes ?? [];
      for (const q of entryQuotes) {
        if (q && !allQuotes.some((aq) => aq.text === q)) {
          allQuotes.push({ text: q, book: book.title, author: book.author, bookId: book.id });
        }
      }
      // Entry lessons
      const entryLessons = entry.keyLessons ?? [];
      for (const l of entryLessons) {
        if (l && !allLessons.some((al) => al.text === l)) {
          allLessons.push({ text: l, book: book.title, bookId: book.id });
        }
      }
      // Themes
      const entryThemes = entry.themesAndIdeas ?? [];
      for (const t of entryThemes) {
        if (t) {
          if (!themeMap.has(t)) themeMap.set(t, new Set());
          themeMap.get(t)!.add(book.title);
        }
      }
      // Characters
      const entryChars = entry.characters ?? [];
      for (const c of entryChars) {
        if (c && !allCharacters.some((ac) => ac.name === c && ac.bookId === book.id)) {
          allCharacters.push({ name: c, book: book.title, bookId: book.id });
        }
      }
      // Recap
      if (entry.thoughts) {
        allRecaps.push({
          id: entry.id,
          title: entry.title,
          bookTitle: book.title,
          bookId: book.id,
          author: book.author,
          thoughts: entry.thoughts,
          chapterRange: entry.chapterRange,
          themes: entry.themesAndIdeas ?? [],
          characters: entry.characters ?? [],
          quotes: entry.favoriteQuotes ?? [],
          lessons: entry.keyLessons ?? [],
        });
      }
    }
  }

  const themes: ThemeItem[] = Array.from(themeMap.entries())
    .map(([name, booksSet]) => ({ name, books: Array.from(booksSet) }))
    .sort((a, b) => b.books.length - a.books.length);

  const booksWithContent = allBooks.filter(
    (b) =>
      (b.favoriteQuotes ?? []).length > 0 ||
      (b.keyLessons ?? []).length > 0
  );

  return (
    <div className="space-y-14">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="animate-in animate-in-1">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="label-caps text-primary">Highlights & Insights</p>
        </div>
        <h1 className="hero-title text-3xl">
          The Best of Your<br />Reading Journey
        </h1>
        <p className="quote-text text-muted-foreground text-base mt-3 max-w-2xl">
          Every quote that stopped you mid-page. Every lesson that changed how you
          think. Every theme that threads through the stories you love.
        </p>
      </div>

      {/* ── SUMMARY STATS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in animate-in-2">
        <div className="hero-stat">
          <Quote className="h-4 w-4 text-primary mb-1" />
          <span className="stat-value text-2xl">{allQuotes.length}</span>
          <span className="label-caps mt-1">Quotes</span>
        </div>
        <div className="hero-stat">
          <Lightbulb className="h-4 w-4 text-amber-400 mb-1" />
          <span className="stat-value text-2xl">{allLessons.length}</span>
          <span className="label-caps mt-1">Lessons</span>
        </div>
        <div className="hero-stat">
          <Layers className="h-4 w-4 text-violet-400 mb-1" />
          <span className="stat-value text-2xl">{themes.length}</span>
          <span className="label-caps mt-1">Themes</span>
        </div>
        <div className="hero-stat">
          <Users className="h-4 w-4 text-cyan-400 mb-1" />
          <span className="stat-value text-2xl">{allCharacters.length}</span>
          <span className="label-caps mt-1">Characters</span>
        </div>
      </div>

      {/* ── FEATURED QUOTES ────────────────────────────────── */}
      {allQuotes.length > 0 && (
        <section className="animate-in animate-in-3">
          <div className="section-divider mb-8">
            <span className="label-caps flex items-center gap-2">
              <Quote className="h-3 w-3" /> Favorite Quotes
            </span>
          </div>

          {/* Hero quote */}
          <div className="featured-quote mb-6">
            <p>{allQuotes[0].text}</p>
            <p className="mt-4 text-sm not-italic font-medium text-primary">
              &mdash; {allQuotes[0].book}
              <span className="text-muted-foreground font-normal">
                {" "}by {allQuotes[0].author}
              </span>
            </p>
          </div>

          {/* Quote grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allQuotes.slice(1).map((q, i) => (
              <a
                key={i}
                href={`/books/${q.bookId}`}
                className="quote-card rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition-all group"
              >
                <p className="quote-text text-sm leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-6 w-4 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center book-spine">
                    <BookOpen className="h-3 w-3 text-primary/50" />
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    {q.book}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── THEMES & IDEAS ─────────────────────────────────── */}
      {themes.length > 0 && (
        <section className="animate-in animate-in-4">
          <div className="section-divider mb-8">
            <span className="label-caps flex items-center gap-2">
              <Layers className="h-3 w-3" /> Recurring Themes
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {themes.map((theme) => (
              <div key={theme.name} className="theme-pill">
                <Flame className="h-3.5 w-3.5 text-primary/60" />
                <span>{theme.name}</span>
                {theme.books.length > 1 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({theme.books.length} books)
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── KEY LESSONS ────────────────────────────────────── */}
      {allLessons.length > 0 && (
        <section className="animate-in animate-in-5">
          <div className="section-divider mb-8">
            <span className="label-caps flex items-center gap-2">
              <Lightbulb className="h-3 w-3" /> Key Lessons
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allLessons.map((item, i) => (
              <a
                key={i}
                href={`/books/${item.bookId}`}
                className="insight-card flex items-start gap-4 group"
              >
                <div className="lesson-number shrink-0">{i + 1}</div>
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed group-hover:text-foreground transition-colors">
                    {item.text}
                  </p>
                  <p className="label-caps mt-2 text-primary/60">
                    {item.book}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── CHARACTERS ─────────────────────────────────────── */}
      {allCharacters.length > 0 && (
        <section className="animate-in animate-in-6">
          <div className="section-divider mb-8">
            <span className="label-caps flex items-center gap-2">
              <Users className="h-3 w-3" /> Characters & Key Figures
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {allCharacters.map((char, i) => (
              <a
                key={i}
                href={`/books/${char.bookId}`}
                className="theme-pill group"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[10px] font-bold text-primary/80">
                  {char.name[0]}
                </div>
                <span className="group-hover:text-primary transition-colors">
                  {char.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {char.book}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── JOURNAL RECAPS ─────────────────────────────────── */}
      {allRecaps.length > 0 && (
        <section className="animate-in animate-in-7">
          <div className="section-divider mb-8">
            <span className="label-caps flex items-center gap-2">
              <BookOpen className="h-3 w-3" /> Journal Recaps
            </span>
          </div>
          <div className="space-y-6">
            {allRecaps.map((recap) => (
              <a
                key={recap.id}
                href={`/books/${recap.bookId}`}
                className="block insight-card group"
              >
                <div className="flex items-start gap-4">
                  <div className="book-spine-accent" />
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div>
                      <h3 className="text-base not-italic font-medium group-hover:text-primary transition-colors">
                        {recap.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {recap.bookTitle} by {recap.author}
                        {recap.chapterRange && (
                          <span className="ml-2 text-primary/50">
                            Ch. {recap.chapterRange}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Thoughts excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {recap.thoughts}
                    </p>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {recap.themes.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                        >
                          <Layers className="h-2.5 w-2.5" />
                          {t}
                        </span>
                      ))}
                      {recap.quotes.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          <Quote className="h-2.5 w-2.5" />
                          {recap.quotes.length} quotes
                        </span>
                      )}
                      {recap.lessons.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          <Lightbulb className="h-2.5 w-2.5" />
                          {recap.lessons.length} lessons
                        </span>
                      )}
                      {recap.characters.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          <Users className="h-2.5 w-2.5" />
                          {recap.characters.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────── */}
      {allQuotes.length === 0 && allLessons.length === 0 && allRecaps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center animate-in animate-in-3">
          <div className="ambient-ring inline-flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg mt-8 not-italic">No highlights yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Start adding quotes, lessons, and journal entries to your books.
            Your best insights will appear here.
          </p>
          <a
            href="/books"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
          >
            Go to Library
          </a>
        </div>
      )}
    </div>
  );
}
