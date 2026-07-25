"use client";

import type { LessonStep, Question } from "@/lib/types";
import type { LessonProgressApi } from "@/lib/use-lesson-progress";
import {
  ActivityCard,
  ConceptList,
  ObjectivesList,
  QuestionList,
  StepBadge,
  StepHeading,
  StepSummary,
} from "./content-blocks";
import { HardwarePanel, useHardwareConnection } from "@/components/hardware/HardwarePanel";

interface LessonContentProps {
  progress: LessonProgressApi;
  studentAge?: number;
}

/* -----------------------------------------------------------------------
 * Step header (shared by content steps)
 * ----------------------------------------------------------------------- */

function kindLabel(kind: LessonStep["kind"]): string {
  switch (kind) {
    case "prepare-experiment":
      return "Prepare";
    case "knowledge-check":
      return "Knowledge check";
    case "assessment":
      return "Assessment";
    case "experiment":
      return "Experiment";
    case "introduction":
      return "Introduction";
    default:
      return "Content";
  }
}

function StepHeader({ step, index }: { step: LessonStep; index: number }) {
  return (
    <div className="space-y-4">
      <StepBadge index={index + 1} label={kindLabel(step.kind)} />
      <StepHeading>{step.title}</StepHeading>
      {step.summary ? <StepSummary>{step.summary}</StepSummary> : null}
    </div>
  );
}

/* -----------------------------------------------------------------------
 * "Continue" CTA bound to completion + advancement.
 * ----------------------------------------------------------------------- */

function ContinueButton({ progress }: { progress: LessonProgressApi }) {
  const { completeAndAdvance, currentStepIndex, totalSteps } = progress;
  const isLast = currentStepIndex + 1 >= totalSteps;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={completeAndAdvance}
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--surface)] shadow-lg shadow-[color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:bg-[var(--primary-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
      >
        {isLast ? "Complete lesson" : "Continue"}
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 10h12m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Step renderers
 * ----------------------------------------------------------------------- */

// Introduction (step 1) — lesson cover with objectives + start CTA.
function IntroductionCover({ step, progress }: { step: LessonStep; progress: LessonProgressApi }) {
  return (
    <div className="animate-stem-fade-up space-y-8">
      <StepBadge index={1} label="Introduction" />
      <div>
        <StepHeading>
          Temperature <span className="text-[var(--primary)]">Sensors</span>
        </StepHeading>
        <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">
          Let&apos;s discover how temperature sensors detect changes in the world around us — and how computers turn those changes into useful data.
        </p>
      </div>
      {step.objectives?.length ? <ObjectivesList objectives={step.objectives} /> : null}
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5">
        <p className="text-sm text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">Heads up:</strong> steps 5–7 (Experiment, Knowledge Check, Final Assessment) need the MakerBuddy hardware and AI assessment, which arrive in a later part. You can still see their questions here, but they stay locked until the backend is connected.
        </p>
      </div>
      <ContinueButton progress={progress} />
    </div>
  );
}

// Interactive content step — renders concepts + activity from structured data.
function ContentStep({ step, progress }: { step: LessonStep; progress: LessonProgressApi }) {
  const index = progress.currentStepIndex;
  return (
    <div className="animate-stem-fade-up space-y-8">
      <StepHeader step={step} index={index} />
      {step.objectives?.length ? <ObjectivesList objectives={step.objectives} /> : null}
      <ConceptList concepts={step.concepts} />
      {step.activity ? <ActivityCard activity={step.activity} /> : null}
      <ContinueButton progress={progress} />
    </div>
  );
}

// Prepare-experiment step — instruction-led activity.
function PrepareExperimentStep({ step, progress }: { step: LessonStep; progress: LessonProgressApi }) {
  const index = progress.currentStepIndex;
  return (
    <div className="animate-stem-fade-up space-y-8">
      <StepHeader step={step} index={index} />
      {step.objectives?.length ? <ObjectivesList objectives={step.objectives} /> : null}
      <ConceptList concepts={step.concepts} />
      {step.activity ? <ActivityCard activity={step.activity} /> : null}
      <ContinueButton progress={progress} />
    </div>
  );
}

// Experiment step — live hardware connection + sensor data + graph.
function ExperimentStep({ step, progress }: { step: LessonStep; progress: LessonProgressApi }) {
  const hook = useHardwareConnection();
  const index = progress.currentStepIndex;

  return (
    <div className="animate-stem-fade-up space-y-8">
      <StepHeader step={step} index={index} />
      {step.objectives?.length ? <ObjectivesList objectives={step.objectives} /> : null}
      <HardwarePanel hook={hook} />
      <ContinueButton progress={progress} />
    </div>
  );
}

// Locked future-work step. Clean "coming next" placeholder; mentions how many
// questions are ready for the backend without exposing them to the student.
function FutureStepPlaceholder({ step, index }: { step: LessonStep; index: number }) {
  const questionCount = step.questions?.length ?? step.assessment?.length ?? 0;
  return (
    <div className="animate-stem-fade-up space-y-6">
      <StepBadge index={index + 1} label="Coming next" />
      <StepHeading>{step.title}</StepHeading>
      <StepSummary>{step.summary ?? ""}</StepSummary>
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="5" y="9" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-3 font-semibold text-[var(--foreground)]">This step unlocks with hardware + AI assessment</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {step.kind === "experiment"
            ? "MakerBuddy sensor hardware captures live temperature readings here."
            : "Gemma's adaptive assessment scores this step once it's connected."}
        </p>
        {questionCount > 0 ? (
          <p className="mt-1 text-xs text-[var(--muted)]">
            {questionCount} question{questionCount === 1 ? "" : "s"} ready for when the backend lands.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Main dispatch — routes a step to the right renderer based on its kind.
 * ----------------------------------------------------------------------- */

export function LessonContent({ progress, studentAge }: LessonContentProps) {
  const { lesson, currentStepIndex } = progress;
  const step = lesson.steps[currentStepIndex];

  if (!step) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--muted)]">
        Step not found.
      </div>
    );
  }

  if (step.requiresFutureWork) {
    return <FutureStepPlaceholder step={step} index={currentStepIndex} />;
  }

  // Build an age-filtered question list once it's needed.
  const rawQuestions = step.questions ?? step.assessment ?? [];
  const filteredQuestions: Question[] =
    studentAge != null
      ? rawQuestions.filter((q) => !q.minAge || studentAge >= q.minAge)
      : rawQuestions;

  switch (step.kind) {
    case "introduction":
      return <IntroductionCover step={step} progress={progress} />;
    case "content":
      return <ContentStep step={step} progress={progress} />;
    case "prepare-experiment":
      return <PrepareExperimentStep step={step} progress={progress} />;
    case "experiment":
      return <ExperimentStep step={step} progress={progress} />;
    default:
      // Knowledge-check or assessment step that is NOT flagged future-work
      // renders its (age-filtered) questions interactively.
      return (
        <div className="animate-stem-fade-up space-y-8">
          <StepHeader step={step} index={currentStepIndex} />
          <QuestionList
            questions={filteredQuestions}
            title={step.kind === "assessment" ? "Final assessment" : "Knowledge check"}
          />
          <ContinueButton progress={progress} />
        </div>
      );
  }
}