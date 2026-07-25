"use client";

import type { Lesson } from "@/lib/types";
import { getTotalSteps } from "@/lib/lessons";
import { ProgressIndicator } from "./ProgressIndicator";

interface LessonCardProps {
  lesson: Lesson;
  progress: number; // 0..1
  totalSteps?: number;
  locked?: boolean;
  onBegin: () => void;
}

export function LessonCard({ lesson, progress, totalSteps, locked = false, onBegin }: LessonCardProps) {
  const steps = totalSteps ?? getTotalSteps(lesson);
  const pct = Math.round(progress * 100);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition ${locked ? "opacity-75" : "hover:shadow-md hover:border-[var(--primary)]"}`}
    >
      {/* top stripe */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[var(--primary-soft)] to-[var(--secondary-soft)]">
        <div className="stem-grid pointer-events-none absolute inset-0 opacity-30" />
        {/* miniature sensor waveform motif */}
        <svg viewBox="0 0 320 100" className="absolute inset-x-0 bottom-0 h-20 w-full" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points="0,70 40,70 52,30 66,85 80,40 96,62 120,62 140,20 156,78 172,46 200,62 260,62 280,30 296,70 320,70"
            fill="none"
            stroke="var(--primary-ink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </svg>
        <div className="absolute left-5 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--surface)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary-ink)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          Lesson 01
        </div>
        {!locked ? (
          <span className="absolute right-4 top-4 rounded-full bg-[var(--surface)]/80 px-3 py-1 text-xs font-medium text-[var(--muted)] backdrop-blur">
            {steps} steps
          </span>
        ) : (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--surface)]/80 px-3 py-1 text-xs font-medium text-[var(--muted)] backdrop-blur">
            <LockGlyph /> Locked
          </span>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
            {lesson.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{lesson.description}</p>
        </div>

        <ProgressIndicator value={progress} showCaption={false} label={`${pct}%`} size="sm" />

        <button
          type="button"
          disabled={locked}
          onClick={onBegin}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)] disabled:cursor-not-allowed disabled:bg-[var(--lock)]"
        >
          Begin Lesson
          {!locked ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10h12m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </button>
      </div>
    </article>
  );
}

function LockGlyph() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="5" y="9" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}