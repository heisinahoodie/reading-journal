"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBook } from "@/lib/actions/books";

interface RatingStarsProps {
  bookId?: string;
  rating: number | null;
  editable?: boolean;
  size?: number;
  className?: string;
}

export function RatingStars({
  bookId,
  rating,
  editable = false,
  size = 16,
  className,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const currentRating = rating ?? 0;
  const displayRating = hovered !== null ? hovered : currentRating;

  function handleClick(star: number) {
    if (!editable || !bookId) return;
    startTransition(async () => {
      await updateBook(bookId, { rating: star });
    });
  }

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => editable && setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            disabled={!editable || isPending}
            onClick={() => handleClick(star)}
            onMouseEnter={() => editable && setHovered(star)}
            className={cn(
              "transition-colors",
              editable
                ? "cursor-pointer hover:scale-110 disabled:cursor-wait"
                : "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
