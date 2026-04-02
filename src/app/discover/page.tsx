"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, BookOpen, Loader2 } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  author: string;
  reason: string | null;
  genres: string[];
  coverImageUrl: string | null;
  isbn: string | null;
  addedToLibrary: boolean;
  createdAt: string;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((data) => {
        if (data.recommendations) setRecommendations(data.recommendations);
      })
      .catch(() => {});
  }, []);

  async function generateRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate recommendations");
        return;
      }
      setRecommendations(data.recommendations || []);
    } catch {
      setError("Failed to connect. Check your API key in Settings.");
    } finally {
      setLoading(false);
    }
  }

  async function addToLibrary(rec: Recommendation) {
    setAdding(rec.id);
    try {
      const res = await fetch("/api/recommendations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: rec.id }),
      });
      if (res.ok) {
        setRecommendations((prev) =>
          prev.map((r) =>
            r.id === rec.id ? { ...r, addedToLibrary: true } : r
          )
        );
        router.refresh();
      }
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in animate-in-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>
          <p className="text-sm text-muted-foreground mt-1 italic" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            AI-powered book recommendations based on your reading history
          </p>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground btn-primary-glow disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Get Recommendations"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => {
            const initials = rec.title
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();
            return (
              <div
                key={rec.id}
                className="rounded-xl border border-border bg-card overflow-hidden card-hover"
              >
                <div className="aspect-[3/2] bg-gradient-to-br from-primary/20 via-primary/10 to-accent flex items-center justify-center gallery-cover">
                  <span className="text-3xl font-bold text-primary/40" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
                    {initials}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground">{rec.author}</p>
                  </div>
                  {rec.reason && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {rec.reason}
                    </p>
                  )}
                  {rec.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.genres.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => addToLibrary(rec)}
                    disabled={rec.addedToLibrary || adding === rec.id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {rec.addedToLibrary ? (
                      <>
                        <BookOpen className="h-4 w-4" />
                        Added to Library
                      </>
                    ) : adding === rec.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add to Library
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No recommendations yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Click &quot;Get Recommendations&quot; to get AI-powered book
              suggestions based on your reading history.
            </p>
          </div>
        )
      )}
    </div>
  );
}
