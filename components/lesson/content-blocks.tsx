"use client";

import { useState } from "react";
import type { Concept, Activity, MultipleChoiceQuestion, TrueFalseQuestion, Question } from "@/lib/types";

/* -----------------------------------------------------------------------
 * Shared atoms
 * ----------------------------------------------------------------------- */

function StepBadge({ index, label }: { index: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-ink)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
      Step {String(index).padStart(2, "0")} · {label}
    </div>
  );
}

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
      {children}
    </h1>
  );
}

function StepSummary({ children }: { children: React.ReactNode }) {
  return <p className="max-w-2xl text-lg text-[var(--muted)]">{children}</p>;
}

export { StepBadge, StepHeading, StepSummary };

/* -----------------------------------------------------------------------
 * Objectives list
 * ----------------------------------------------------------------------- */

export function ObjectivesList({ objectives }: { objectives: { text: string }[] }) {
  if (!objectives?.length) return null;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
        Learning objectives
      </h2>
      <ul className="mt-4 space-y-3">
        {objectives.map((obj, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary-ink)]">
              {i + 1}
            </span>
            <span className="text-[var(--foreground)]">{obj.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Concept card
 * ----------------------------------------------------------------------- */

export function ConceptCard({ concept }: { concept: Concept }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--primary)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-ink)]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v6m0 0l3-3m-3 3L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12a7 7 0 0014 0c0-2-1-3.5-1.5-4.5C16 7 14 5 12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">{concept.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{concept.summary}</p>
        </div>
      </div>

      {open && concept.detail ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">{concept.detail}</p>
      ) : null}

      {open && concept.everydayExample ? (
        <p className="mt-3 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--foreground)]">
          <span className="font-semibold text-[var(--primary-ink)]">Everyday example: </span>
          {concept.everydayExample}
        </p>
      ) : null}

      {concept.detail || concept.everydayExample ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-ink)] hover:underline"
          aria-expanded={open}
        >
          {open ? "Show less" : "Find out more"}
          <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </article>
  );
}

export function ConceptList({ concepts }: { concepts?: Concept[] }) {
  if (!concepts?.length) return null;
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">Key concepts</h2>
      {concepts.map((c) => (
        <ConceptCard key={c.id} concept={c} />
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Activity instructions card
 * ----------------------------------------------------------------------- */

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary-soft)] text-[var(--secondary)]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l8 4v5c0 4.4-3.4 7.5-8 9-4.6-1.5-8-4.6-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Activity</p>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">{activity.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{activity.brief}</p>
      <ol className="mt-3 space-y-2.5">
        {activity.instructions.map((instr, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[var(--foreground)]">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary-ink)]">
              {i + 1}
            </span>
            <span>{instr}</span>
          </li>
        ))}
      </ol>
      {activity.note ? (
        <p className="mt-3 rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5 text-xs text-[var(--foreground)]">
          <span className="font-semibold text-[var(--muted)]">Note · </span>
          {activity.note}
        </p>
      ) : null}
      <p className="mt-4 text-xs text-[var(--muted)]">
        Stuck? Ask Gemma in the panel on the right — they&apos;ll guide you through it.
      </p>
    </article>
  );
}

/* -----------------------------------------------------------------------
 * Quiz: multiple choice + true/false cards
 * ----------------------------------------------------------------------- */

function ResultBanner({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div
      className={`mt-3 rounded-xl border px-3.5 py-3 text-sm ${
        correct
          ? "border-[color-mix(in_srgb,var(--primary)_35%,transparent)] bg-[var(--primary-soft)] text-[var(--primary-ink)]"
          : "border-[color-mix(in_srgb,var(--secondary)_40%,transparent)] bg-[var(--secondary-soft)] text-[var(--foreground)]"
      }`}
    >
      <p className="font-semibold">{correct ? "That's right!" : "Not quite — let's try again."}</p>
      <p className="mt-1 text-[var(--foreground)]">{explanation}</p>
    </div>
  );
}

export function MultipleChoiceCard({ question }: { question: MultipleChoiceQuestion }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      {question.context ? <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{question.context}</p> : null}
      <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">{question.prompt}</h3>
      <div className="mt-4 space-y-2.5">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isChosen = selected === i;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setSelected(i)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                !answered
                  ? "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  : isCorrect
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-ink)]"
                    : isChosen
                      ? "border-[var(--secondary)] bg-[var(--secondary-soft)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] opacity-70",
              ].join(" ")}
              aria-pressed={isChosen}
            >
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  answered && isCorrect
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--surface)]"
                    : answered && isChosen
                      ? "border-[var(--secondary)] bg-[var(--secondary)] text-[var(--surface)]"
                      : "border-[var(--border)] text-[var(--muted)]",
                ].join(" ")}
              >
                {answered && isCorrect ? (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : answered && isChosen ? (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="text-[var(--foreground)]">{opt}</span>
            </button>
          );
        })}
      </div>
      {answered ? <ResultBanner correct={selected === question.correctIndex} explanation={question.explanation} /> : null}
      {answered ? (
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="mt-3 text-xs font-semibold text-[var(--primary-ink)] hover:underline"
        >
          Try this question again
        </button>
      ) : null}
    </article>
  );
}

export function TrueFalseCard({ question }: { question: TrueFalseQuestion }) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const answered = selected !== null;

  const options: { label: string; value: boolean }[] = [
    { label: "True", value: true },
    { label: "False", value: false },
  ];

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      {question.context ? <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{question.context}</p> : null}
      <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">{question.prompt}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isCorrect = opt.value === question.correct;
          const isChosen = selected === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              disabled={answered}
              onClick={() => setSelected(opt.value)}
              className={[
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition",
                !answered
                  ? "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  : isCorrect
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-ink)]"
                    : isChosen
                      ? "border-[var(--secondary)] bg-[var(--secondary-soft)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] opacity-70",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered ? <ResultBanner correct={selected === question.correct} explanation={question.explanation} /> : null}
      {answered ? (
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="mt-3 text-xs font-semibold text-[var(--primary-ink)] hover:underline"
        >
          Try this question again
        </button>
      ) : null}
    </article>
  );
}

export function QuestionCard({ question }: { question: Question }) {
  if (question.type === "multiple-choice") return <MultipleChoiceCard question={question} />;
  return <TrueFalseCard question={question} />;
}

export function QuestionList({ questions, title = "Knowledge check" }: { questions?: Question[]; title?: string }) {
  if (!questions?.length) return null;
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">{title}</h2>
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </div>
  );
}