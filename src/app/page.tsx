import { getBooks } from "@/lib/actions/books";
import { getEntriesForBook } from "@/lib/actions/entries";
import { getAllEntries } from "@/lib/actions/entries";
import { cn } from "@/lib/utils";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  BookOpen,
  BookCheck,
  BookMarked,
  TrendingUp,
  Quote,
  Lightbulb,
  ArrowRight,
  Flame,
  CalendarDays,
  Target,
} from "lucide-react";
import { QuickNote } from "@/components/dashboard/quick-note";

export default async function Dashboard() {
  const allBooks = await getBooks();
  const reading = allBooks.filter((b) => b.status === "reading");
  const finished = allBooks.filter((b) => b.status === "finished");
  const toRead = allBooks.filter((b) => b.status === "to-read");
  const totalPages = allBooks.reduce((sum, b) => sum + (b.totalPages || 0), 0);

  // Gather all quotes and lessons from all books
  const allQuotes: { quote: string; book: string; author: string }[] = [];
  const allLessons: { lesson: string; book: string }[] = [];

  for (const book of allBooks) {
    const quotes = book.favoriteQuotes ?? [];
    for (const q of quotes) {
      if (q) allQuotes.push({ quote: q, book: book.title, author: book.author });
    }
    const lessons = book.keyLessons ?? [];
    for (const l of lessons) {
      if (l) allLessons.push({ lesson: l, book: book.title });
    }
  }

  // Calculate reading streak from journal entries + book activity
  const allEntries = await getAllEntries();
  const activityDates = new Set<string>();
  // Journal entries count as activity
  for (const entry of allEntries) {
    if (entry.createdAt) {
      activityDates.add(entry.createdAt.slice(0, 10)); // YYYY-MM-DD
    }
  }
  // Books with updatedAt also count (page progress updates)
  for (const book of allBooks) {
    if (book.status === "reading" && book.updatedAt) {
      activityDates.add(book.updatedAt.slice(0, 10));
    }
  }

  // Compute streak: consecutive days ending today or yesterday
  let streak = 0;
  const today = new Date();
  const checkDate = new Date(today);
  // Allow streak to start from today or yesterday
  if (!activityDates.has(checkDate.toISOString().slice(0, 10))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (activityDates.has(checkDate.toISOString().slice(0, 10))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Reading goal
  const db = getDb();
  const goalRow = db
    .select()
    .from(settings)
    .where(eq(settings.key, "yearly_reading_goal"))
    .all();
  const yearlyGoal = goalRow.length > 0 ? parseInt(goalRow[0].value) : 0;
  const currentYear = new Date().getFullYear().toString();
  const booksFinishedThisYear = finished.filter((b) => {
    const date = b.finishDate || b.updatedAt;
    return date && date.startsWith(currentYear);
  }).length;
  const goalProgress = yearlyGoal > 0 ? Math.min(booksFinishedThisYear / yearlyGoal, 1) : 0;

  // Daily resurface — rotate through quotes, lessons, and entries
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const featuredQuote = allQuotes.length > 0
    ? allQuotes[dayOfYear % allQuotes.length]
    : null;
  const featuredLesson = allLessons.length > 0
    ? allLessons[(dayOfYear + 7) % allLessons.length]
    : null;

  // Pull a journal thought snippet for resurface
  const allThoughts: { text: string; book: string; entry: string }[] = [];
  for (const book of allBooks) {
    const bookEntries = await getEntriesForBook(book.id);
    for (const e of bookEntries) {
      if (e.thoughts && e.thoughts.length > 40) {
        allThoughts.push({ text: e.thoughts, book: book.title, entry: e.title });
      }
    }
  }
  const featuredThought = allThoughts.length > 0
    ? allThoughts[(dayOfYear + 13) % allThoughts.length]
    : null;

  // Reading greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-12">
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="hero-section rounded-2xl px-2 py-8 relative">
        <div className="relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            {/* Left: Title + subtitle */}
            <div className="flex-1 space-y-6 animate-in animate-in-1">
              <div>
                <p className="label-caps mb-3 text-primary">{greeting}, reader</p>
                <h1 className="hero-title">
                  Your Reading<br />
                  Journal
                  <span className="cursor-blink" />
                </h1>
              </div>
              <p className="quote-text text-muted-foreground text-lg max-w-lg">
                {allBooks.length > 0
                  ? `Tracking ${allBooks.length} books across your literary journey — from philosophy to fantasy and everything in between.`
                  : "Begin your literary journey. Track books, capture thoughts, and discover new reads."}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/books"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Library
                </a>
                <a
                  href="/highlights"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
                >
                  <Lightbulb className="h-4 w-4" />
                  View Highlights
                </a>
              </div>
            </div>

            {/* Right: Floating book stack */}
            <div className="hidden lg:flex flex-col items-center gap-3 animate-in animate-in-3">
              {reading.slice(0, 2).map((book, i) => (
                <a
                  key={book.id}
                  href={`/books/${book.id}`}
                  className={`group relative rounded-xl border border-border bg-card p-4 w-64 card-hover ${
                    i === 0 ? "float-slow" : "float-medium"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-10 shrink-0 rounded-lg bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center book-spine">
                      <BookOpen className="h-5 w-5 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {book.author}
                      </p>
                      {book.totalPages && (
                        <div className="mt-2">
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full progress-glow transition-all"
                              style={{
                                width: `${Math.round(
                                  ((book.currentPage || 0) / book.totalPages) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="label-caps mt-2 text-primary/60">
                    Currently reading
                  </div>
                </a>
              ))}
              {reading.length === 0 && toRead.length > 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 w-64 text-center float-slow">
                  <BookMarked className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {toRead.length} books waiting
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hero-stat animate-in animate-in-2">
          <BookOpen className="h-5 w-5 text-blue-400 mb-2" />
          <span className="stat-value">{reading.length}</span>
          <span className="label-caps mt-1">Reading</span>
        </div>
        <div className="hero-stat animate-in animate-in-3">
          <BookCheck className="h-5 w-5 text-emerald-400 mb-2" />
          <span className="stat-value">{finished.length}</span>
          <span className="label-caps mt-1">Finished</span>
        </div>
        <div className="hero-stat animate-in animate-in-4">
          <BookMarked className="h-5 w-5 text-muted-foreground mb-2" />
          <span className="stat-value">{toRead.length}</span>
          <span className="label-caps mt-1">To Read</span>
        </div>
        {/* Streak card — gamified */}
        <div className={cn(
          "hero-stat animate-in animate-in-5 relative overflow-hidden",
          streak >= 7 && "border-orange-500/40",
          streak === 0 && "border-orange-500/10"
        )}>
          {streak >= 3 && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.10) 0%, transparent 70%)"
            }} />
          )}
          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Flame + count */}
            <div className="flex items-center gap-1 mb-0.5">
              <Flame className={cn(
                "h-6 w-6",
                streak >= 7 ? "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.7)] animate-pulse" :
                streak >= 3 ? "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]" :
                streak > 0 ? "text-orange-400/70" : "text-muted-foreground/25"
              )} />
              <span className={cn(
                "stat-value leading-none",
                streak >= 7 ? "text-orange-400" : streak > 0 ? "" : "text-muted-foreground/40"
              )}>{streak}</span>
            </div>
            <span className="label-caps mb-2">Day Streak</span>

            {/* Milestone badge */}
            {streak >= 30 && <span className="mb-2 text-[9px] font-bold text-orange-400 bg-orange-400/15 px-2 py-0.5 rounded-full border border-orange-400/25">🔥 On fire!</span>}
            {streak >= 14 && streak < 30 && <span className="mb-2 text-[9px] font-bold text-orange-400 bg-orange-400/15 px-2 py-0.5 rounded-full border border-orange-400/25">⚡ Amazing!</span>}
            {streak >= 7 && streak < 14 && <span className="mb-2 text-[9px] font-bold text-orange-300 bg-orange-400/10 px-2 py-0.5 rounded-full">🌟 One week!</span>}

            {/* Last 7 days dots */}
            <div className="flex gap-[5px]">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(today);
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().slice(0, 10);
                const isActive = activityDates.has(dateStr);
                const isToday = dateStr === today.toISOString().slice(0, 10);
                return (
                  <div
                    key={i}
                    title={dateStr}
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[8px]",
                      isActive
                        ? "shadow-[0_0_5px_rgba(251,146,60,0.5)]"
                        : isToday
                        ? "border border-dashed border-orange-400/50"
                        : ""
                    )}
                    style={{
                      background: isActive
                        ? "rgba(251,146,60,0.85)"
                        : isToday
                        ? "transparent"
                        : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {isActive && "🔥"}
                  </div>
                );
              })}
            </div>

            {/* Status message */}
            {streak > 0 && !activityDates.has(today.toISOString().slice(0, 10)) && (
              <p className="mt-1.5 text-[9px] text-orange-400 font-medium animate-pulse text-center">
                ⚠ Read today to keep it!
              </p>
            )}
            {streak > 0 && activityDates.has(today.toISOString().slice(0, 10)) && (
              <p className="mt-1.5 text-[9px] text-emerald-400 font-medium text-center">
                ✓ Active today
              </p>
            )}
            {streak === 0 && (
              <p className="mt-1.5 text-[9px] text-muted-foreground/50 text-center">
                Start today!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── STREAK + GOAL ROW ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in animate-in-6">
        {/* Streak heatmap */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-semibold not-italic">Reading Activity</h3>
            {streak >= 7 && (
              <span className="ml-auto text-[10px] font-medium text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                {streak >= 30 ? "On fire!" : streak >= 14 ? "Amazing!" : "Great streak!"}
              </span>
            )}
          </div>
          {/* 7-week heatmap grid */}
          <div className="flex gap-[3px]">
            {Array.from({ length: 7 }, (_, weekOffset) => (
              <div key={weekOffset} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, dayOffset) => {
                  const d = new Date(today);
                  d.setDate(d.getDate() - (6 - weekOffset) * 7 - (6 - dayOffset));
                  const dateStr = d.toISOString().slice(0, 10);
                  const isActive = activityDates.has(dateStr);
                  const isToday = dateStr === today.toISOString().slice(0, 10);
                  return (
                    <div
                      key={dayOffset}
                      className={cn(
                        "w-4 h-4 rounded-[3px] transition-colors",
                        isToday && "ring-1 ring-primary/40"
                      )}
                      style={{
                        background: isActive
                          ? "var(--primary)"
                          : "var(--muted)",
                        opacity: isActive ? 1 : 0.3,
                      }}
                      title={`${dateStr}${isActive ? " — active" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-muted-foreground">
              {activityDates.size} active days total
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="w-3 h-3 rounded-[2px]" style={{ background: "var(--muted)", opacity: 0.3 }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ background: "var(--primary)" }} />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Reading goal */}
        {yearlyGoal > 0 ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <svg width="90" height="90" viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - goalProgress)}`}
                    className="progress-ring-animate"
                    style={{ filter: "drop-shadow(0 0 6px var(--glow-primary))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {booksFinishedThisYear}
                  </span>
                  <span className="text-[9px] text-muted-foreground">of {yearlyGoal}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold not-italic">{currentYear} Goal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {booksFinishedThisYear >= yearlyGoal
                    ? "Goal reached! Keep going."
                    : `${yearlyGoal - booksFinishedThisYear} more to go`}
                </p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full progress-glow transition-all duration-1000" style={{ width: `${Math.round(goalProgress * 100)}%` }} />
                </div>
                <p className="label-caps mt-1.5 text-primary/70">{Math.round(goalProgress * 100)}% complete</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-5 flex flex-col items-center justify-center text-center">
            <Target className="h-6 w-6 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No reading goal set</p>
            <a href="/settings" className="text-xs text-primary hover:underline mt-1">Set a goal in Settings</a>
          </div>
        )}
      </div>

      {/* ── DAILY RESURFACE ───────────────────────────────── */}
      {(featuredQuote || featuredLesson || featuredThought) && (
        <section className="animate-in animate-in-6">
          <div className="section-divider mb-6">
            <span className="label-caps flex items-center gap-2">
              <Lightbulb className="h-3 w-3" /> Daily Resurface
            </span>
            <span className="label-caps text-muted-foreground/50 ml-auto">
              Revisit your past insights
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Featured Quote */}
            {featuredQuote && (
              <div className="featured-quote flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Quote className="h-3.5 w-3.5 text-primary/60" />
                    <span className="label-caps text-primary/60">Quote</span>
                  </div>
                  <p className="text-sm leading-relaxed">{featuredQuote.quote}</p>
                </div>
                <p className="mt-4 text-xs not-italic font-medium text-primary">
                  &mdash; {featuredQuote.book}
                  <span className="text-muted-foreground font-normal">
                    {" "}by {featuredQuote.author}
                  </span>
                </p>
              </div>
            )}
            {/* Featured Lesson */}
            {featuredLesson && (
              <div className="insight-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400/80" />
                    <span className="label-caps text-amber-400/80">Lesson</span>
                  </div>
                  <p className="text-sm leading-relaxed">{featuredLesson.lesson}</p>
                </div>
                <p className="mt-4 label-caps text-primary/60">
                  {featuredLesson.book}
                </p>
              </div>
            )}
            {/* Featured Thought */}
            {featuredThought && (
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <BookOpen className="h-3.5 w-3.5 text-violet-400/80" />
                    <span className="label-caps text-violet-400/80">Journal</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-5">
                    {featuredThought.text}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="label-caps text-primary/60">{featuredThought.entry}</p>
                  <p className="text-[10px] text-muted-foreground/50">{featuredThought.book}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CURRENTLY READING (mobile + detailed) ──────────── */}
      {reading.length > 0 && (
        <section className="animate-in animate-in-7">
          <div className="flex items-center justify-between mb-5">
            <h2>Currently Reading</h2>
            <a
              href="/board"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              View Board <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reading.map((book) => {
              const progress =
                book.currentPage && book.totalPages
                  ? Math.round((book.currentPage / book.totalPages) * 100)
                  : 0;
              return (
                <a
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group rounded-xl border border-border bg-card p-5 card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-12 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center book-spine">
                      <BookOpen className="h-6 w-6 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate group-hover:text-primary transition-colors text-base not-italic">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {book.author}
                      </p>
                      {book.readingMood && (
                        <span className="inline-block mt-1 text-xs text-primary/70">
                          <Flame className="h-3 w-3 inline mr-0.5" />
                          {book.readingMood}
                        </span>
                      )}
                      {book.totalPages && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span className="label-caps">
                              Page {book.currentPage || 0} of {book.totalPages}
                            </span>
                            <span className="label-caps">{progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full progress-glow transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ── QUICK NOTE ──────────────────────────────────────── */}
      {reading.length > 0 && (
        <section className="animate-in animate-in-8">
          <QuickNote
            books={reading.map((b) => ({
              id: b.id,
              title: b.title,
              author: b.author,
              status: b.status,
            }))}
          />
        </section>
      )}

      {/* ── KEY LESSONS PREVIEW ─────────────────────────────── */}
      {allLessons.length > 0 && (
        <section className="animate-in animate-in-8">
          <div className="flex items-center justify-between mb-5">
            <h2>Lessons Learned</h2>
            <a
              href="/highlights"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              All Highlights <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allLessons.slice(0, 4).map((item, i) => (
              <div key={i} className="insight-card flex items-start gap-4">
                <div className="lesson-number shrink-0">{i + 1}</div>
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed">{item.lesson}</p>
                  <p className="label-caps mt-2 text-primary/60">
                    {item.book}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT ACTIVITY ────────────────────────────────── */}
      {allBooks.length > 0 && (
        <section className="animate-in animate-in-8">
          <h2 className="mb-5">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {allBooks.slice(0, 5).map((book) => (
              <a
                key={book.id}
                href={`/books/${book.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    book.status === "reading"
                      ? "status-reading"
                      : book.status === "finished"
                      ? "status-finished"
                      : "status-to-read"
                  }`}
                >
                  {book.status === "to-read"
                    ? "To Read"
                    : book.status === "reading"
                    ? "Reading"
                    : "Finished"}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────── */}
      {allBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center animate-in animate-in-3">
          <div className="ambient-ring inline-flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg mt-8 not-italic">No books yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Start building your reading journal by adding your first book.
          </p>
          <a
            href="/books"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
          >
            Add your first book
          </a>
        </div>
      )}
    </div>
  );
}
