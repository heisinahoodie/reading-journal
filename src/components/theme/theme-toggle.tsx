"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Trees, Waves, Flower2, Eclipse } from "lucide-react";

const themeOrder = ["dark", "light", "forest", "ocean", "rose", "midnight"] as const;

const themeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dark: Moon,
  light: Sun,
  forest: Trees,
  ocean: Waves,
  rose: Flower2,
  midnight: Eclipse,
};

const themeLabels: Record<string, string> = {
  dark: "Obsidian",
  light: "Parchment",
  forest: "Forest",
  ocean: "Ocean",
  rose: "Rose",
  midnight: "Midnight",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const currentIdx = themeOrder.indexOf(theme as (typeof themeOrder)[number]);
  const nextIdx = (currentIdx + 1) % themeOrder.length;
  const nextTheme = themeOrder[nextIdx >= 0 ? nextIdx : 0];
  const Icon = themeIcons[theme || "dark"] || Moon;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
      title={`Switch to ${themeLabels[nextTheme] || nextTheme}`}
    >
      <Icon className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
    </button>
  );
}
