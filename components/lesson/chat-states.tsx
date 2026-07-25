"use client";

import type { ChatMessage } from "@/lib/ai/chat-types";

/**
 * Reusable chat UI state components.
 * These are intentionally presentational and free of chat logic so they can
 * be composed into any Gemma-style chat surface.
 */

const THINKING_LABEL = "Gemma is thinking...";
const ERROR_LABEL = "Gemma is currently unavailable. Please try again.";
const EMPTY_LABEL = "Ask Gemma anything about this lesson.";

/** Assistant-aligned bubble used by success messages and the thinking dot. */
function AssistantBubble({
  children,
  className = "",
  shape = "rounded-tl-sm",
}: {
  children: React.ReactNode;
  className?: string;
  shape?: string;
}) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl ${shape} bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--foreground)] ${className}`}
    >
      {children}
    </div>
  );
}

export function ChatThinkingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label={THINKING_LABEL}>
      <AssistantBubble className="flex items-center gap-1 py-3">
        <span className="sr-only">{THINKING_LABEL}</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-stem-pulse rounded-full bg-[var(--muted)]"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </AssistantBubble>
    </div>
  );
}

export function ChatErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const display = message || ERROR_LABEL;
  const isDefault = !message;
  return (
    <div className="flex flex-col items-start gap-1.5" role="alert">
      <AssistantBubble
        shape="rounded-tl-sm"
        className={`border ${isDefault ? "border-[color-mix(in_srgb,var(--secondary)_35%,transparent)]" : "border-[var(--secondary)]"}`}
      >
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--secondary)]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="13.6" r="0.9" fill="currentColor" />
          </svg>
          <p className="text-sm text-[var(--foreground)]">{display}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10a6 6 0 1 1 1.8 4.3M4 10V5m0 5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Try again
        </button>
      </AssistantBubble>
    </div>
  );
}

export function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)]">
        <svg className="h-6 w-6 text-[var(--primary-ink)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4a7 7 0 0 0-4 12.7V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="11.5" r="1" fill="currentColor" />
          <circle cx="15" cy="11.5" r="1" fill="currentColor" />
        </svg>
      </div>
      <p className="text-sm text-[var(--muted)]">{EMPTY_LABEL}</p>
    </div>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
          isUser
            ? "rounded-tr-sm bg-[var(--primary)] text-[var(--surface)]"
            : "rounded-tl-sm bg-[var(--surface-2)] text-[var(--foreground)]",
        ].join(" ")}
      >
        {/* Keep messages newline-friendly for multi-line student input. */}
        <span className="whitespace-pre-wrap break-words">{message.text}</span>
      </div>
    </div>
  );
}