"use client";

import type { LessonStep } from "@/lib/types";
import type { LessonProgressApi } from "@/lib/use-lesson-progress";

interface LessonContentProps {
  progress: LessonProgressApi;
}

// Renders the introduction (cover) view for the lesson's first step,
// which shows the lesson objectives and the "Start Lesson" CTA.
function IntroductionCover({ step }: { step: LessonStep }) {
  return (
    <div className="animate-stem-fade-up space-y-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-ink)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
        Step 01 · Introduction
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Temperature <span className="text-[var(--primary)]">Sensors</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">
          Let&apos;s discover how temperature sensors detect changes in the world around us — and how computers turn those changes into data.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">Learning objectives</h2>
        <ul className="mt-4 space-y-3">
          {step.objectives?.map((obj, i) => (
            <li key={i} className="flex items-start gap-3 text-[var(--foreground)]">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary-ink)]">
                {i + 1}
              </span>
              <span className="text-[var(--foreground)]">{obj.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5">
        <p className="text-sm text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">Heads up:</strong> steps 4–6 (Experiment, Knowledge Check, Final Assessment) need the MakerBuddy hardware and AI assessment, which arrive in the next part of Gemma STEM. They&apos;ll stay locked for now.
        </p>
      </div>
    </div>
  );
}

// Placeholder renderers for steps that exist in the data but whose real
// content/interaction arrives in future parts. We show a clean "coming next"
// state instead of fabricated lesson material.
function FutureStepPlaceholder({ step }: { step: LessonStep }) {
  return (
    <div className="animate-stem-fade-up space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--lock)]" />
        Coming in the next part
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {step.title}
      </h1>
      <p className="max-w-2xl text-[var(--muted)]">{step.summary}</p>
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="5" y="9" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-3 font-semibold text-[var(--foreground)]">This step unlocks with hardware + AI assessment</p>
        <p className="mt-1 text-sm text-[var(--muted)]">MakerBuddy sensor hardware and Gemma&apos;s adaptive assessment arrive in Part 2.</p>
      </div>
    </div>
  );
}

// A lightweight content preview for steps 2 & 3 whose rich interactive
// content arrives later; in Part 1 we surface the step summary + objectives.
function ContentPreview({ step }: { step: LessonStep }) {
  return (
    <div className="animate-stem-fade-up space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-ink)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
        Lesson content · Preview
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {step.title}
      </h1>
      <p className="max-w-2xl text-lg text-[var(--muted)]">{step.summary}</p>

      {step.objectives?.length ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">By the end of this step you&apos;ll</h2>
          <ul className="mt-3 space-y-2.5">
            {step.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[var(--foreground)]">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{obj.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5">
        <p className="text-sm text-[var(--muted)]">
          The full interactive content, experiment and AI-guided assessment for this step arrive in the next part of Gemma STEM.
        </p>
      </div>
    </div>
  );
}

export function LessonContent({ progress }: LessonContentProps) {
  const { lesson, currentStepIndex } = progress;
  const step = lesson.steps[currentStepIndex];

  if (!step) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--muted)]">
        Step not found.
      </div>
    );
  }

  if (step.kind === "introduction") {
    return <IntroductionCover step={step} />;
  }
  if (step.requiresFutureWork) {
    return <FutureStepPlaceholder step={step} />;
  }
  return <ContentPreview step={step} />;
}