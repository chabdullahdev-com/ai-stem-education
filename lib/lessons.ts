import type { Lesson } from "./types";

/**
 * Reusable lesson data structure.
 * Future lessons can be added here without touching UI components.
 *
 * Part 1 scope:
 *  - Only the "Temperature Sensors" lesson exists.
 *  - Steps that need hardware / AI / experiment validation are flagged
 *    `requiresFutureWork` and stay locked in this part.
 */
export const LESSONS: Lesson[] = [
  {
    id: "lesson-temperature-sensors",
    slug: "temperature-sensors",
    title: "Temperature Sensors",
    tagline: "Read the world in degrees",
    description:
      "Discover how temperature sensors detect changes in the world around us and learn how computers use sensor data.",
    objectives: [
      { text: "Understand what a sensor is." },
      { text: "Understand what a temperature sensor does." },
      { text: "Understand how temperature changes are detected." },
      { text: "Understand how sensors provide data to computers." },
    ],
    steps: [
      {
        id: "step-1-introduction",
        title: "Introduction",
        kind: "introduction",
        summary:
          "Welcome to the Temperature Sensors lesson. We'll start with the big idea: how can a machine feel the world?",
        objectives: [
          { text: "Understand what a sensor is." },
          { text: "Understand what a temperature sensor does." },
          { text: "Understand how temperature changes are detected." },
          { text: "Understand how sensors provide data to computers." },
        ],
      },
      {
        id: "step-2-what-is-a-sensor",
        title: "What is a Sensor?",
        kind: "content",
        summary:
          "A sensor turns something in the physical world (like light, pressure, or heat) into a signal a computer can read.",
        objectives: [
          { text: "Explain what a sensor does in one sentence." },
          { text: "Name three examples of everyday sensors." },
        ],
      },
      {
        id: "step-3-temperature-sensors",
        title: "Temperature Sensors",
        kind: "content",
        summary:
          "A temperature sensor measures heat by changing its electrical behaviour as it gets warmer or cooler.",
        objectives: [
          { text: "Describe how a temperature sensor responds to heat." },
          { text: "Recognise temperature readings in degrees (Celsius)." },
        ],
      },
      {
        id: "step-4-experiment",
        title: "Experiment",
        kind: "experiment",
        requiresFutureWork: true,
        summary:
          "Hands-on experiment with MakerBuddy hardware. Connect a temperature sensor, capture live readings, and observe how the data changes.",
      },
      {
        id: "step-5-knowledge-check",
        title: "Knowledge Check",
        kind: "knowledge-check",
        requiresFutureWork: true,
        summary:
          "A short set of questions to confirm understanding before the final assessment.",
      },
      {
        id: "step-6-final-assessment",
        title: "Final Assessment",
        kind: "assessment",
        requiresFutureWork: true,
        summary:
          "Final AI-scored assessment to complete the lesson and earn your Temperature Sensors badge.",
      },
    ],
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getTotalSteps(lesson: Lesson): number {
  return lesson.steps.length;
}