import type { StudentProfile } from "./types";

/**
 * Tiny external store backed by localStorage, designed to be consumed with
 * React's `useSyncExternalStore`. This avoids setState-in-effect patterns
 * and handles SSR/hydration cleanly (server snapshot is always null).
 */

export const STUDENT_STORAGE_KEY = "gemma-stem:student-profile";

let cached: StudentProfile | null | undefined = undefined; // undefined = not yet read
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function readFromStorage(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentProfile;
    if (!parsed || typeof parsed.name !== "string" || typeof parsed.age !== "number" || !parsed.ageGroup) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(profile: StudentProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

function removeFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STUDENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function subscribeStudent(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STUDENT_STORAGE_KEY) {
      cached = undefined; // force re-read on next snapshot
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getStudentSnapshot(): StudentProfile | null {
  if (cached === undefined) cached = readFromStorage();
  return cached;
}

export function getStudentServerSnapshot(): StudentProfile | null {
  return null;
}

export function commitStudent(profile: StudentProfile): void {
  cached = profile;
  writeToStorage(profile);
  emit();
}

export function clearStudent(): void {
  cached = null;
  removeFromStorage();
  emit();
}