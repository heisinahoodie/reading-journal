"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileUp,
  BookOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { updateBook } from "@/lib/actions/books";

// Dynamically import react-pdf to avoid SSR/Turbopack CSS issues
const Document = dynamic(
  () => import("react-pdf").then((mod) => {
    mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    return { default: mod.Document };
  }),
  { ssr: false }
);
const Page_ = dynamic(
  () => import("react-pdf").then((mod) => ({ default: mod.Page })),
  { ssr: false }
);

interface PdfReaderClientProps {
  bookId: string;
  title: string;
  author: string;
  pdfPath: string | null;
  currentPage: number | null;
  totalPages: number | null;
}

export function PdfReaderClient({
  bookId,
  title,
  author,
  pdfPath,
  currentPage: initialPage,
  totalPages: initialTotalPages,
}: PdfReaderClientProps) {
  const router = useRouter();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage || 1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBars, setShowBars] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for fullscreen changes (e.g. user presses Escape)
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
      setShowBars(false);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Show bars when mouse moves to top/bottom 60px in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    function onMouseMove(e: MouseEvent) {
      const nearEdge = e.clientY < 60 || e.clientY > window.innerHeight - 60;
      if (nearEdge) {
        setShowBars(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setShowBars(false), 3000);
      }
    }
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // pdfPath is stored as relative (e.g. "pdfs/book-id/file.pdf")
  // Handle both old absolute paths and new relative paths
  const pdfUrl = pdfPath
    ? `/api/files/${pdfPath.replace(/^.*?data[\/\\]uploads[\/\\]/, "").replace(/\\/g, "/")}`
    : null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    // Sync total pages to book if different
    if (numPages !== initialTotalPages) {
      updateBook(bookId, { totalPages: numPages });
    }
  }

  function goToPage(page: number) {
    const clamped = Math.max(1, Math.min(page, numPages || 1));
    setPageNumber(clamped);
    syncPageToBook(clamped);
  }

  // Debounced page sync to avoid hammering the DB
  function syncPageToBook(page: number) {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      updateBook(bookId, { currentPage: page });
    }, 1000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".pdf")) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookId", bookId);
    formData.append("type", "pdf");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setUploading(false);
    }
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4));
  const zoomFit = () => setScale(1.0);

  const progress = numPages ? Math.round((pageNumber / numPages) * 100) : 0;

  return (
    <div ref={readerRef} className={`flex flex-col -mx-6 -my-8 ${isFullscreen ? "h-screen bg-background" : "h-[calc(100vh-4rem)]"}`}>
      {/* Top bar - auto-hides in fullscreen, shows on mouse near edge */}
      <div className={`flex items-center justify-between border-b border-border bg-card px-4 py-2 shrink-0 transition-all duration-300 ${isFullscreen ? `absolute top-0 left-0 right-0 z-50 ${showBars ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}` : ""}`}>
        <div className="flex items-center gap-3">
          <Link
            href={`/books/${bookId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{author}</p>
          </div>
        </div>

        {pdfUrl && (
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={zoomFit}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Fit to width"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-background">
        {pdfUrl ? (
          <div className="flex flex-col items-center py-6">
            {loading && (
              <div className="flex items-center gap-2 py-20 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading PDF...</span>
              </div>
            )}
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading=""
              className="animate-in animate-in-1"
            >
              <Page_
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-xl rounded-lg overflow-hidden"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        ) : (
          /* No PDF uploaded - show upload prompt */
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="ambient-ring inline-flex items-center justify-center mb-8">
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl not-italic">No PDF uploaded</h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Upload a PDF to read {title} right here in your journal.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground btn-glow disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
        )}
      </div>

      {/* Bottom navigation bar */}
      {pdfUrl && numPages && (
        <div className={`flex items-center justify-between border-t border-border bg-card px-4 py-2 shrink-0 transition-all duration-300 ${isFullscreen ? `absolute bottom-0 left-0 right-0 z-50 ${showBars ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}` : ""}`}>
          <button
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="label-caps">Page</span>
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm"
              />
              <span className="text-sm text-muted-foreground">
                of {numPages}
              </span>
            </div>

            {/* Progress bar */}
            <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full progress-glow transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="label-caps text-primary">{progress}%</span>
            </div>
          </div>

          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
