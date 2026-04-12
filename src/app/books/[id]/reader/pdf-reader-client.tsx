"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileUp,
  BookOpen,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Columns2,
  AlignJustify,
  Highlighter,
  MessageSquarePlus,
  Type,
  Minus,
  Plus,
  SunMedium,
  X,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { updateBook } from "@/lib/actions/books";
import { createBookmark, getBookmarks, deleteBookmark } from "@/lib/actions/bookmarks";
import { cn } from "@/lib/utils";

const Document = dynamic(
  () =>
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      return { default: mod.Document };
    }),
  { ssr: false }
);
const Page_ = dynamic(
  () => import("react-pdf").then((mod) => ({ default: mod.Page })),
  { ssr: false }
);

interface Bookmark {
  id: string;
  bookId: string;
  page: number | null;
  chapterTitle: string | null;
  note: string | null;
  highlightText: string | null;
  color: string | null;
  createdAt: string;
}

interface PdfReaderClientProps {
  bookId: string;
  title: string;
  author: string;
  pdfPath: string | null;
  currentPage: number | null;
  totalPages: number | null;
  initialBookmarks: Bookmark[];
}

type ViewMode = "scroll" | "single" | "double";
type ReaderTheme = "light" | "sepia" | "dark" | "night" | "warm" | "forest" | "ocean" | "rose";

const READER_THEMES: { key: ReaderTheme; label: string; bg: string; fg: string; pageBg: string }[] = [
  { key: "light", label: "Light", bg: "#ffffff", fg: "#1a1a1a", pageBg: "#ffffff" },
  { key: "sepia", label: "Sepia", bg: "#f4ecd8", fg: "#5b4636", pageBg: "#faf3e3" },
  { key: "warm", label: "Warm Dark", bg: "#1f1710", fg: "#e8d5b5", pageBg: "#2a1f14" },
  { key: "dark", label: "Dark", bg: "#1c1c1e", fg: "#d1d1d6", pageBg: "#2c2c2e" },
  { key: "night", label: "Night", bg: "#000000", fg: "#999999", pageBg: "#111111" },
  { key: "forest", label: "Forest", bg: "#0f1a14", fg: "#b8ccb5", pageBg: "#152019" },
  { key: "ocean", label: "Ocean", bg: "#0e1620", fg: "#b0c4d8", pageBg: "#131d2a" },
  { key: "rose", label: "Rose", bg: "#1a1015", fg: "#d4b5c4", pageBg: "#21151b" },
];

const HIGHLIGHT_COLORS = [
  { key: "yellow", bg: "rgba(255, 230, 0, 0.35)", label: "Yellow" },
  { key: "green", bg: "rgba(0, 200, 83, 0.3)", label: "Green" },
  { key: "blue", bg: "rgba(0, 122, 255, 0.25)", label: "Blue" },
  { key: "pink", bg: "rgba(255, 55, 95, 0.25)", label: "Pink" },
  { key: "purple", bg: "rgba(175, 82, 222, 0.25)", label: "Purple" },
];

export function PdfReaderClient({
  bookId,
  title,
  author,
  pdfPath,
  currentPage: initialPage,
  totalPages: initialTotalPages,
  initialBookmarks,
}: PdfReaderClientProps) {
  const router = useRouter();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage || 1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBars, setShowBars] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("dark");
  const [jumpInput, setJumpInput] = useState("");
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarksList, setBookmarksList] = useState<Bookmark[]>(initialBookmarks);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Highlight state
  const [selectedText, setSelectedText] = useState("");
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);
  const [highlightPos, setHighlightPos] = useState({ x: 0, y: 0 });
  const [highlightNote, setHighlightNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState("yellow");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const pdfUrl = pdfPath
    ? `/api/files/${pdfPath.replace(/^.*?data[\/\\]uploads[\/\\]/, "").replace(/\\/g, "/")}`
    : null;

  const currentTheme = READER_THEMES.find((t) => t.key === readerTheme)!;

  // ── Fullscreen listeners ──────────────────────────────
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // ── Auto-hide bars in fullscreen ──────────────────────
  useEffect(() => {
    if (!isFullscreen) {
      setShowBars(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    function onMouseMove() {
      setShowBars(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowBars(false), 3000);
    }
    timer = setTimeout(() => setShowBars(false), 3000);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      clearTimeout(timer);
    };
  }, [isFullscreen]);

  // ── Scroll tracking for continuous mode ───────────────
  useEffect(() => {
    if (viewMode !== "scroll" || !numPages) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let visiblePage = pageNumber;
        for (const entry of entries) {
          const pg = parseInt(
            (entry.target as HTMLElement).dataset.page || "1"
          );
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            visiblePage = pg;
          }
        }
        if (maxRatio > 0.3) {
          setPageNumber(visiblePage);
          syncPageToBook(visiblePage);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: [0.1, 0.3, 0.5, 0.7],
      }
    );

    pageRefs.current.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [viewMode, numPages]);

  // ── Show "scroll to top" button ───────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    function onScroll() {
      setShowScrollTop((container?.scrollTop || 0) > 600);
    }
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [numPages]);

  // ── Text selection for highlighting ───────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    function onMouseUp() {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 2) {
        setSelectedText(text);
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          const containerRect = container!.getBoundingClientRect();
          setHighlightPos({
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top - containerRect.top - 10,
          });
          setShowHighlightPopup(true);
        }
      } else {
        setShowHighlightPopup(false);
        setShowNoteInput(false);
      }
    }

    container.addEventListener("mouseup", onMouseUp);
    return () => container.removeEventListener("mouseup", onMouseUp);
  }, [numPages]);

  // ── Register page ref for scroll tracking ─────────────
  const setPageRef = useCallback(
    (page: number, el: HTMLDivElement | null) => {
      if (el) {
        pageRefs.current.set(page, el);
        observerRef.current?.observe(el);
      } else {
        const old = pageRefs.current.get(page);
        if (old) observerRef.current?.unobserve(old);
        pageRefs.current.delete(page);
      }
    },
    []
  );

  // ── Keyboard navigation ──────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (showJumpDialog || showNoteInput) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          if (viewMode === "scroll") {
            scrollContainerRef.current?.scrollBy({
              top: window.innerHeight * 0.85,
              behavior: "smooth",
            });
          } else {
            goToPage(pageNumber + (viewMode === "double" ? 2 : 1));
          }
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          if (viewMode === "scroll") {
            scrollContainerRef.current?.scrollBy({
              top: -(window.innerHeight * 0.85),
              behavior: "smooth",
            });
          } else {
            goToPage(pageNumber - (viewMode === "double" ? 2 : 1));
          }
          break;
        case " ":
          e.preventDefault();
          scrollContainerRef.current?.scrollBy({
            top: e.shiftKey
              ? -(window.innerHeight * 0.85)
              : window.innerHeight * 0.85,
            behavior: "smooth",
          });
          break;
        case "Home":
          e.preventDefault();
          goToPage(1);
          if (viewMode === "scroll")
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "End":
          e.preventDefault();
          goToPage(numPages || 1);
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case "f":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "g":
          e.preventDefault();
          setShowJumpDialog(true);
          break;
        case "b":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleBookmarkPage();
          }
          break;
        case "Escape":
          setShowSettings(false);
          setShowBookmarks(false);
          setShowHighlightPopup(false);
          setShowNoteInput(false);
          break;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [viewMode, pageNumber, numPages, showJumpDialog, showNoteInput]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
    setNumPages(total);
    setLoading(false);
    if (total !== initialTotalPages) {
      updateBook(bookId, { totalPages: total });
    }
  }

  function goToPage(page: number) {
    if (!numPages) return;
    const clamped = Math.max(1, Math.min(page, numPages));
    setPageNumber(clamped);
    syncPageToBook(clamped);

    if (viewMode === "scroll") {
      const el = pageRefs.current.get(clamped);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function syncPageToBook(page: number) {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      updateBook(bookId, { currentPage: page });
    }, 1500);
  }

  function handleJumpSubmit() {
    const page = parseInt(jumpInput);
    if (!isNaN(page)) goToPage(page);
    setShowJumpDialog(false);
    setJumpInput("");
  }

  // ── Bookmarks & highlights ────────────────────────────
  const currentPageBookmarks = bookmarksList.filter(
    (bm) => bm.page === pageNumber
  );
  const isPageBookmarked = currentPageBookmarks.some(
    (bm) => !bm.highlightText
  );

  async function handleBookmarkPage() {
    if (isPageBookmarked) {
      const bm = currentPageBookmarks.find((b) => !b.highlightText);
      if (bm) {
        await deleteBookmark(bm.id);
        setBookmarksList((prev) => prev.filter((b) => b.id !== bm.id));
      }
    } else {
      const id = await createBookmark({ bookId, page: pageNumber });
      setBookmarksList((prev) => [
        { id, bookId, page: pageNumber, chapterTitle: null, note: null, highlightText: null, color: null, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    }
  }

  async function handleSaveHighlight() {
    if (!selectedText) return;
    const id = await createBookmark({
      bookId,
      page: pageNumber,
      highlightText: selectedText,
      note: highlightNote || undefined,
      color: activeHighlightColor,
    });
    setBookmarksList((prev) => [
      {
        id,
        bookId,
        page: pageNumber,
        chapterTitle: null,
        note: highlightNote || null,
        highlightText: selectedText,
        color: activeHighlightColor,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowHighlightPopup(false);
    setShowNoteInput(false);
    setHighlightNote("");
    setSelectedText("");
    window.getSelection()?.removeAllRanges();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "epub") return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookId", bookId);
    formData.append("type", ext === "epub" ? "epub" : "pdf");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) router.refresh();
    } finally {
      setUploading(false);
    }
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.4));

  const fitToWidth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return setScale(1.0);
    const containerWidth = container.clientWidth - 80;
    const pdfDefaultWidth = 612;
    const targetScale = containerWidth / pdfDefaultWidth;
    setScale(Math.min(Math.max(targetScale, 0.4), 3.0));
  }, []);

  const progress = numPages ? Math.round((pageNumber / numPages) * 100) : 0;

  const pagesToRender = useMemo(() => {
    if (!numPages) return [];
    if (viewMode === "scroll") {
      return Array.from({ length: numPages }, (_, i) => i + 1);
    }
    if (viewMode === "double") {
      const pages = [pageNumber];
      if (pageNumber + 1 <= numPages) pages.push(pageNumber + 1);
      return pages;
    }
    return [pageNumber];
  }, [viewMode, pageNumber, numPages]);

  // ── Apple Books-inspired page filter based on theme ───
  const pageFilter = useMemo(() => {
    switch (readerTheme) {
      case "sepia":
        return "sepia(0.3) brightness(0.95) contrast(1.02)";
      case "warm":
        return "invert(0.82) hue-rotate(180deg) brightness(0.9) contrast(1.05) sepia(0.25)";
      case "dark":
        return "invert(0.85) hue-rotate(180deg) brightness(0.95) contrast(1.1)";
      case "night":
        return "invert(0.9) hue-rotate(180deg) brightness(0.7) contrast(1.2)";
      case "forest":
        return "invert(0.83) hue-rotate(120deg) brightness(0.88) contrast(1.05) saturate(0.7)";
      case "ocean":
        return "invert(0.83) hue-rotate(200deg) brightness(0.9) contrast(1.05) saturate(0.7)";
      case "rose":
        return "invert(0.82) hue-rotate(300deg) brightness(0.88) contrast(1.05) saturate(0.6)";
      default:
        return "none";
    }
  }, [readerTheme]);

  return (
    <div
      ref={readerRef}
      className={cn(
        "flex flex-col -mx-6 -my-8 transition-colors duration-300",
        isFullscreen ? "h-screen" : "h-[calc(100vh-4rem)]"
      )}
      style={{ background: currentTheme.bg, color: currentTheme.fg }}
    >
      {/* ── Minimal Apple Books top bar ────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 shrink-0 transition-all duration-300 z-50",
          isFullscreen &&
            (showBars
              ? "absolute top-0 left-0 right-0 opacity-100 translate-y-0"
              : "absolute top-0 left-0 right-0 opacity-0 -translate-y-full pointer-events-none")
        )}
        style={{
          background: `${currentTheme.bg}ee`,
          backdropFilter: "blur(20px) saturate(1.8)",
          borderBottom: `1px solid ${currentTheme.fg}10`,
        }}
      >
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/books/${bookId}`}
            className="inline-flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[180px]">{title}</p>
            <p className="text-[11px] opacity-50 truncate">{author}</p>
          </div>
        </div>

        {/* Right: minimal controls */}
        {pdfUrl && (
          <div className="flex items-center gap-0.5">
            {/* Bookmark */}
            <button
              onClick={handleBookmarkPage}
              className={cn(
                "p-2 rounded-lg transition-all",
                isPageBookmarked
                  ? "text-amber-500"
                  : "opacity-50 hover:opacity-100"
              )}
              title={isPageBookmarked ? "Remove bookmark (B)" : "Bookmark page (B)"}
            >
              {isPageBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>

            {/* Bookmarks list */}
            <button
              onClick={() => { setShowBookmarks(!showBookmarks); setShowSettings(false); }}
              className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              title="All bookmarks & highlights"
            >
              <Highlighter className="h-4 w-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => { setShowSettings(!showSettings); setShowBookmarks(false); }}
              className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              title="Reader settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>

            <div className="w-px h-4 mx-1" style={{ background: `${currentTheme.fg}15` }} />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Settings dropdown panel ────────────────────── */}
      {showSettings && (
        <div
          className="absolute right-4 top-12 z-[55] w-72 rounded-2xl p-5 space-y-5 shadow-2xl animate-in animate-in-1"
          style={{
            background: currentTheme.pageBg,
            border: `1px solid ${currentTheme.fg}15`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-50">
              Reader Settings
            </span>
            <button onClick={() => setShowSettings(false)} className="opacity-40 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium opacity-60">Theme</span>
            <div className="grid grid-cols-4 gap-2">
              {READER_THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setReaderTheme(t.key)}
                  className={cn(
                    "h-8 rounded-lg border-2 transition-all",
                    readerTheme === t.key
                      ? "border-blue-500 scale-105"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ background: t.bg }}
                  title={t.label}
                >
                  <span className="text-[9px] font-bold" style={{ color: t.fg }}>
                    Aa
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium opacity-60">Zoom</span>
            <div className="flex items-center gap-3">
              <button onClick={zoomOut} className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${currentTheme.fg}15` }}>
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${((scale - 0.4) / 2.6) * 100}%`,
                    background: "rgb(59, 130, 246)",
                  }}
                />
              </div>
              <button onClick={zoomIn} className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs opacity-50 min-w-[3rem] text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>
            <button
              onClick={fitToWidth}
              className="w-full text-[11px] opacity-50 hover:opacity-80 transition-opacity text-center py-1"
            >
              Fit to width
            </button>
          </div>

          {/* View mode */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium opacity-60">View</span>
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: `1px solid ${currentTheme.fg}15` }}
            >
              {([
                { mode: "scroll" as ViewMode, icon: AlignJustify, label: "Scroll" },
                { mode: "single" as ViewMode, icon: BookOpen, label: "Page" },
                { mode: "double" as ViewMode, icon: Columns2, label: "Spread" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1 transition-colors",
                    viewMode === mode
                      ? "bg-blue-500/15 text-blue-500"
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bookmarks/highlights panel ─────────────────── */}
      {showBookmarks && (
        <div
          className="absolute right-4 top-12 z-[55] w-80 max-h-[70vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in animate-in-1"
          style={{
            background: currentTheme.pageBg,
            border: `1px solid ${currentTheme.fg}15`,
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${currentTheme.fg}10` }}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-50">
              Bookmarks & Highlights
            </span>
            <button onClick={() => setShowBookmarks(false)} className="opacity-40 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {bookmarksList.length === 0 ? (
              <div className="p-6 text-center opacity-40">
                <Bookmark className="h-6 w-6 mx-auto mb-2" />
                <p className="text-xs">No bookmarks yet</p>
                <p className="text-[10px] mt-1 opacity-60">
                  Press B to bookmark a page, or select text to highlight
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: `${currentTheme.fg}08` }}>
                {bookmarksList.map((bm) => (
                  <button
                    key={bm.id}
                    onClick={() => {
                      if (bm.page) goToPage(bm.page);
                      setShowBookmarks(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:opacity-80 transition-opacity group"
                  >
                    <div className="flex items-start gap-2.5">
                      {bm.highlightText ? (
                        <div
                          className="w-1 shrink-0 rounded-full mt-0.5"
                          style={{
                            height: "100%",
                            minHeight: "20px",
                            background: HIGHLIGHT_COLORS.find((c) => c.key === bm.color)?.bg || HIGHLIGHT_COLORS[0].bg,
                          }}
                        />
                      ) : (
                        <Bookmark className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        {bm.highlightText ? (
                          <p className="text-xs leading-relaxed line-clamp-3 italic opacity-80">
                            &ldquo;{bm.highlightText}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs font-medium opacity-70">
                            Bookmark
                          </p>
                        )}
                        {bm.note && (
                          <p className="text-[10px] mt-1 opacity-50">{bm.note}</p>
                        )}
                        <p className="text-[10px] mt-1 opacity-30">Page {bm.page}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBookmark(bm.id);
                          setBookmarksList((prev) => prev.filter((b) => b.id !== bm.id));
                        }}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 shrink-0 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PDF Content ────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative"
        style={{ background: currentTheme.bg }}
      >
        {pdfUrl ? (
          <>
            {loading && (
              <div className="flex flex-col items-center gap-3 py-20 justify-center" style={{ color: `${currentTheme.fg}60` }}>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading=""
            >
              <div
                className={cn(
                  "py-6",
                  viewMode === "double"
                    ? "flex justify-center gap-1 px-4"
                    : "flex flex-col items-center"
                )}
              >
                {pagesToRender.map((pg) => (
                  <div
                    key={pg}
                    ref={(el) => setPageRef(pg, el)}
                    data-page={pg}
                    className={cn(
                      "relative",
                      viewMode === "scroll" && "mb-2"
                    )}
                  >
                    <Page_
                      pageNumber={pg}
                      scale={scale}
                      className="overflow-hidden"
                      renderTextLayer={true}
                      renderAnnotationLayer={false}
                      customTextRenderer={undefined}
                    />
                    {/* Canvas filter overlay for dark/sepia modes */}
                    {pageFilter !== "none" && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          mixBlendMode: "normal",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Document>

            {/* ── Highlight popup (appears on text selection) ── */}
            {showHighlightPopup && (
              <div
                className="absolute z-[60] flex flex-col items-center animate-in animate-in-1"
                style={{
                  left: `${highlightPos.x}px`,
                  top: `${highlightPos.y}px`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div
                  className="rounded-xl px-2 py-1.5 flex items-center gap-1 shadow-xl"
                  style={{
                    background: currentTheme.pageBg,
                    border: `1px solid ${currentTheme.fg}20`,
                  }}
                >
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        setActiveHighlightColor(c.key);
                        handleSaveHighlight();
                      }}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-125"
                      style={{ background: c.bg }}
                      title={`Highlight ${c.label}`}
                    />
                  ))}
                  <div className="w-px h-5 mx-0.5" style={{ background: `${currentTheme.fg}15` }} />
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                    title="Add note"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </button>
                </div>

                {/* Note input */}
                {showNoteInput && (
                  <div
                    className="mt-2 rounded-xl p-3 w-64 space-y-2 shadow-xl"
                    style={{
                      background: currentTheme.pageBg,
                      border: `1px solid ${currentTheme.fg}20`,
                    }}
                  >
                    <textarea
                      value={highlightNote}
                      onChange={(e) => setHighlightNote(e.target.value)}
                      placeholder="Add a note..."
                      rows={2}
                      autoFocus
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
                      style={{
                        background: `${currentTheme.fg}08`,
                        color: currentTheme.fg,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          handleSaveHighlight();
                        }
                      }}
                    />
                    <div className="flex items-center gap-1.5">
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => setActiveHighlightColor(c.key)}
                          className={cn(
                            "w-5 h-5 rounded-full transition-all",
                            activeHighlightColor === c.key && "ring-2 ring-blue-500 ring-offset-1"
                          )}
                          style={{
                            background: c.bg,
                          }}
                        />
                      ))}
                      <button
                        onClick={handleSaveHighlight}
                        className="ml-auto text-xs font-medium px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Arrow */}
                <div
                  className="w-2.5 h-2.5 rotate-45 -mt-1"
                  style={{
                    background: currentTheme.pageBg,
                    borderRight: `1px solid ${currentTheme.fg}20`,
                    borderBottom: `1px solid ${currentTheme.fg}20`,
                  }}
                />
              </div>
            )}

            {/* Scroll to top */}
            {showScrollTop && viewMode === "scroll" && (
              <button
                onClick={() =>
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="fixed bottom-20 right-8 z-40 p-2.5 rounded-full shadow-lg transition-all hover:scale-110"
                style={{
                  background: currentTheme.pageBg,
                  border: `1px solid ${currentTheme.fg}15`,
                }}
                title="Scroll to top"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            )}
          </>
        ) : (
          /* ── No PDF state ───────────────────────────── */
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="ambient-ring inline-flex items-center justify-center mb-8">
              <BookOpen className="h-16 w-16 opacity-20" />
            </div>
            <h2 className="text-xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
              No file uploaded
            </h2>
            <p className="opacity-50 mt-2 max-w-md text-sm">
              Upload a PDF or EPUB to read <em>{title}</em> right here in your journal.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload PDF or EPUB"}
            </button>
          </div>
        )}
      </div>

      {/* ── Apple Books-style bottom bar ───────────────── */}
      {pdfUrl && numPages && (
        <div
          className={cn(
            "flex items-center gap-4 px-5 py-2.5 shrink-0 transition-all duration-300 z-50",
            isFullscreen &&
              (showBars
                ? "absolute bottom-0 left-0 right-0 opacity-100 translate-y-0"
                : "absolute bottom-0 left-0 right-0 opacity-0 translate-y-full pointer-events-none")
          )}
          style={{
            background: `${currentTheme.bg}ee`,
            backdropFilter: "blur(20px) saturate(1.8)",
            borderTop: `1px solid ${currentTheme.fg}10`,
          }}
        >
          {/* Prev */}
          <button
            onClick={() => goToPage(pageNumber - (viewMode === "double" ? 2 : 1))}
            disabled={pageNumber <= 1}
            className="p-1 opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrubber bar — Apple Books style */}
          <div className="flex-1 flex items-center gap-3">
            <div
              className="flex-1 relative h-1 rounded-full cursor-pointer group"
              style={{ background: `${currentTheme.fg}12` }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                goToPage(Math.round(ratio * (numPages || 1)));
              }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: "rgb(59, 130, 246)",
                }}
              />
              {/* Scrubber handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                style={{
                  left: `${progress}%`,
                  transform: `translateX(-50%) translateY(-50%)`,
                  background: "rgb(59, 130, 246)",
                  boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                }}
              />
            </div>
          </div>

          {/* Session progress */}
          {pageNumber - (initialPage || 1) > 0 && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium tabular-nums"
              style={{ background: `${currentTheme.fg}15`, color: currentTheme.fg, opacity: 0.7 }}
            >
              +{pageNumber - (initialPage || 1)} pg
            </span>
          )}

          {/* Page counter */}
          <button
            onClick={() => setShowJumpDialog(true)}
            className="text-xs opacity-40 hover:opacity-80 transition-opacity tabular-nums min-w-[4.5rem] text-right"
          >
            {pageNumber} of {numPages}
          </button>

          {/* Next */}
          <button
            onClick={() => goToPage(pageNumber + (viewMode === "double" ? 2 : 1))}
            disabled={pageNumber >= numPages}
            className="p-1 opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Jump to page dialog ────────────────────────── */}
      {showJumpDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => { setShowJumpDialog(false); setJumpInput(""); }}
        >
          <div
            className="rounded-2xl p-5 shadow-2xl space-y-3 w-72 animate-in animate-in-1"
            style={{
              background: currentTheme.pageBg,
              border: `1px solid ${currentTheme.fg}15`,
              color: currentTheme.fg,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold">Go to page</h3>
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={`1 — ${numPages || "?"}`}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{
                background: `${currentTheme.fg}08`,
                border: `1px solid ${currentTheme.fg}15`,
                color: currentTheme.fg,
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJumpSubmit();
                if (e.key === "Escape") {
                  setShowJumpDialog(false);
                  setJumpInput("");
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowJumpDialog(false); setJumpInput(""); }}
                className="px-4 py-1.5 rounded-xl text-sm opacity-50 hover:opacity-100 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleJumpSubmit}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS for text layer selection ───────────────── */}
      <style jsx global>{`
        .react-pdf__Page__textContent {
          opacity: 0.2;
          mix-blend-mode: multiply;
        }
        .react-pdf__Page__textContent span::selection {
          background: rgba(59, 130, 246, 0.3);
        }
        .react-pdf__Page__textContent span {
          cursor: text !important;
        }
        .react-pdf__Page canvas {
          filter: ${pageFilter};
          transition: filter 0.3s ease;
        }
      `}</style>
    </div>
  );
}
