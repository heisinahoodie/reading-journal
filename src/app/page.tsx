import { getBooks } from "@/lib/actions/books";
import { BookOpen, BookCheck, BookMarked, TrendingUp } from "lucide-react";

export default async function Dashboard() {
  const allBooks = await getBooks();
  const reading = allBooks.filter((b) => b.status === "reading");
  const finished = allBooks.filter((b) => b.status === "finished");
  const toRead = allBooks.filter((b) => b.status === "to-read");
  const totalPages = finished.reduce((sum, b) => sum + (b.totalPages || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your reading journey at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Currently Reading"
          value={reading.length}
          accent="text-blue-500"
        />
        <StatCard
          icon={<BookCheck className="h-5 w-5" />}
          label="Finished"
          value={finished.length}
          accent="text-green-500"
        />
        <StatCard
          icon={<BookMarked className="h-5 w-5" />}
          label="To Read"
          value={toRead.length}
          accent="text-muted-foreground"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Pages Read"
          value={totalPages.toLocaleString()}
          accent="text-primary"
        />
      </div>

      {/* Currently Reading */}
      {reading.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Currently Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reading.map((book) => {
              const progress =
                book.currentPage && book.totalPages
                  ? Math.round((book.currentPage / book.totalPages) * 100)
                  : 0;
              return (
                <a
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-12 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {book.author}
                      </p>
                      {book.totalPages && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>
                              Page {book.currentPage || 0} of {book.totalPages}
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
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

      {/* Recent Books */}
      {allBooks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {allBooks.slice(0, 5).map((book) => (
              <a
                key={book.id}
                href={`/books/${book.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
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

      {allBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No books yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Start building your reading journal by adding your first book.
          </p>
          <a
            href="/books"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add your first book
          </a>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className={`${accent} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
