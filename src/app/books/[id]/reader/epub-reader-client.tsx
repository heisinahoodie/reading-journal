"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileUp,
  BookOpen,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Highlighter,
  MessageSquarePlus,
  Minus,
  Plus,
  Settings2,
  X,
  List,
  Search,
  StickyNote,
  Quote,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { updateBook } from "@/lib/actions/books";
import { createBookmark, deleteBookmark } from "@/lib/actions/bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkItem {
  id: string;
  bookId: string;
  page: number | null;
  chapterTitle: string | null;
  note: string | null;
  highlightText: string | null;
  color: string | null;
  createdAt: string;
}

interface EpubReaderClientProps {
  bookId: string;
  title: string;
  author: string;
  pdfPath: string | null;
  currentPage: number | null;
  totalPages: number | null;
  initialBookmarks: BookmarkItem[];
}

type ReaderTheme = "light" | "sepia" | "dark" | "night" | "warm" | "forest" | "ocean" | "rose";

const READER_THEMES: { key: ReaderTheme; label: string; bg: string; fg: string; link: string }[] = [
  { key: "light", label: "Light", bg: "#ffffff", fg: "#1a1a1a", link: "#0066cc" },
  { key: "sepia", label: "Sepia", bg: "#f4ecd8", fg: "#5b4636", link: "#8b6914" },
  { key: "warm", label: "Warm Dark", bg: "#1f1710", fg: "#e8d5b5", link: "#e8a94e" },
  { key: "dark", label: "Dark", bg: "#1c1c1e", fg: "#d1d1d6", link: "#6cb4ff" },
  { key: "night", label: "Night", bg: "#000000", fg: "#999999", link: "#6699cc" },
  { key: "forest", label: "Forest", bg: "#0f1a14", fg: "#b8ccb5", link: "#6db88f" },
  { key: "ocean", label: "Ocean", bg: "#0e1620", fg: "#b0c4d8", link: "#5ea8d6" },
  { key: "rose", label: "Rose", bg: "#1a1015", fg: "#d4b5c4", link: "#c47a9a" },
];

const HIGHLIGHT_COLORS = [
  { key: "yellow", bg: "rgba(255, 230, 0, 0.35)", solid: "#ffe600", label: "Yellow" },
  { key: "green", bg: "rgba(0, 200, 83, 0.3)", solid: "#00c853", label: "Green" },
  { key: "blue", bg: "rgba(0, 122, 255, 0.25)", solid: "#007aff", label: "Blue" },
  { key: "pink", bg: "rgba(255, 55, 95, 0.25)", solid: "#ff375f", label: "Pink" },
  { key: "purple", bg: "rgba(175, 82, 222, 0.25)", solid: "#af52de", label: "Purple" },
];

const READER_FONTS = [
  { key: "georgia", label: "Georgia", family: "'Georgia', serif", style: "serif" },
  { key: "merriweather", label: "Merriweather", family: "'Merriweather', serif", style: "serif", googleFont: "Merriweather:wght@300;400;700" },
  { key: "literata", label: "Literata", family: "'Literata', serif", style: "serif", googleFont: "Literata:opsz,wght@7..72,300;7..72,400;7..72,700" },
  { key: "lora", label: "Lora", family: "'Lora', serif", style: "serif", googleFont: "Lora:wght@400;500;700" },
  { key: "source-serif", label: "Source Serif", family: "'Source Serif 4', serif", style: "serif", googleFont: "Source+Serif+4:wght@300;400;600;700" },
  { key: "palatino", label: "Palatino", family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", style: "serif" },
  { key: "atkinson", label: "Atkinson", family: "'Atkinson Hyperlegible', sans-serif", style: "sans", googleFont: "Atkinson+Hyperlegible:wght@400;700" },
  { key: "lexend", label: "Lexend", family: "'Lexend', sans-serif", style: "dyslexia-friendly", googleFont: "Lexend:wght@300;400;500;700" },
  { key: "opendyslexic", label: "OpenDyslexic", family: "'OpenDyslexic', sans-serif", style: "dyslexia-friendly", googleFont: "OpenDyslexic" },
  { key: "comic-sans", label: "Comic Sans", family: "'Comic Sans MS', 'Comic Sans', cursive", style: "casual" },
  { key: "jetbrains", label: "JetBrains Mono", family: "'JetBrains Mono', monospace", style: "mono", googleFont: "JetBrains+Mono:wght@300;400;500;700" },
];

interface TocItem {
  label: string;
  href: string;
  level: number;
  subitems?: TocItem[];
}

export function EpubReaderClient({
  bookId,
  title,
  author,
  pdfPath,
  currentPage,
  totalPages,
  initialBookmarks,
}: EpubReaderClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("dark");
  const [readerFont, setReaderFont] = useState("georgia");
  const [fontColor, setFontColor] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBars, setShowBars] = useState(true);
  const [fontSize, setFontSize] = useState(100);
  const [currentChapter, setCurrentChapter] = useState("");
  const [currentChapterLabel, setCurrentChapterLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [sessionStartProgress, setSessionStartProgress] = useState<number | null>(null);
  const [bookmarksList, setBookmarksList] = useState<BookmarkItem[]>(initialBookmarks);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tocSearch, setTocSearch] = useState("");
  const [expandedTocSections, setExpandedTocSections] = useState<Set<string>>(new Set());

  // Highlight / annotation state
  const [selectedText, setSelectedText] = useState("");
  const [selectionCfiRange, setSelectionCfiRange] = useState("");
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);
  const [highlightPopupPos, setHighlightPopupPos] = useState({ x: 0, y: 0 });
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pendingHighlightColor, setPendingHighlightColor] = useState("yellow");
  const [savingHighlight, setSavingHighlight] = useState(false);

  const readerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);
  const bookRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const epubUrl = pdfPath
    ? `/api/files/${pdfPath.replace(/^.*?data[\/\\]uploads[\/\\]/, "").replace(/\\/g, "/")}`
    : null;

  const currentTheme = READER_THEMES.find((t) => t.key === readerTheme)!;

  // ── Flatten nested TOC for search ──────────────────────
  function flattenToc(items: any[], level = 0): TocItem[] {
    const result: TocItem[] = [];
    for (const item of items) {
      result.push({
        label: item.label?.trim() || "",
        href: item.href,
        level,
        subitems: item.subitems?.length > 0 ? flattenToc(item.subitems, level + 1) : undefined,
      });
    }
    return result;
  }

  // ── Filter TOC by search ──────────────────────────────
  const filteredToc = useMemo(() => {
    if (!tocSearch.trim()) return toc;
    const q = tocSearch.toLowerCase();
    function filterItems(items: TocItem[]): TocItem[] {
      const filtered: TocItem[] = [];
      for (const item of items) {
        const childMatches = item.subitems ? filterItems(item.subitems) : [];
        if (item.label.toLowerCase().includes(q) || childMatches.length > 0) {
          filtered.push({ ...item, subitems: childMatches.length > 0 ? childMatches : item.subitems });
        }
      }
      return filtered;
    }
    return filterItems(toc);
  }, [toc, tocSearch]);

  // ── Load EPUB ─────────────────────────────────────────
  useEffect(() => {
    if (!epubUrl || !viewerRef.current) return;

    let mounted = true;

    async function loadEpub() {
      const ePub = (await import("epubjs")).default;
      if (!mounted) return;

      const book = ePub(epubUrl!);
      bookRef.current = book;

      const rendition = book.renderTo(viewerRef.current!, {
        width: "100%",
        height: "100%",
        spread: "none",
        flow: "paginated",
      });

      renditionRef.current = rendition;

      // Apply theme
      applyTheme(rendition, readerTheme, fontSize, readerFont, fontColor);

      // Restore saved position — prefer exact CFI from localStorage,
      // fall back to approximate chapter via stored percentage from DB
      const savedCfi = typeof window !== "undefined"
        ? localStorage.getItem(`epub-cfi-${bookId}`)
        : null;

      if (savedCfi) {
        rendition.display(savedCfi).then(() => {
          if (mounted) setLoading(false);
        });
      } else if (currentPage && currentPage > 1) {
        // No CFI yet — jump to approximate chapter using spine index
        book.ready.then(() => {
          if (!mounted) return;
          const spineItems: any[] = (book.spine as any).items ?? [];
          if (spineItems.length > 0) {
            const targetIndex = Math.min(
              spineItems.length - 1,
              Math.max(0, Math.floor((currentPage / 100) * spineItems.length) - 1)
            );
            const target = spineItems[targetIndex];
            rendition.display(target?.href || undefined).then(() => {
              if (mounted) setLoading(false);
            });
          } else {
            rendition.display().then(() => {
              if (mounted) setLoading(false);
            });
          }
        });
      } else {
        rendition.display().then(() => {
          if (mounted) setLoading(false);
        });
      }

      // Navigation loaded — get table of contents (with nesting)
      book.loaded.navigation.then((nav: any) => {
        if (!mounted) return;
        const items = flattenToc(nav.toc);
        setToc(items);
      });

      // Generate locations for accurate % tracking (cached in localStorage)
      book.ready.then(() => {
        if (!mounted) return;
        const locKey = `epub-locs-${bookId}`;
        const stored = typeof window !== "undefined" ? localStorage.getItem(locKey) : null;
        if (stored) {
          book.locations.load(stored);
        } else {
          // Generate in background — ~1s for most books
          book.locations.generate(1024).then(() => {
            if (!mounted) return;
            try {
              const json = JSON.stringify(book.locations.save());
              localStorage.setItem(locKey, json);
            } catch {}
            // Refresh progress with accurate percentage now that locations are ready
            const loc = (renditionRef.current as any)?.currentLocation?.();
            if (loc?.start) {
              const pct = Math.round((loc.start.percentage || 0) * 100);
              if (pct > 0) {
                setProgress(pct);
                updateBook(bookId, { currentPage: pct });
              }
            }
          });
        }
      });

      // Track location changes
      rendition.on("relocated", (location: any) => {
        if (!mounted) return;
        // Use percentage if locations are generated, otherwise approximate from spine index
        let pct = Math.round((location.start.percentage || 0) * 100);
        if (pct === 0 && location.start.index != null) {
          const spineItems: any[] = (book.spine as any).items ?? [];
          if (spineItems.length > 1) {
            pct = Math.round((location.start.index / (spineItems.length - 1)) * 100);
          }
        }
        setProgress(pct);
        updateBook(bookId, { currentPage: pct });
        // Save CFI for position restore on next visit
        const cfi = location.start.cfi;
        if (cfi) {
          localStorage.setItem(`epub-cfi-${bookId}`, cfi);
        }
        // Record session start (only set once — the first position after load)
        setSessionStartProgress((prev) => (prev === null ? pct : prev));
      });

      rendition.on("rendered", (section: any) => {
        if (!mounted) return;
        const chapter = section.href;
        setCurrentChapter(chapter);
        // Try to find matching chapter label
        function findLabel(items: TocItem[]): string {
          for (const item of items) {
            if (chapter.includes(item.href.split("#")[0])) return item.label;
            if (item.subitems) {
              const found = findLabel(item.subitems);
              if (found) return found;
            }
          }
          return "";
        }
        const label = findLabel(toc);
        if (label) setCurrentChapterLabel(label);

        // Re-apply theme + font to new section (epubjs re-creates iframe content)
        setTimeout(() => {
          if (renditionRef.current) {
            applyTheme(renditionRef.current, readerTheme, fontSize, readerFont, fontColor);
          }
        }, 50);
      });

      // ── Text selection handler for highlighting ───────
      rendition.on("selected", (cfiRange: string, contents: any) => {
        if (!mounted) return;
        const doc = contents.document;
        const sel = doc.getSelection();
        if (!sel || sel.isCollapsed) return;

        const text = sel.toString().trim();
        if (!text || text.length < 2) return;

        setSelectedText(text);
        setSelectionCfiRange(cfiRange);

        // Position popup near selection
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const iframe = viewerRef.current?.querySelector("iframe");
        const iframeRect = iframe?.getBoundingClientRect();

        if (iframeRect) {
          const x = Math.min(Math.max(iframeRect.left + rect.left + rect.width / 2, 100), window.innerWidth - 100);
          const y = iframeRect.top + rect.top - 10;
          setHighlightPopupPos({ x, y });
        }

        setShowHighlightPopup(true);
        setShowNoteInput(false);
        setNoteText("");
      });
    }

    loadEpub();

    return () => {
      mounted = false;
      if (bookRef.current) {
        try { bookRef.current.destroy(); } catch {}
      }
    };
  }, [epubUrl]);

  // ── Apply theme when it changes ───────────────────────
  useEffect(() => {
    if (renditionRef.current) {
      applyTheme(renditionRef.current, readerTheme, fontSize, readerFont, fontColor);
    }
  }, [readerTheme, fontSize, readerFont, fontColor]);

  function applyTheme(rendition: any, theme: ReaderTheme, size: number, fontKey: string, customColor: string | null) {
    const t = READER_THEMES.find((r) => r.key === theme)!;
    const fontObj = READER_FONTS.find((f) => f.key === fontKey) || READER_FONTS[0];
    const textColor = customColor || t.fg;

    // Inject Google Font stylesheet into epub iframe if needed
    if (fontObj.googleFont) {
      try {
        const iframe = viewerRef.current?.querySelector("iframe");
        if (iframe?.contentDocument) {
          const existingLink = iframe.contentDocument.querySelector(`link[data-reader-font="${fontObj.key}"]`);
          if (!existingLink) {
            const link = iframe.contentDocument.createElement("link");
            link.rel = "stylesheet";
            link.href = `https://fonts.googleapis.com/css2?family=${fontObj.googleFont}&display=swap`;
            link.setAttribute("data-reader-font", fontObj.key);
            iframe.contentDocument.head.appendChild(link);
          }
        }
      } catch {}
    }

    rendition.themes.default({
      "body": {
        "background": `${t.bg} !important`,
        "color": `${textColor} !important`,
        "font-family": `${fontObj.family} !important`,
        "font-size": `${size}% !important`,
        "line-height": "1.8 !important",
        "padding": "20px 40px !important",
      },
      "a": {
        "color": `${t.link} !important`,
      },
      "p, li, td, th, dd, dt, blockquote, figcaption": {
        "font-family": `${fontObj.family} !important`,
        "color": `${textColor} !important`,
        "margin-bottom": "0.8em !important",
      },
      "h1, h2, h3, h4, h5, h6": {
        "color": `${textColor} !important`,
      },
      "img": {
        "max-width": "100% !important",
        "height": "auto !important",
      },
    });
  }

  // ── Fullscreen ────────────────────────────────────────
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen) { setShowBars(true); return; }
    let timer: ReturnType<typeof setTimeout>;
    function onMouseMove() {
      setShowBars(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowBars(false), 3000);
    }
    timer = setTimeout(() => setShowBars(false), 3000);
    document.addEventListener("mousemove", onMouseMove);
    return () => { document.removeEventListener("mousemove", onMouseMove); clearTimeout(timer); };
  }, [isFullscreen]);

  // ── Keyboard navigation ──────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          renditionRef.current?.next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          renditionRef.current?.prev();
          break;
        case "f":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "Escape":
          setShowSettings(false);
          setShowToc(false);
          setShowBookmarks(false);
          setShowHighlightPopup(false);
          break;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus note input when it opens
  useEffect(() => {
    if (showNoteInput && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [showNoteInput]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookId", bookId);
    formData.append("type", file.name.endsWith(".epub") ? "epub" : "pdf");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) router.refresh();
    } finally {
      setUploading(false);
    }
  }

  // ── Highlight actions ─────────────────────────────────
  async function handleSaveHighlight(color: string, note?: string) {
    if (!selectedText) return;
    setSavingHighlight(true);

    try {
      // Apply visual highlight in the epub via annotation
      if (renditionRef.current && selectionCfiRange) {
        const colorObj = HIGHLIGHT_COLORS.find((c) => c.key === color);
        try {
          renditionRef.current.annotations.add(
            "highlight",
            selectionCfiRange,
            {},
            undefined,
            "hl",
            { fill: colorObj?.solid || "#ffe600", "fill-opacity": "0.3", "mix-blend-mode": "multiply" }
          );
        } catch {}
      }

      // Save to database
      const id = await createBookmark({
        bookId,
        chapterTitle: currentChapterLabel || currentChapter || undefined,
        highlightText: selectedText,
        note,
        color,
      });
      setBookmarksList((prev) => [
        {
          id,
          bookId,
          page: null,
          chapterTitle: currentChapterLabel || currentChapter || null,
          note: note || null,
          highlightText: selectedText,
          color,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setShowHighlightPopup(false);
      setShowNoteInput(false);
      setNoteText("");
      setSelectedText("");
      setSelectionCfiRange("");
    } finally {
      setSavingHighlight(false);
    }
  }

  async function handleQuickHighlight(color: string) {
    await handleSaveHighlight(color);
  }

  async function handleSaveWithNote() {
    await handleSaveHighlight(pendingHighlightColor, noteText.trim() || undefined);
  }

  function handleDeleteHighlight(id: string) {
    deleteBookmark(id);
    setBookmarksList((prev) => prev.filter((b) => b.id !== id));
  }

  function toggleTocSection(href: string) {
    setExpandedTocSections((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href); else next.add(href);
      return next;
    });
  }

  // ── Render TOC item recursively ───────────────────────
  function renderTocItem(item: TocItem, depth: number = 0) {
    const isActive = currentChapter.includes(item.href.split("#")[0]);
    const hasChildren = item.subitems && item.subitems.length > 0;
    const isExpanded = expandedTocSections.has(item.href);

    return (
      <div key={item.href + item.label}>
        <button
          onClick={() => {
            renditionRef.current?.display(item.href);
            if (!hasChildren) setShowToc(false);
            if (hasChildren) toggleTocSection(item.href);
          }}
          className={cn(
            "w-full text-left flex items-center gap-2 py-2.5 text-sm transition-all hover:opacity-100",
            isActive ? "opacity-100 font-medium" : "opacity-60",
          )}
          style={{
            paddingLeft: `${16 + depth * 16}px`,
            paddingRight: "16px",
            borderLeft: isActive ? `2px solid ${currentTheme.link}` : "2px solid transparent",
            background: isActive ? `${currentTheme.link}08` : "transparent",
          }}
        >
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          {hasChildren && (
            <span className="opacity-40 shrink-0">
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div>
            {item.subitems!.map((child) => renderTocItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  // ── Group highlights by chapter ───────────────────────
  const highlightsByChapter = useMemo(() => {
    const groups = new Map<string, BookmarkItem[]>();
    for (const bm of bookmarksList) {
      const chapter = bm.chapterTitle || "Unknown";
      if (!groups.has(chapter)) groups.set(chapter, []);
      groups.get(chapter)!.push(bm);
    }
    return groups;
  }, [bookmarksList]);

  return (
    <div
      ref={readerRef}
      className={cn(
        "flex flex-col -mx-6 -my-8 transition-colors duration-300",
        isFullscreen ? "h-screen" : "h-[calc(100vh-4rem)]"
      )}
      style={{ background: currentTheme.bg, color: currentTheme.fg }}
    >
      {/* ── Top bar ───────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 shrink-0 transition-all duration-300 z-50",
          isFullscreen && (showBars ? "absolute top-0 left-0 right-0 opacity-100" : "absolute top-0 left-0 right-0 opacity-0 -translate-y-full pointer-events-none")
        )}
        style={{
          background: `${currentTheme.bg}ee`,
          backdropFilter: "blur(20px) saturate(1.8)",
          borderBottom: `1px solid ${currentTheme.fg}10`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/books/${bookId}`} className="opacity-60 hover:opacity-100 transition-opacity">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[180px]">{title}</p>
            <p className="text-[11px] opacity-50 truncate">{currentChapterLabel || author}</p>
          </div>
        </div>

        {epubUrl && (
          <div className="flex items-center gap-0.5">
            <button onClick={() => { setShowToc(!showToc); setShowSettings(false); setShowBookmarks(false); }} className={cn("p-2 rounded-lg transition-opacity", showToc ? "opacity-100" : "opacity-50 hover:opacity-100")} title="Table of contents">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => { setShowBookmarks(!showBookmarks); setShowSettings(false); setShowToc(false); }} className={cn("p-2 rounded-lg transition-opacity relative", showBookmarks ? "opacity-100" : "opacity-50 hover:opacity-100")} title="Highlights & Notes">
              <Highlighter className="h-4 w-4" />
              {bookmarksList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center px-0.5" style={{ background: currentTheme.link, color: currentTheme.bg }}>
                  {bookmarksList.length}
                </span>
              )}
            </button>
            <button onClick={() => { setShowSettings(!showSettings); setShowToc(false); setShowBookmarks(false); }} className={cn("p-2 rounded-lg transition-opacity", showSettings ? "opacity-100" : "opacity-50 hover:opacity-100")} title="Settings">
              <Settings2 className="h-4 w-4" />
            </button>
            <div className="w-px h-4 mx-1" style={{ background: `${currentTheme.fg}15` }} />
            <button onClick={toggleFullscreen} className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* ── Settings panel ────────────────────────────── */}
      {showSettings && (
        <div className="absolute right-4 top-12 z-[55] w-72 max-h-[80vh] overflow-y-auto rounded-2xl p-5 space-y-5 shadow-2xl animate-in animate-in-1" style={{ background: currentTheme.bg, border: `1px solid ${currentTheme.fg}15` }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Settings</span>
            <button onClick={() => setShowSettings(false)} className="opacity-40 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </div>
          {/* Theme */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium opacity-60">Theme</span>
            <div className="grid grid-cols-4 gap-2">
              {READER_THEMES.map((t) => (
                <button key={t.key} onClick={() => setReaderTheme(t.key)} className={cn("h-8 rounded-lg border-2 transition-all", readerTheme === t.key ? "border-blue-500 scale-105" : "border-transparent hover:scale-105")} style={{ background: t.bg }} title={t.label}>
                  <span className="text-[9px] font-bold" style={{ color: t.fg }}>Aa</span>
                </button>
              ))}
            </div>
          </div>
          {/* Font */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium opacity-60">Font</span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {READER_FONTS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setReaderFont(f.key)}
                  className={cn(
                    "text-left px-2.5 py-2 rounded-lg text-[11px] transition-all border",
                    readerFont === f.key
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-transparent hover:bg-white/5"
                  )}
                  style={{ fontFamily: f.family }}
                >
                  <span className="block font-medium truncate">{f.label}</span>
                  <span className="block text-[9px] opacity-40 mt-0.5">{f.style}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Font size */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium opacity-60">Font Size</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setFontSize((s) => Math.max(70, s - 10))} className="p-1.5 rounded-lg opacity-60 hover:opacity-100"><Minus className="h-3.5 w-3.5" /></button>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${currentTheme.fg}15` }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((fontSize - 70) / 80) * 100}%`, background: "rgb(59,130,246)" }} />
              </div>
              <button onClick={() => setFontSize((s) => Math.min(150, s + 10))} className="p-1.5 rounded-lg opacity-60 hover:opacity-100"><Plus className="h-3.5 w-3.5" /></button>
              <span className="text-xs opacity-50 min-w-[3rem] text-right">{fontSize}%</span>
            </div>
          </div>
          {/* Font color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-60">Font Color</span>
              {fontColor && (
                <button onClick={() => setFontColor(null)} className="text-[10px] opacity-40 hover:opacity-80 underline">
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { color: null, label: "Theme" },
                { color: "#ffffff", label: "White" },
                { color: "#e8e3d8", label: "Cream" },
                { color: "#f5c842", label: "Gold" },
                { color: "#a8d8a0", label: "Sage" },
                { color: "#8ecae6", label: "Sky" },
                { color: "#f4a0b8", label: "Rose" },
                { color: "#c9a0e8", label: "Lavender" },
                { color: "#ff8c42", label: "Amber" },
                { color: "#b0b0b0", label: "Gray" },
              ].map(({ color, label }) => (
                <button
                  key={label}
                  title={label}
                  onClick={() => setFontColor(color)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                    (fontColor === color) ? "border-blue-500 scale-110" : "border-transparent"
                  )}
                  style={{
                    background: color ?? `linear-gradient(135deg, ${currentTheme.fg} 50%, ${currentTheme.bg} 50%)`,
                  }}
                />
              ))}
              {/* Custom color picker */}
              <label title="Custom color" className={cn("h-6 w-6 rounded-full border-2 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-110 transition-all", fontColor && ![null,"#ffffff","#e8e3d8","#f5c842","#a8d8a0","#8ecae6","#f4a0b8","#c9a0e8","#ff8c42","#b0b0b0"].includes(fontColor) ? "border-blue-500 scale-110" : "border-dashed border-opacity-40")} style={{ borderColor: `${currentTheme.fg}60` }}>
                <span className="text-[9px] opacity-50">+</span>
                <input type="color" value={fontColor && fontColor !== null ? fontColor : currentTheme.fg} onChange={(e) => setFontColor(e.target.value)} className="absolute opacity-0 w-0 h-0" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Table of Contents panel ───────────────────── */}
      {showToc && (
        <div className="absolute left-4 top-12 z-[55] w-80 max-h-[75vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in animate-in-1" style={{ background: currentTheme.bg, border: `1px solid ${currentTheme.fg}15` }}>
          <div className="px-4 py-3 space-y-2" style={{ borderBottom: `1px solid ${currentTheme.fg}10` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Contents</span>
              <button onClick={() => setShowToc(false)} className="opacity-40 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-30" />
              <input
                type="text"
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                placeholder="Search chapters..."
                className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: `${currentTheme.fg}08`,
                  color: currentTheme.fg,
                  border: `1px solid ${currentTheme.fg}10`,
                }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filteredToc.length === 0 ? (
              <div className="p-6 text-center opacity-40">
                <p className="text-xs">No chapters found</p>
              </div>
            ) : (
              filteredToc.map((item) => renderTocItem(item))
            )}
          </div>
          {/* Current position indicator */}
          <div className="px-4 py-2 text-[10px] opacity-30" style={{ borderTop: `1px solid ${currentTheme.fg}10` }}>
            {progress}% through book
          </div>
        </div>
      )}

      {/* ── Highlights & Notes panel ─────────────────── */}
      {showBookmarks && (
        <div className="absolute right-4 top-12 z-[55] w-80 max-h-[75vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in animate-in-1" style={{ background: currentTheme.bg, border: `1px solid ${currentTheme.fg}15` }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${currentTheme.fg}10` }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Highlights & Notes</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full opacity-40" style={{ background: `${currentTheme.fg}10` }}>{bookmarksList.length}</span>
            </div>
            <button onClick={() => setShowBookmarks(false)} className="opacity-40 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex-1 overflow-auto">
            {bookmarksList.length === 0 ? (
              <div className="p-8 text-center opacity-40">
                <Highlighter className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-xs font-medium mb-1">No highlights yet</p>
                <p className="text-[10px] opacity-60">Select text while reading to highlight and add notes</p>
              </div>
            ) : (
              <div>
                {Array.from(highlightsByChapter.entries()).map(([chapter, items]) => (
                  <div key={chapter}>
                    <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider opacity-30 sticky top-0" style={{ background: currentTheme.bg }}>
                      {chapter}
                    </div>
                    {items.map((bm) => {
                      const colorObj = HIGHLIGHT_COLORS.find((c) => c.key === bm.color);
                      return (
                        <div key={bm.id} className="px-4 py-3 group hover:bg-white/[0.03] transition-colors" style={{ borderBottom: `1px solid ${currentTheme.fg}06` }}>
                          <div className="flex items-start gap-2.5">
                            <div
                              className="w-1 shrink-0 rounded-full self-stretch"
                              style={{ background: colorObj?.solid || HIGHLIGHT_COLORS[0].solid, minHeight: "20px" }}
                            />
                            <div className="flex-1 min-w-0">
                              {bm.highlightText && (
                                <p className="text-xs leading-relaxed italic opacity-80">
                                  &ldquo;{bm.highlightText}&rdquo;
                                </p>
                              )}
                              {bm.note && (
                                <div className="flex items-start gap-1.5 mt-2 px-2 py-1.5 rounded-lg" style={{ background: `${currentTheme.fg}06` }}>
                                  <StickyNote className="h-3 w-3 shrink-0 mt-0.5 opacity-40" />
                                  <p className="text-[11px] opacity-70">{bm.note}</p>
                                </div>
                              )}
                              <p className="text-[9px] opacity-30 mt-1.5">
                                {new Date(bm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteHighlight(bm.id)}
                              className="opacity-0 group-hover:opacity-30 hover:!opacity-80 shrink-0 p-1 rounded transition-opacity"
                              title="Delete highlight"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Highlight popup (appears on text selection) ── */}
      {showHighlightPopup && selectedText && (
        <div
          className="fixed z-[60] animate-in animate-in-1"
          style={{
            left: `${highlightPopupPos.x}px`,
            top: `${highlightPopupPos.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: currentTheme.bg,
              border: `1px solid ${currentTheme.fg}20`,
            }}
          >
            {!showNoteInput ? (
              <div className="flex items-center gap-1 p-2">
                {/* Color circles for quick highlight */}
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => handleQuickHighlight(c.key)}
                    disabled={savingHighlight}
                    className="w-7 h-7 rounded-full border-2 border-transparent hover:scale-110 transition-transform flex items-center justify-center"
                    style={{ background: c.solid }}
                    title={`Highlight ${c.label}`}
                  />
                ))}
                <div className="w-px h-5 mx-1" style={{ background: `${currentTheme.fg}15` }} />
                {/* Note button */}
                <button
                  onClick={() => {
                    setShowNoteInput(true);
                    setPendingHighlightColor("yellow");
                  }}
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                  title="Add note"
                >
                  <StickyNote className="h-4 w-4" />
                </button>
                {/* Save as quote */}
                <button
                  onClick={() => handleQuickHighlight("yellow")}
                  disabled={savingHighlight}
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                  title="Save as quote"
                >
                  <Quote className="h-4 w-4" />
                </button>
                {/* Dismiss */}
                <button
                  onClick={() => {
                    setShowHighlightPopup(false);
                    setSelectedText("");
                  }}
                  className="p-1.5 rounded-lg opacity-30 hover:opacity-60 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3 w-72 space-y-3">
                {/* Selected text preview */}
                <p className="text-[11px] italic opacity-60 line-clamp-2">&ldquo;{selectedText}&rdquo;</p>
                {/* Color picker */}
                <div className="flex items-center gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setPendingHighlightColor(c.key)}
                      className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-all", pendingHighlightColor === c.key ? "ring-2 ring-offset-1 scale-110" : "hover:scale-105")}
                      style={{ background: c.solid, ringColor: c.solid, ringOffsetColor: currentTheme.bg } as any}
                    >
                      {pendingHighlightColor === c.key && <Check className="h-3 w-3 text-white" />}
                    </button>
                  ))}
                </div>
                {/* Note textarea */}
                <textarea
                  ref={noteInputRef}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none"
                  style={{
                    background: `${currentTheme.fg}08`,
                    color: currentTheme.fg,
                    border: `1px solid ${currentTheme.fg}12`,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSaveWithNote();
                    }
                  }}
                />
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setShowNoteInput(false); }}
                    className="text-[11px] opacity-40 hover:opacity-70 transition-opacity"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] opacity-20">Ctrl+Enter</span>
                    <button
                      onClick={handleSaveWithNote}
                      disabled={savingHighlight}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{ background: currentTheme.link, color: currentTheme.bg }}
                    >
                      {savingHighlight ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Triangle pointer */}
          <div
            className="w-3 h-3 mx-auto rotate-45 -mt-1.5"
            style={{ background: currentTheme.bg, borderRight: `1px solid ${currentTheme.fg}20`, borderBottom: `1px solid ${currentTheme.fg}20` }}
          />
        </div>
      )}

      {/* ── EPUB Content ──────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: currentTheme.bg }}
        onClick={() => {
          // Close popup if clicking outside
          if (showHighlightPopup && !showNoteInput) {
            // Don't close immediately - let the selection handler work
          }
        }}
      >
        {epubUrl ? (
          <>
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ color: `${currentTheme.fg}60` }}>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Loading book...</span>
              </div>
            )}
            <div ref={viewerRef} className="w-full h-full" />

            {/* Click zones for page navigation */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[15%] cursor-pointer z-10"
              onClick={() => renditionRef.current?.prev()}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-[15%] cursor-pointer z-10"
              onClick={() => renditionRef.current?.next()}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="ambient-ring inline-flex items-center justify-center mb-8">
              <BookOpen className="h-16 w-16 opacity-20" />
            </div>
            <h2 className="text-xl font-medium">No file uploaded</h2>
            <p className="opacity-50 mt-2 max-w-md text-sm">Upload a PDF or EPUB to start reading.</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.epub" onChange={handleUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      {epubUrl && (
        <div
          className={cn(
            "flex items-center gap-4 px-5 py-2.5 shrink-0 transition-all duration-300 z-50",
            isFullscreen && (showBars ? "absolute bottom-0 left-0 right-0" : "absolute bottom-0 left-0 right-0 opacity-0 translate-y-full pointer-events-none")
          )}
          style={{ background: `${currentTheme.bg}ee`, backdropFilter: "blur(20px) saturate(1.8)", borderTop: `1px solid ${currentTheme.fg}10` }}
        >
          <button onClick={() => renditionRef.current?.prev()} className="p-1 opacity-40 hover:opacity-100 transition-opacity">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1 rounded-full cursor-pointer" style={{ background: `${currentTheme.fg}12` }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: currentTheme.link }} />
          </div>
          <span className="text-xs opacity-40 tabular-nums min-w-[3rem] text-right">{progress}%</span>
          {sessionStartProgress !== null && progress - sessionStartProgress > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${currentTheme.link}20`, color: currentTheme.link }}>
              +{progress - sessionStartProgress}% today
            </span>
          )}
          <button onClick={() => renditionRef.current?.next()} className="p-1 opacity-40 hover:opacity-100 transition-opacity">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
