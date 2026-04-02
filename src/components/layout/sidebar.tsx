"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Table2,
  Kanban,
  GalleryHorizontalEnd,
  MessageCircle,
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/books", icon: Table2, label: "Books" },
  { href: "/board", icon: Kanban, label: "Board" },
  { href: "/gallery", icon: GalleryHorizontalEnd, label: "Gallery" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/discover", icon: Sparkles, label: "Discover" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col sidebar-gradient transition-all duration-300",
        collapsed ? "w-16" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <BookOpen className="h-6 w-6 shrink-0 text-primary" style={{ filter: "drop-shadow(0 0 4px var(--glow-primary))" }} />
        {!collapsed && (
          <span className="text-lg font-display tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            Reading Journal
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "nav-active text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1 border-t border-border px-2 py-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <div className="flex items-center justify-between px-3 py-2">
          {!collapsed && <ThemeToggle />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
