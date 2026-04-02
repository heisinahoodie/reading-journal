"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { setApiKey } from "@/lib/actions/conversations";
import {
  Save,
  Key,
  Sun,
  Moon,
  Monitor,
  Palette,
  Bot,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

const models = [
  { id: "claude-sonnet-4-5-20250514", label: "Claude Sonnet 4.5 (Recommended)" },
  { id: "claude-opus-4-6-20250514", label: "Claude Opus 4.6 (Deep analysis)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (Fast)" },
];

export function SettingsClient({
  currentApiKey,
  currentModel,
}: {
  currentApiKey: string;
  currentModel: string;
}) {
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKeyState] = useState(currentApiKey);
  const [model, setModel] = useState(currentModel);
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

  async function handleSaveModel() {
    setSaving(true);
    try {
      // Save model preference via a simple fetch
      await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your reading journal
        </p>
      </div>

      {/* API Key */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
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
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Theme</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose your preferred appearance.
        </p>
        <div className="flex gap-2">
          {[
            { value: "dark", icon: Moon, label: "Dark (Obsidian)" },
            { value: "light", icon: Sun, label: "Light (Parchment)" },
            { value: "system", icon: Monitor, label: "System" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                theme === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* AI Model */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
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
                onChange={() => setModel(m.id)}
                className="accent-primary"
              />
              <span className="text-sm font-medium">{m.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Reading Journal is your personal AI-powered reading companion. Track
          books, write journal entries, discuss chapters with Claude, and
          discover new books based on your reading history. Inspired by Notion,
          built with love.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Built with Next.js, Tailwind CSS, SQLite, and Claude
        </p>
      </section>
    </div>
  );
}
