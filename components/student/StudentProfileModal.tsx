"use client";

import { useEffect, useMemo, useState } from "react";
import { isNameValid, isAgeValid, MIN_STUDENT_AGE, resolveAgeGroup } from "@/lib/student";

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (input: { name: string; age: number; studentId?: string }) => void;
}

type FieldErrors = {
  name?: string;
  age?: string;
};

export function StudentProfileModal({ open, onClose, onContinue }: StudentProfileModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [studentId, setStudentId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  // This component is mounted only while open (see parent), so the useState
  // initializers run fresh on every open — no reset effect needed.

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const resolvedGroup = useMemo(() => {
    const parsed = Number(age);
    if (age.trim() === "" || !Number.isFinite(parsed)) return null;
    return resolveAgeGroup(Math.floor(parsed));
  }, [age]);

  // Clear a field's error once the value becomes valid (improves UX after
  // a failed submit attempt).
  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name && isNameValid(value)) setErrors((e) => ({ ...e, name: undefined }));
  };
  const handleAgeChange = (value: string) => {
    setAge(value);
    const parsed = Number(value);
    if (errors.age && value.trim() !== "" && Number.isFinite(parsed) && isAgeValid(parsed)) {
      setErrors((e) => ({ ...e, age: undefined }));
    }
  };

  if (!open) return null;

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!isNameValid(name)) next.name = "Please enter your name.";
    const parsed = Number(age);
    if (age.trim() === "" || !Number.isFinite(parsed)) {
      next.age = "Please enter your age.";
    } else if (!Number.isInteger(parsed) || parsed < MIN_STUDENT_AGE) {
      next.age = `You must be at least ${MIN_STUDENT_AGE} years old.`;
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onContinue({
      name: name.trim(),
      age: Math.floor(Number(age)),
      studentId: studentId.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--foreground)_55%,transparent)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg animate-stem-scale-in overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        {/* header */}
        <div className="relative border-b border-[var(--border)] bg-[var(--primary-soft)] px-6 py-5">
          <div className="stem-dots pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-ink)]">
                Student Profile
              </p>
              <h2 id="profile-modal-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">
                Tell us about you
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="student-name" className="block text-sm font-semibold text-[var(--foreground)]">
              Student Name <span className="text-[var(--secondary)]">*</span>
            </label>
            <input
              id="student-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Ada Lovelace"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
            />
            {errors.name ? (
              <p className="text-sm text-[var(--secondary)]">{errors.name}</p>
            ) : (
              <p className="text-xs text-[var(--muted)]">Required</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label htmlFor="student-age" className="block text-sm font-semibold text-[var(--foreground)]">
              Age <span className="text-[var(--secondary)]">*</span>
            </label>
            <input
              id="student-age"
              name="age"
              type="number"
              inputMode="numeric"
              min={MIN_STUDENT_AGE}
              step={1}
              value={age}
              onChange={(e) => handleAgeChange(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
            />
            {errors.age ? (
              <p className="text-sm text-[var(--secondary)]">{errors.age}</p>
            ) : (
              <p className="text-xs text-[var(--muted)]">Must be a whole number, at least {MIN_STUDENT_AGE}.</p>
            )}
          </div>

          {/* Optional Student ID */}
          <div className="space-y-1.5">
            <label htmlFor="student-id" className="block text-sm font-semibold text-[var(--foreground)]">
              Student ID <span className="text-xs font-normal text-[var(--muted)]">(optional)</span>
            </label>
            <input
              id="student-id"
              name="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. School or club ID"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
            />
          </div>

          {/* Live age group preview */}
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Detected age group</p>
            {resolvedGroup ? (
              <div className="mt-1.5">
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--primary-ink)]">
                  {resolvedGroup.label}
                </p>
                <p className="text-sm text-[var(--muted)]">{resolvedGroup.description}</p>
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-[var(--muted)]">
                Enter a valid age to see your learning group.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-7 py-3 text-base font-semibold text-[var(--surface)] shadow-lg shadow-[color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:bg-[var(--primary-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}