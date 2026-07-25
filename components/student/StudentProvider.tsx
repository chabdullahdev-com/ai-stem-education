"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { StudentProfile } from "@/lib/types";
import { createStudentProfile } from "@/lib/student";
import {
  clearStudent,
  commitStudent,
  getStudentServerSnapshot,
  getStudentSnapshot,
  subscribeStudent,
} from "@/lib/student-store";

interface StudentContextValue {
  profile: StudentProfile | null;
  registerStudent: (input: { name: string; age: number; studentId?: string }) => StudentProfile;
  resetStudent: () => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const profile = useSyncExternalStore(
    subscribeStudent,
    getStudentSnapshot,
    getStudentServerSnapshot,
  );

  const registerStudent = useCallback<StudentContextValue["registerStudent"]>((input) => {
    const next = createStudentProfile(input);
    commitStudent(next);
    return next;
  }, []);

  const resetStudent = useCallback(() => {
    clearStudent();
  }, []);

  const value = useMemo<StudentContextValue>(
    () => ({ profile, registerStudent, resetStudent }),
    [profile, registerStudent, resetStudent],
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return ctx;
}