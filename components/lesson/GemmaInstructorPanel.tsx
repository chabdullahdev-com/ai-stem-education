"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, LessonChatContext } from "@/lib/ai/chat-types";
import { sendChatMessage } from "@/lib/ai/chat-client";
import { ChatBubble, ChatEmptyState, ChatErrorState, ChatThinkingIndicator } from "./chat-states";

/**
 * GemmaInstructorPanel — the AI STEM instructor chat interface.
 *
 * Part 2A scope: frontend chat experience only.
 *  - Calls the provider-agnostic `sendChatMessage` client (lib/ai/chat-client),
 *    never Ollama/Gemma directly. The real backend lives at /api/ai/chat and
 *    is implemented in a later part.
 *  - Full message states: user/AI messages, empty, thinking, error w/ retry,
 *    auto-scroll, Enter-to-send, disabled input while pending.
 *
 * Props:
 *  - `context`: student + lesson + step context. Used to build the request
 *    for the future AI backend; NOT rendered to the student.
 */

interface GemmaInstructorPanelProps {
  context: LessonChatContext;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function GemmaInstructorPanel({ context }: GemmaInstructorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Retain the last user message so the "Try again" path can resend it.
  const lastUserTextRef = useRef<string>("");

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest content (messages, thinking, error).
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, hasError]);

  const callGemma = useCallback(
    async (userText: string) => {
      setPending(true);
      setHasError(false);
      setErrorMessage(undefined);

      const userMessage: ChatMessage = {
        id: makeId("u"),
        role: "user",
        text: userText,
        status: "success",
        createdAt: Date.now(),
      };

      const history = [...messages, userMessage];
      setMessages(history);
      lastUserTextRef.current = userText;

      try {
        const response = await sendChatMessage({ context, messages: history });
        const assistantMessage: ChatMessage = {
          id: makeId("g"),
          role: "assistant",
          text: response.text,
          status: "success",
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setHasError(true);
        setErrorMessage(err instanceof Error ? err.message : undefined);
      } finally {
        setPending(false);
      }
    },
    [context, messages],
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = draft.trim();
      if (!text || pending) return;
      setDraft("");
      void callGemma(text);
    },
    [draft, pending, callGemma],
  );

  const handleRetry = useCallback(() => {
    setHasError(false);
    const text = lastUserTextRef.current;
    if (!text || pending) return;
    void callGemma(text);
  }, [pending, callGemma]);

  const isEmpty = messages.length === 0 && !pending && !hasError;

  return (
    <aside className="flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] lg:w-80">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--primary-soft)] px-5 py-4">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] font-[family-name:var(--font-display)] text-lg font-bold text-[var(--surface)]">
            G
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
              pending ? "bg-[var(--secondary)] animate-stem-pulse" : "bg-[var(--primary-ink)]"
            }`}
          />
        </div>
        <div className="leading-tight">
          <p className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--foreground)]">Gemma</p>
          <p className="text-xs text-[var(--muted)]">Your AI STEM Instructor</p>
        </div>
      </div>

      {/* Transcript */}
      <div ref={listRef} className="scroll-slim flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <ChatEmptyState />
        ) : (
          <>
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            {pending ? <ChatThinkingIndicator /> : null}
            {hasError && !pending ? <ChatErrorState message={errorMessage} onRetry={handleRetry} /> : null}
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-[var(--border)] p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="gemma-input" className="sr-only">
            Ask Gemma
          </label>
          <textarea
            id="gemma-input"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask Gemma a question…"
            disabled={pending}
            className="scroll-slim max-h-28 flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!draft.trim() || pending}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--surface)] transition hover:bg-[var(--primary-ink)] disabled:cursor-not-allowed disabled:bg-[var(--lock)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 10l14-6-4 14-3-6-7-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
          Powered by local Gemma via Ollama
        </p>
      </form>
    </aside>
  );
}