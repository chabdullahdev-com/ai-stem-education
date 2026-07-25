"use client";

import { useState } from "react";
import { StudentProvider, useStudent } from "@/components/student/StudentProvider";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { StudentProfileModal } from "@/components/student/StudentProfileModal";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { LessonLayout } from "@/components/lesson/LessonLayout";
import { getLessonBySlug } from "@/lib/lessons";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function GemmaStemApp() {
  const { profile, registerStudent, resetStudent } = useStudent();

  // Active lesson route (slug) — null means "not in a lesson".
  const [activeLessonSlug, setActiveLessonSlug] = useState<string | null>(null);
  // Profile modal is an overlay; opening it does not change the base screen.
  const [modalOpen, setModalOpen] = useState(false);

  const openProfileModal = () => setModalOpen(true);
  const closeProfileModal = () => setModalOpen(false);

  const handleContinue = (input: { name: string; age: number; studentId?: string }) => {
    registerStudent(input);
    setModalOpen(false);
    setActiveLessonSlug(null);
  };

  const handleBeginLesson = (slug: string) => {
    setActiveLessonSlug(slug);
  };

  const handleExitLesson = () => {
    setActiveLessonSlug(null);
  };

  // "Switch profile" from the dashboard — open the modal on top of the
  // dashboard so the existing profile stays visible behind it.
  const handleSwitchProfile = () => {
    setModalOpen(true);
  };

  // "Reset profile" — clear the stored profile and present the welcome flow
  // with the modal ready for a new entry.
  const handleResetProfile = () => {
    resetStudent();
    setActiveLessonSlug(null);
    setModalOpen(true);
  };

  const activeLesson = activeLessonSlug ? getLessonBySlug(activeLessonSlug) : undefined;

  // Derive the current screen from state — no view-sync effect needed.
  // Lesson view takes priority; otherwise presence of a profile decides
  // dashboard vs welcome. A retained profile after a refresh therefore lands
  // back on the dashboard automatically.
  let screen: React.ReactNode;
  if (activeLesson) {
    screen = <LessonLayout lesson={activeLesson} onExit={handleExitLesson} />;
  } else if (profile) {
    screen = (
      <StudentDashboard
        onBeginLesson={handleBeginLesson}
        onSwitchProfile={handleSwitchProfile}
        onResetProfile={handleResetProfile}
      />
    );
  } else {
    screen = <WelcomeScreen onStart={openProfileModal} />;
  }

  return (
    <>
      {screen}
      {modalOpen ? (
        <StudentProfileModal open onClose={closeProfileModal} onContinue={handleContinue} />
      ) : null}
    </>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <StudentProvider>
        <GemmaStemApp />
      </StudentProvider>
    </ErrorBoundary>
  );
}