"use client";

import { useMemo } from "react";
import type { Lesson } from "@/lib/types";
import { useLessonProgress } from "@/lib/use-lesson-progress";
import { useStudent } from "@/components/student/StudentProvider";
import { LessonSidebar } from "./LessonSidebar";
import { LessonContent } from "./LessonContent";
import { GemmaInstructorPanel } from "./GemmaInstructorPanel";
import { ProgressIndicator } from "@/components/dashboard/ProgressIndicator";
import type { LessonChatContext } from "@/lib/ai/chat-types";

interface LessonLayoutProps {
  lesson: Lesson;
  onExit: () => void;
}

export function LessonLayout({ lesson, onExit }: LessonLayoutProps) {
  const { profile } = useStudent();
  const progress = useLessonProgress(lesson);

  const stepsCompleted = progress.completedCount;
  const stepsTotal = progress.totalSteps;

  // Build the chat context (student + active step) for the AI instructor.
  // Used internally by the chat request; not rendered to the student.
  const currentStep = lesson.steps[progress.currentStepIndex];
  const chatContext: LessonChatContext | null = useMemo(() => {
    if (!profile || !currentStep) return null;
    return {
      studentName: profile.name,
      studentAge: profile.age,
      ageGroupId: profile.ageGroup.id,
      ageGroupLabel: profile.ageGroup.label,
      lessonTitle: lesson.title,
      lessonSlug: lesson.slug,
      stepTitle: currentStep.title,
      stepKind: currentStep.kind,
      stepIndex: progress.currentStepIndex,
    };
  }, [profile, currentStep, lesson.title, lesson.slug, progress.currentStepIndex]);

  return (
    <div className="flex h-screen flex-col bg-[var(--background)]">
      {/* top progress strip */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 lg:hidden">
        <span className="text-sm font-semibold text-[var(--foreground)]">{lesson.title}</span>
        <div className="flex-1">
          <ProgressIndicator value={stepsTotal === 0 ? 0 : stepsCompleted / stepsTotal} showCaption={false} size="sm" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left sidebar */}
        <div className="lg:h-full">
          <LessonSidebar progress={progress} onExit={onExit} />
        </div>

        {/* Centre content + top status bar */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="hidden shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3 lg:flex">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-[var(--foreground)]">{profile?.name ?? "Student"}</span>
              {profile ? (
                <span className="text-[var(--muted)]">
                  · Age {profile.age} · {profile.ageGroup.label}
                </span>
              ) : null}
            </div>
            <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
              Lesson Progress: {stepsCompleted} / {stepsTotal} steps
            </span>
          </div>

          <main className="scroll-slim min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
            <div className="mx-auto max-w-3xl">
              <LessonContent progress={progress} />
            </div>
          </main>
        </div>

        {/* Right AI panel */}
        <div className="lg:h-full">
          {chatContext ? (
            <GemmaInstructorPanel context={chatContext} />
          ) : null}
        </div>
      </div>
    </div>
  );
}