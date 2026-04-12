"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { setApiKey } from "@/lib/actions/conversations";
import {
  Save,
  Key,
  Palette,
  Bot,
  Check,
  Eye,
  EyeOff,
  Target,
} from "lucide-react";

const themeOptions = [
  {
    value: "dark",
    label: "Obsidian",
    description: "Pure black, amber embers",
    bg: "#000000",
    card: "#0a0a0c",
    primary: "#c9982e",
    fg: "#e4e2dd",
  },
  {
    value: "light",
    label: "Parchment",
    description: "Aged paper, warm sepia",
    bg: "#f3ece0",
    card: "#faf6ef",
    primary: "#8b6914",
    fg: "#1c1917",
  },
  {
    value: "forest",
    label: "Forest",
    description: "Deep evergreen, moss glow",
    bg: "#0a1a0f",
    card: "#0f2016",
    primary: "#4ade80",
    fg: "#d4e0d8",
  },
  {
    value: "ocean",
    label: "Ocean",
    description: "Deep sea blue, calming tides",
    bg: "#070d1a",
    card: "#0c1526",
    primary: "#38bdf8",
    fg: "#d0daea",
  },
  {
    value: "rose",
    label: "Rose",
    description: "Warm blush on cream",
    bg: "#faf5f5",
    card: "#fff8f8",
    primary: "#e11d48",
    fg: "#1c1517",
  },
  {
    value: "midnight",
    label: "Midnight",
    description: "Indigo twilight, violet glow",
    bg: "#09090f",
    card: "#0e0e18",
    primary: "#a78bfa",
    fg: "#ddd8ea",
  },
];

const models = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet (Recommended)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku (Fast & cheap)" },
  { id: "claude-opus-4-20250514", label: "Claude Opus (Deep analysis)" },
];

export function SettingsClient({
  currentApiKey,
  currentModel,
  currentReadingGoal,
}: {
  currentApiKey: string;
  currentModel: string;
  currentReadingGoal: string;
}) {
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKeyState] = useState(currentApiKey);
  const [model, setModel] = useState(currentModel);
  const [readingGoal, setReadingGoal] = useState(currentReadingGoal);
  const [goalSaved, setGoalSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  async function handleSaveApiKey() {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      await setApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveModel(modelId: string) {
    setModel(modelId);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "ai_model", value: modelId }),
    });
  }

  async function handleSaveGoal() {
    const goal = parseInt(readingGoal);
    if (isNaN(goal) || goal < 1) return;
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "yearly_reading_goal", value: String(goal) }),
    });
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="animate-in animate-in-1">
        <h1>Settings</h1>
        <p className="quote-text text-muted-foreground mt-1 text-base">
          Configure your reading journal
        </p>
      </div>

      {/* API Key */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in animate-in-2">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">API Key</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your Anthropic API key to enable AI chat, recommendations, and
          discussion summaries.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-sm pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            disabled={saving || !apiKey.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in animate-in-3">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Theme</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose your preferred appearance.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`group relative rounded-xl border-2 p-1 transition-all duration-200 ${
                theme === t.value
                  ? "border-primary ring-1 ring-primary/30 scale-[1.02]"
                  : "border-border hover:border-primary/40 hover:scale-[1.01]"
              }`}
            >
              {/* Mini preview */}
              <div
                className="rounded-lg overflow-hidden h-20 relative"
                style={{ background: t.bg }}
              >
                {/* Fake sidebar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-6"
                  style={{ background: t.card, borderRight: `1px solid ${t.primary}22` }}
                >
                  <div className="mt-2 mx-1 space-y-1">
                    <div className="h-1 rounded-full" style={{ background: t.primary, opacity: 0.7 }} />
                    <div className="h-1 rounded-full" style={{ background: t.fg, opacity: 0.15 }} />
                    <div className="h-1 rounded-full" style={{ background: t.fg, opacity: 0.15 }} />
                  </div>
                </div>
                {/* Fake content */}
                <div className="absolute left-8 top-2 right-2 space-y-1.5">
                  <div className="h-2 w-16 rounded-sm" style={{ background: t.fg, opacity: 0.3 }} />
                  <div className="flex gap-1">
                    <div className="h-8 flex-1 rounded" style={{ background: t.card }} />
                    <div className="h-8 flex-1 rounded" style={{ background: t.card }} />
                  </div>
                  <div className="h-3 w-12 rounded-sm" style={{ background: t.primary, opacity: 0.5 }} />
                </div>
                {/* Active checkmark */}
                {theme === t.value && (
                  <div
                    className="absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center"
                    style={{ background: t.primary }}
                  >
                    <Check className="h-2.5 w-2.5" style={{ color: t.bg }} />
                  </div>
                )}
              </div>
              {/* Label */}
              <div className="px-1.5 py-1.5 text-left">
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* AI Model */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in animate-in-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Model</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose which Claude model to use for discussions and recommendations.
        </p>
        <div className="space-y-2">
          {models.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                model === m.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent"
              }`}
            >
              <input
                type="radio"
                name="model"
                value={m.id}
                checked={model === m.id}
                onChange={() => handleSaveModel(m.id)}
                className="accent-primary"
              />
              <span className="text-sm font-medium">{m.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Reading Goal */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in animate-in-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Reading Goal</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Set a yearly reading goal to track how many books you want to finish this year.
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            max={365}
            value={readingGoal}
            onChange={(e) => setReadingGoal(e.target.value)}
            placeholder="e.g. 24"
            className="w-24 rounded-lg bg-background border border-border px-4 py-2.5 text-sm text-center"
          />
          <span className="text-sm text-muted-foreground">books this year</span>
          <button
            onClick={handleSaveGoal}
            disabled={!readingGoal || parseInt(readingGoal) < 1}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 ml-auto"
          >
            {goalSaved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {goalSaved ? "Saved!" : "Save"}
          </button>
        </div>
      </section>

      {/* About */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-3 animate-in animate-in-6">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Reading Journal is your personal AI-powered reading companion. Track
          books, write journal entries, discuss chapters with Claude, and
          discover new books based on your reading history. Inspired by Notion,
          built with love.
        </p>
        <p className="text-xs text-muted-foreground/60" style={{ fontFamily: "var(--font-mono), monospace" }}>
          Built with Next.js, Tailwind CSS, SQLite, and Claude
        </p>
      </section>
    </div>
  );
}
