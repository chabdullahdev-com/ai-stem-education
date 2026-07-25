"use client";

import type { LessonStepStatus } from "@/lib/types";
import type { LessonProgressApi } from "@/lib/use-lesson-progress";
import { ProgressIndicator } from "@/components/dashboard/ProgressIndicator";

interface LessonSidebarProps {
  progress: LessonProgressApi;
  onExit: () => void;
}

export function LessonSidebar({ progress, onExit }: LessonSidebarProps) {
  const { lesson, currentStepIndex, completedCount, totalSteps, statusFor, goToStep } = progress;

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:w-72">
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-4">
        <button
          type="button"
          onClick={onExit}
          aria-label="Back to dashboard"
          className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="leading-tight">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Lesson</p>
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--foreground)]">{lesson.title}</h2>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--foreground)]">Lesson Progress</span>
          <span className="text-[var(--muted)]">{completedCount} / {totalSteps} steps</span>
        </div>
        <div className="mt-2">
          <ProgressIndicator value={totalSteps === 0 ? 0 : completedCount / totalSteps} showCaption={false} size="sm" />
        </div>
      </div>

      <nav className="scroll-slim flex-1 overflow-y-auto px-3 pb-4">
        <ol className="space-y-1">
          {lesson.steps.map((step, index) => {
            const status = statusFor(index);
            const isActive = index === currentStepIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={status === "locked"}
                  onClick={() => goToStep(index)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                    isActive
                      ? "bg-[var(--primary-soft)] text-[var(--primary-ink)]"
                      : status === "completed"
                        ? "text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                        : status === "locked"
                          ? "cursor-not-allowed text-[var(--muted)] opacity-70"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-2)]",
                  ].filter(Boolean).join(" ")}
                >
                  <StepGlyph status={status} index={index + 1} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-tight">{step.title}</span>
                    <span className="block text-xs capitalize text-[var(--muted)]">
                      {status === "locked" ? "Locked" : step.kind.replace("-", " ")}
                    </span>
                  </span>
                  {status === "locked" ? (
                    <svg className="h-4 w-4 shrink-0 text-[var(--muted)]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <rect x="5" y="9" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}

function StepGlyph({ status, index }: { status: LessonStepStatus; index: number }) {
  return (
    <span
      className={[
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        status === "completed"
          ? "bg-[var(--primary)] text-[var(--surface)]"
          : status === "locked"
            ? "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
            : "border border-[var(--primary)] bg-[var(--surface)] text-[var(--primary-ink)]",
      ].join(" ")}
    >
      {status === "completed" ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        index
      )}
    </span>
  );
}