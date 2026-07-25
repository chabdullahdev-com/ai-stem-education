# Gemma STEM

> Learn. Build. Experiment. Understand.

An AI-powered STEM education platform for students aged 5+. Local-first web app using local Gemma as the AI STEM instructor, MakerBuddy curriculum, and MakerBuddy hardware. This is **Part 1: foundation + frontend experience** only.

## Brand Identity

- **Personality:** Educational, friendly, premium, STEM-focused. Works for ages 5+ without being childish or cartoonish.
- **Tagline:** Learn. Build. Experiment. Understand.

### Colors (`app/globals.css`)
- **Primary** — deep teal-green (`#0f7a6a`) for growth/learning
- **Secondary** — warm amber (`#e8852b`) for curiosity/warmth
- **Accent** — measured blue (`#2b6fb0`), used sparingly
- **Background** — off-white canvas (`#f7f7f5`), soft ink (`#1b2530`), not harsh black/white
- Dark mode variants included via `prefers-color-scheme`.

### Fonts (set in `app/layout.tsx`)
- **Display:** Space Grotesk (headings, branding)
- **Body:** DM Sans (paragraphs, UI text)

### Visual motifs
- Subtle grid/dot STEM textures (`.stem-grid`, `.stem-dots`)
- Inline SVG "circuit" motif on the welcome screen (AI core + sensor/hardware/AI/learning nodes + temperature waveform)
- Soft pulse/float/fade animations (no heavy motion)

## User Flow (Part 1)

```
Welcome Screen → Student Profile Modal → Student Dashboard → Temperature Sensor Lesson → Hybrid Lesson Interface
```

1. **Welcome screen** (`/`) shows the Gemma STEM identity, tagline, concept tags, and a **Start Learning** CTA.
2. Clicking **Start Learning** opens the **Student Profile Modal** (name + age required, Student ID optional). Live "Detected age group" preview updates as you type a valid age.
3. **Validation:** name cannot be empty; age must be a whole number ≥ 5. Errors clear as the value becomes valid. Escape or backdrop click closes the modal.
4. On **Continue** a local student profile is created and saved to `localStorage` (key `gemma-stem:student-profile`).
5. The **Student Dashboard** appears: "Welcome, {name}!", identity summary (name, age, age group, Student ID), "Your Progress" (0% until steps complete), and the **Temperature Sensors** lesson card.
6. Clicking **Begin Lesson** opens the **Lesson Interface**: left sidebar (steps + progress), centre content (lesson cover / step preview / "coming next" placeholders), right **Gemma** AI instructor panel placeholder.
7. Refreshing the page preserves the student profile and returns to the dashboard automatically.

## State & Architecture

Separation of concerns is enforced so future parts can swap in real AI/hardware without reworking UI:

| Concern | Location |
|---|---|
| Domain types | `lib/types.ts` |
| Age-group logic + profile factory + validators | `lib/student.ts` |
| Local persistence external store | `lib/student-store.ts` |
| Reusable lesson data (Temperature Sensors) | `lib/lessons.ts` |
| Lesson session progress hook | `lib/use-lesson-progress.ts` |
| Student profile context | `components/student/StudentProvider.tsx` |
| Welcome UI | `components/welcome/WelcomeScreen.tsx` |
| Onboarding UI | `components/student/StudentProfileModal.tsx` |
| Dashboard UI | `components/dashboard/*` (StudentDashboard, LessonCard, ProgressIndicator) |
| Lesson UI | `components/lesson/*` (LessonLayout, LessonSidebar, LessonContent, GemmaInstructorPanel) |
| App view orchestration | `app/page.tsx` |

### Student profile shape (`lib/types.ts`)
```ts
interface StudentProfile {
  id: string;
  name: string;
  age: number;
  ageGroup: AgeGroup; // { id, label, minAge, maxAge, description }
  studentId?: string;
  createdAt: string; // ISO
}
```

The profile is available app-wide via `useStudent()` (React context backed by `useSyncExternalStore` so it survives refresh and stays in sync across tabs). The future Gemma integration will read `name`, `age`, and `ageGroup` from here for adaptive, age-appropriate responses.

### Age groups (`lib/student.ts`)
- **Early Explorer** — ages 5–7
- **Young Explorer** — ages 8–12
- **Teen Learner** — ages 13–17
- **Advanced Learner** — ages 18+

`resolveAgeGroup(age)` maps an age to a group; the modal shows the live preview.

### Lesson data (reusable)
`lib/lessons.ts` exports `LESSONS` — an array of `Lesson` objects so future lessons can be added without touching UI. A `Lesson` has `objectives` and an ordered `steps` array; steps can be flagged `requiresFutureWork` to stay locked until a later part adds the real content/experiment/assessment.

**Temperature Sensors** steps (6):
1. Introduction (active — shows lesson cover + objectives + "Start Lesson")
2. What is a Sensor? (content preview)
3. Temperature Sensors (content preview)
4. Experiment — **locked** (needs MakerBuddy hardware)
5. Knowledge Check — **locked** (needs AI assessment)
6. Final Assessment — **locked** (needs AI scoring)

### Progress policy (honest, no fake stats)
`useLessonProgress` only marks a step complete via an explicit `recordCompletion(stepId)` call. **Part 1 has no completion paths**, so progress stays `0 / 6` and `0%`. The sidebar locks future steps (shown with a lock glyph) and the lesson header reads **Lesson Progress: 0 / 6 steps**. No invented statistics anywhere on the dashboard.

## Components

- **WelcomeScreen** — hero with STEM motif, concept tags, **Start Learning** CTA.
- **StudentProfileModal** — validation + live age-group preview + **Continue**.
- **StudentDashboard** — greeting, identity card, "Your Progress", lesson grid, switch/reset profile.
- **LessonCard** — visual header (sensor waveform), progress bar, **Begin Lesson**.
- **ProgressIndicator** — reusable 0–100% bar (used on dashboard + sidebar).
- **LessonLayout** — 3-column hybrid layout (sidebar / content / Gemma panel) + top status bar showing "Lesson Progress: x / 6 steps".
- **LessonSidebar** — step list with current/available/completed/locked states, back-to-dashboard button, mini progress bar.
- **LessonContent** — renders the step cover / content preview / "coming in the next part" placeholder.
- **GemmaInstructorPanel** — full AI instructor chat UI (header "Gemma / Your AI STEM Instructor", transcript, input, send). States: empty, thinking, error-with-retry. Calls the provider-agnostic chat client (`lib/ai/chat-client`), **not** Ollama/Gemma. Built from reusable state components in `components/lesson/chat-states.tsx`.

## What is NOT implemented yet (deferred to later parts)

Per the Part 1 + 2A scope, these are intentionally **not** built:
- Real Gemma / Ollama integration (the `/api/ai/chat` route handler — see "AI chat client" below)
- MakerBuddy hardware integration
- Real-time sensor data
- AI-powered adaptive teaching
- Experiment validation
- Student assessment and scoring
- Step completion logic (progress stays 0/6)

### AI chat client (Part 2A architecture)

A clean, provider-agnostic seam so the real backend can land later without touching UI:

| Concern | Location |
|---|---|
| Chat types (message, roles, request/response, lesson context) | `lib/ai/chat-types.ts` |
| Chat client (`sendChatMessage`) — the UI calls only this, never Ollama | `lib/ai/chat-client.ts` |

- The UI sends a `ChatRequest` containing a `LessonChatContext` (student name/age/age-group + current lesson title/slug + current step title/kind/index) and the message history.
- `sendChatMessage` will eventually `POST` to `/api/ai/chat` (`AI_CHAT_ENDPOINT`). For Part 2A it runs a **short simulation** so all chat states are end-to-end testable:
  - Success after a brief delay (exercises thinking → success).
  - Throws when the latest user message contains the trigger word **"error"** (deterministic way to exercise the error+retry state).
- The real AI route handler (which actually talks to Ollama/local Gemma) and the `fetch` body are left commented in the client — flip them on when the backend is built.
- Ollama/AI provider specifics stay entirely out of the chat UI.

## Verification (Part 1 final test)
1. ✅ Welcome screen renders with branding + CTA.
2. ✅ "Start Learning" opens the profile modal.
3. ✅ Name and age can be entered (Student ID optional).
4. ✅ Profile is saved to `localStorage` (`gemma-stem:student-profile`).
5. ✅ Dashboard appears after onboarding ("Welcome, {name}!").
6. ✅ Temperature Sensors lesson card appears with description + "Begin Lesson".
7. ✅ Lesson interface opens (sidebar + content + Gemma panel).
8. ✅ Sidebar highlights current step, locks future ("requires future work") steps.
9. ✅ Gemma placeholder panel appears (chat chrome, no real AI).
10. ✅ Progress indicator shows "0 / 6 steps" / "0% Complete".
11. ✅ Refresh preserves the student profile and returns to the dashboard.

Checks run locally: `npm run typecheck` ✅ and `npm run lint` ✅.

## How to Customize

- **Colors:** edit CSS variables in `app/globals.css` (`:root` and the dark-mode block).
- **Fonts:** swap the `next/font/google` imports in `app/layout.tsx`.
- **Add a lesson:** append a `Lesson` object to `LESSONS` in `lib/lessons.ts` — the dashboard and sidebar render from this data automatically.
- **Add a lesson step:** add to a lesson's `steps` array; set `requiresFutureWork: true` if it depends on hardware/AI not yet implemented.
- **Reset the local profile:** click "Reset profile" at the bottom of the dashboard, or clear `gemma-stem:student-profile` in browser storage.

## Recent Changes

- **2026-07-25 (Part 1):** Built the Gemma STEM foundation — design system, TypeScript types, student profile (local-first, refresh-persistent), age-group logic, reusable lesson data structures, welcome screen, profile modal with validation, student dashboard, and the hybrid Temperature Sensors lesson interface with placeholder Gemma instructor panel. No AI/hardware/sensor/scoring integration yet.
- **2026-07-25 (Part 2A):** Upgraded the Gemma panel into a full chat interface. Added a provider-agnostic AI chat client (`lib/ai/`) targeting the future `/api/ai/chat` route, a `LessonChatContext` (student + lesson + step) wired from `LessonLayout`, and reusable chat UI states (empty/thinking/error-with-retry, bubbles, auto-scroll, Enter-to-send). No real AI calls yet — the client is a clearly-marked simulation with a deterministic "error" trigger for testing the failure path.