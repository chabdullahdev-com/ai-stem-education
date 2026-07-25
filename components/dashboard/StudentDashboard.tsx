"use client";

import { useMemo } from "react";
import { useStudent } from "@/components/student/StudentProvider";
import { LESSONS, getTotalSteps } from "@/lib/lessons";
import { LessonCard } from "./LessonCard";
import { ProgressIndicator } from "./ProgressIndicator";

interface StudentDashboardProps {
  onBeginLesson: (lessonSlug: string) => void;
  onSwitchProfile: () => void;
  onResetProfile: () => void;
}

export function StudentDashboard({ onBeginLesson, onSwitchProfile, onResetProfile }: StudentDashboardProps) {
  const { profile } = useStudent();

  const overallProgress = useMemo(() => {
    // Only one lesson exists in Part 1; progress is 0 until steps complete.
    return 0;
  }, []);

  if (!profile) return null;

  return (
    <div className="relative min-h-screen">
      <div className="stem-grid pointer-events-none absolute inset-0 opacity-20" />

      {/* Top bar */}
      <header className="relative border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--surface)] font-[family-name:var(--font-display)] text-lg font-bold">
              G
            </div>
            <div className="leading-tight">
              <p className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--foreground)]">Gemma STEM</p>
              <p className="text-xs text-[var(--muted)]">Learn. Build. Experiment. Understand.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchProfile}
            className="rounded-lg border border-[var(--border)] px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Switch profile
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Welcome + identity card */}
        <section className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary-ink)]">Dashboard</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Welcome, {profile.name}!
            </h1>
            <p className="text-[var(--muted)]">
              Ready to explore science and technology together with Gemma.
            </p>
          </div>

          {/* Identity summary card */}
          <aside className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] font-[family-name:var(--font-display)] text-lg font-bold text-[var(--primary-ink)]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--foreground)]">{profile.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  Age {profile.age} · {profile.ageGroup.label}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Age Group</dt>
                <dd className="font-semibold text-[var(--foreground)]">{profile.ageGroup.label}</dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Student ID</dt>
                <dd className="font-semibold text-[var(--foreground)]">{profile.studentId ?? "—"}</dd>
              </div>
            </dl>
          </aside>
        </section>

        {/* Learning progress */}
        <section className="mt-10">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">Your Progress</h2>
                <p className="text-sm text-[var(--muted)]">Track your journey through STEM lessons.</p>
              </div>
              <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-ink)]">
                {Math.round(overallProgress * 100)}% Complete
              </span>
            </div>
            <div className="mt-4">
              <ProgressIndicator value={overallProgress} showCaption label={`${Math.round(overallProgress * 100)}%`} />
            </div>
          </div>
        </section>

        {/* Lessons */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">Lessons</h2>
            <span className="text-sm text-[var(--muted)]">{LESSONS.length} available</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {LESSONS.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={0}
                totalSteps={getTotalSteps(lesson)}
                onBegin={() => onBeginLesson(lesson.slug)}
              />
            ))}
          </div>
        </section>

        {/* Footer note + reset */}
        <section className="mt-12 text-center">
          <p className="text-xs text-[var(--muted)]">
            Profile saved on this device.{" "}
            <button
              type="button"
              onClick={onResetProfile}
              className="underline decoration-dotted underline-offset-4 hover:text-[var(--foreground)]"
            >
              Reset profile
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}