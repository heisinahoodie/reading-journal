"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, GripVertical } from "lucide-react";
import { cn, getProgressPercent } from "@/lib/utils";
import { updateBook } from "@/lib/actions/books";
import {
  STATUS_LABELS,
  READING_STATUSES,
  type ReadingStatus,
} from "@/lib/constants";
import { RatingStars } from "@/components/books/rating-stars";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

interface Column {
  status: (typeof READING_STATUSES)[number];
  books: Book[];
}

interface BoardClientProps {
  columns: Column[];
}

/* ------------------------------------------------------------------ */
/*  Column styling                                                     */
/* ------------------------------------------------------------------ */

const columnAccents: Record<ReadingStatus, string> = {
  "to-read": "border-t-muted-foreground/40",
  reading: "border-t-blue-500",
  finished: "border-t-green-500",
};

const columnBg: Record<ReadingStatus, string> = {
  "to-read": "bg-muted/30",
  reading: "bg-blue-500/5",
  finished: "bg-green-500/5",
};

/* ------------------------------------------------------------------ */
/*  Draggable book card                                                */
/* ------------------------------------------------------------------ */

function SortableBookCard({ book }: { book: Book }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-border bg-card p-4 shadow-sm transition-all",
        "hover:border-primary/30 hover:shadow-md",
        isDragging && "opacity-30"
      )}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        {/* Cover thumbnail */}
        <div className="h-12 w-9 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary/60" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold leading-tight truncate text-card-foreground">
            {book.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {book.author}
          </p>

          {/* Progress bar for reading */}
          {book.status === "reading" && book.totalPages && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                <span>
                  p.{book.currentPage || 0}/{book.totalPages}
                </span>
                <span>{getProgressPercent(book.currentPage, book.totalPages)}%</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${getProgressPercent(book.currentPage, book.totalPages)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Rating for finished */}
          {book.status === "finished" && (
            <div className="mt-1.5">
              <RatingStars rating={book.rating} size={12} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Overlay card shown while dragging */
function DragOverlayCard({ book }: { book: Book }) {
  return (
    <div className="rounded-xl border border-primary/40 bg-card p-4 shadow-xl w-72">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground/40">
          <GripVertical size={16} />
        </div>
        <div className="h-12 w-9 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold leading-tight truncate text-card-foreground">
            {book.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {book.author}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Droppable column                                                   */
/* ------------------------------------------------------------------ */

function KanbanColumn({
  status,
  books,
  isOver,
}: {
  status: ReadingStatus;
  books: Book[];
  isOver: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border-t-4 border border-border min-h-[60vh] transition-all duration-200",
        columnAccents[status],
        columnBg[status],
        isOver && "drop-zone-active"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          {STATUS_LABELS[status]}
        </h3>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {books.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2">
        <SortableContext
          items={books.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {books.map((book) => (
            <SortableBookCard key={book.id} book={book} />
          ))}
        </SortableContext>

        {books.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground/60">
              Drop books here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Board client                                                       */
/* ------------------------------------------------------------------ */

export function BoardClient({ columns: initialColumns }: BoardClientProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  /* Find which column a book lives in */
  function findColumn(bookId: string): ReadingStatus | null {
    for (const col of columns) {
      if (col.books.some((b) => b.id === bookId)) return col.status;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    for (const col of columns) {
      const book = col.books.find((b) => b.id === id);
      if (book) {
        setActiveBook(book);
        break;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }

    /* Determine which column we are over */
    const overId = over.id as string;
    const isColumnId = READING_STATUSES.includes(overId as ReadingStatus);

    if (isColumnId) {
      setOverColumn(overId);
    } else {
      const col = findColumn(overId);
      setOverColumn(col);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveBook(null);
    setOverColumn(null);

    if (!over) return;

    const bookId = active.id as string;
    const sourceStatus = findColumn(bookId);

    /* Determine target column */
    const overId = over.id as string;
    const isColumnId = READING_STATUSES.includes(overId as ReadingStatus);
    const targetStatus = isColumnId
      ? (overId as ReadingStatus)
      : findColumn(overId);

    if (!sourceStatus || !targetStatus || sourceStatus === targetStatus) return;

    /* Optimistic update */
    setColumns((prev) =>
      prev.map((col) => {
        if (col.status === sourceStatus) {
          return { ...col, books: col.books.filter((b) => b.id !== bookId) };
        }
        if (col.status === targetStatus) {
          const book = prev
            .find((c) => c.status === sourceStatus)!
            .books.find((b) => b.id === bookId)!;
          return {
            ...col,
            books: [{ ...book, status: targetStatus }, ...col.books],
          };
        }
        return col;
      })
    );

    /* Persist */
    startTransition(async () => {
      await updateBook(bookId, { status: targetStatus });
    });
  }

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute -top-2 right-0 text-xs text-muted-foreground animate-pulse">
          Saving...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <SortableContext
              key={col.status}
              id={col.status}
              items={col.books.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                status={col.status}
                books={col.books}
                isOver={overColumn === col.status}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeBook ? <DragOverlayCard book={activeBook} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
