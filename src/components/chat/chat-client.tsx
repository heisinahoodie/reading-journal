"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Plus,
  BookOpen,
  Sparkles,
  Save,
  ChevronDown,
  Loader2,
  Settings,
  FileText,
  Trash2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  getMessagesForConversation,
  deleteConversation,
} from "@/lib/actions/conversations";

type Conversation = {
  id: string;
  bookId: string | null;
  title: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  genres: string[];
  status: string;
  pdfPath?: string | null;
};

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

function renderMarkdown(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, blockIndex) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Headings
    if (trimmed.startsWith("### ")) {
      return (
        <h4
          key={blockIndex}
          className="text-sm font-bold mt-3 mb-1 text-card-foreground"
        >
          {renderInline(trimmed.slice(4))}
        </h4>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3
          key={blockIndex}
          className="text-sm font-bold mt-3 mb-1 text-card-foreground"
        >
          {renderInline(trimmed.slice(3))}
        </h3>
      );
    }

    // Bullet list: consecutive lines starting with - or *
    const lines = trimmed.split("\n");
    const isList = lines.every(
      (l) => /^[-*]\s+/.test(l.trim()) || l.trim() === ""
    );
    if (isList) {
      return (
        <ul key={blockIndex} className="list-disc list-inside space-y-0.5 my-1">
          {lines
            .filter((l) => l.trim() !== "")
            .map((line, li) => (
              <li key={li} className="text-sm leading-relaxed">
                {renderInline(line.trim().replace(/^[-*]\s+/, ""))}
              </li>
            ))}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p key={blockIndex} className="my-1">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] != null) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] != null) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] != null) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary"
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

export function ChatClient({
  initialConversations,
  books,
  initialBookId = null,
}: {
  initialConversations: Conversation[];
  books: Book[];
  initialBookId?: string | null;
}) {
  const router = useRouter();
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(initialBookId);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [chatStarted, setChatStarted] = useState(!!initialBookId);
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bookPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        bookPickerRef.current &&
        !bookPickerRef.current.contains(e.target as Node)
      ) {
        setShowBookPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadConversation(id: string) {
    const msgs = await getMessagesForConversation(id);
    setMessages(msgs);
    setActiveConversationId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv?.bookId) setSelectedBookId(conv.bookId);
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setSelectedBookId(null);
    setChatStarted(true);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setIsLoading(true);

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId: activeConversationId,
          bookId: selectedBookId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? {
                  ...m,
                  content:
                    error.error || "Something went wrong. Please try again.",
                }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let newConversationId = activeConversationId;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text") {
                  fullText += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: fullText }
                        : m
                    )
                  );
                } else if (parsed.type === "conversation") {
                  newConversationId = parsed.id;
                  setActiveConversationId(parsed.id);
                }
              } catch {
                // skip non-JSON lines
              }
            }
          }
        }
      }

      if (newConversationId && newConversationId !== activeConversationId) {
        setActiveConversationId(newConversationId);
      }

      router.refresh();
      // Refresh conversations list
      const refreshRes = await fetch("/api/chat?list=conversations");
      if (refreshRes.ok) {
        // Let server component re-render handle it
      }
      router.refresh();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: "Failed to connect. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSummarize() {
    if (!activeConversationId || isSummarizing) return;
    setIsSummarizing(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "Please provide a brief summary of our conversation so far.",
          conversationId: activeConversationId,
          bookId: selectedBookId,
          summarize: true,
        }),
      });

      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let summaryText = "";
        const summaryMessage: Message = {
          id: `temp-summary-${Date.now()}`,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, summaryMessage]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "text") {
                    summaryText += parsed.content;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === summaryMessage.id
                          ? { ...m, content: summaryText }
                          : m
                      )
                    );
                  }
                } catch {
                  // skip
                }
              }
            }
          }
        }
        router.refresh();
      }
    } finally {
      setIsSummarizing(false);
    }
  }

  async function handleSaveAsEntry() {
    if (!selectedBookId || !activeConversationId) return;
    setSavingMessageId("synthesizing");

    try {
      const res = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId,
          conversationId: activeConversationId,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSavingMessageId(null);
    }
  }

  async function handleDeleteConversation(id: string) {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      startNewChat();
    }
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  function getSuggestions(): string[] {
    if (!selectedBook) {
      return [
        "Recommend a book for me",
        "What should I read next?",
        "Compare two books I've read",
      ];
    }
    const suggestions = [
      `What are the main themes of "${selectedBook.title}"?`,
      `Analyze the characters in this book`,
    ];
    if (selectedBook.pdfPath) {
      suggestions.push("Discuss chapter 1 with me");
    } else {
      suggestions.push("What's the significance of the title?");
    }
    suggestions.push(`Recommend books similar to "${selectedBook.title}"`);
    return suggestions;
  }

  // Show intro screen only when no conversations exist and user hasn't clicked start
  if (conversations.length === 0 && messages.length === 0 && !chatStarted) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Literary Assistant</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Discuss your books with an AI that understands your reading
              journey. Get insights, explore themes, and deepen your
              understanding.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Settings className="h-4 w-4 text-primary" />
              <span>Get started</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Add your Anthropic API key in{" "}
              <a
                href="/settings"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Settings
              </a>{" "}
              to start chatting. Your key is stored locally and never shared.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={startNewChat}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Start a conversation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-6 -my-6">
      {/* Sidebar - Conversation List */}
      <div className="w-72 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <button
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground btn-glow"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-start gap-2 border-b border-border/50 px-3 py-3 cursor-pointer transition-colors",
                activeConversationId === conv.id
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "hover:bg-accent/50"
              )}
            >
              <button
                onClick={() => loadConversation(conv.id)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(conv.updatedAt)}
                </p>
                {conv.summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {conv.summary}
                  </p>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with book picker */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative" ref={bookPickerRef}>
              <button
                onClick={() => setShowBookPicker(!showBookPicker)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  selectedBookId
                    ? "border-primary/30 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="max-w-[200px] truncate">
                  {selectedBook
                    ? `${selectedBook.title}`
                    : "Select a book context"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>

              {showBookPicker && (
                <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-xl border border-border bg-popover p-1 shadow-xl">
                  <button
                    onClick={() => {
                      setSelectedBookId(null);
                      setShowBookPicker(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    General discussion
                  </button>
                  <div className="my-1 h-px bg-border" />
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBookId(book.id);
                        setShowBookPicker(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        selectedBookId === book.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <div className="text-left min-w-0 flex-1">
                        <p className="truncate font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {book.author}
                        </p>
                      </div>
                      {book.pdfPath && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          PDF
                        </span>
                      )}
                    </button>
                  ))}
                  {books.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No books in library yet
                    </p>
                  )}
                </div>
              )}
            </div>

            {selectedBook?.pdfPath && (
              <span className="flex items-center gap-1 text-xs text-primary/70">
                <FileText className="h-3 w-3" />
                PDF content available
              </span>
            )}

            {activeConversation && (
              <span className="text-sm font-medium text-foreground">
                {activeConversation.title}
              </span>
            )}
          </div>

          {activeConversationId && messages.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedBookId && (
                <button
                  onClick={handleSaveAsEntry}
                  disabled={savingMessageId === "synthesizing"}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {savingMessageId === "synthesizing" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save as Journal Entry
                </button>
              )}
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isSummarizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Summarize
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-sm text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {selectedBook
                    ? `Let's discuss "${selectedBook.title}"`
                    : "Start a conversation"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedBook
                    ? `Ask questions about themes, characters, symbolism, or anything else about this book by ${selectedBook.author}.`
                    : "Select a book for context or just start a general literary discussion. Ask about themes, get recommendations, or explore ideas."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {getSuggestions().map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "message-user text-foreground rounded-br-md"
                    : "message-assistant text-card-foreground rounded-bl-md"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="break-words prose-sm">
                    {msg.content ? renderMarkdown(msg.content) : null}
                    {isLoading && msg.content === "" && (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                )}

              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedBook
                    ? `Ask about "${selectedBook.title}"...`
                    : "Type a message..."
                }
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50 transition-colors"
                style={{ maxHeight: "150px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-2">
            AI responses are for discussion purposes. Press Enter to send, Shift
            + Enter for new line.
          </p>
        </div>
      </div>
    </div>
  );
}
