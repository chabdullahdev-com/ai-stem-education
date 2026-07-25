# Gemma STEM

> Learn. Build. Experiment. Understand.

An AI-powered STEM education platform for students aged 5+. Local-first web app using local Gemma as the AI STEM instructor, MakerBuddy curriculum, and MakerBuddy hardware. Parts 1, 2A, 2B, and 3A are implemented (foundation, chat UI, real Gemma via Ollama, and a structured lesson system with reusable content blocks).

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

Per Part 1 + 2A + 2B scope:
- ✅ Real Gemma / Ollama integration — **DONE (Part 2B)** — connected via `gemma2:2b` through Ollama
- MakerBuddy hardware integration — ✅ **DONE (Part 4)** — connected via Wi-Fi + WebSocket, live DS18B20 data
- Real-time sensor data — ✅ **DONE (Part 4)** — with SVG temperature history graph
- AI-powered adaptive teaching
- Experiment validation
- Student assessment and scoring
- Step completion logic (content + prepare + knowledge-check steps are completable; experiment + assessment are locked pending hardware/scoring)

### AI chat client (Parts 2A + 2B architecture)

A clean, provider-agnostic seam isolating the UI from any AI runtime:

```
Browser (chat UI)
    ↓  POST /api/ai/chat  (ChatRequest → ChatResponse)
Next.js API route handler  (app/api/ai/chat/route.ts)
    ↓  AIProvider.chatReply()
OllamaProvider  (lib/ai/ollama-provider.ts)
    ↓  HTTP POST localhost:11434/api/chat
Local Ollama → Gemma model
```

| Concern | Location |
|---|---|
| Chat types (message, roles, request/response, lesson context) | `lib/ai/chat-types.ts` |
| AI provider interface (`AIProvider`) | `lib/ai/provider.ts` |
| Ollama-specific implementation (the ONLY Ollama-aware file) | `lib/ai/ollama-provider.ts` |
| Age-adaptive system prompts (Gemma persona + age-group tone) | `lib/ai/prompts.ts` |
| Next.js API route (server-side bridge to the provider) | `app/api/ai/chat/route.ts` |
| Provider-agnostic client (UI calls only this) | `lib/ai/chat-client.ts` |

#### Key design decisions
- The UI never touches Ollama — it calls `sendChatMessage()` which POSTs to `/api/ai/chat`. The API route talks to the `AIProvider` interface.
- `lib/ai/ollama-provider.ts` is the single file that knows `http://localhost:11434`, Ollama's JSON format, and error shapes. To swap runtimes, implement a new provider and wire it in the route; nothing else changes.
- System prompts are age-adaptive (5–7, 8–12, 13–17, 18+) and encode the full Gemma STEM instructor persona: vocabulary, depth, question style, examples, and guidance-when-stuck.
- Error handling at every layer maps failures (connection refused, timeout, model not found, empty response) to user-friendly messages — the browser never sees stack traces.
- Model name is set via the `GEMMA_MODEL` environment variable (defaults to `gemma2:2b`). Ollama URL via `OLLAMA_BASE_URL` (defaults to `http://localhost:11434`).

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

- **Switch the AI model:** set `GEMMA_MODEL=gemma4:latest` in `.env.local` (or any other model name Ollama has). Default is `gemma2:2b`.
- **Change the Ollama URL:** set `OLLAMA_BASE_URL=http://my-machine:11434` in `.env.local` (default is `http://localhost:11434`).

- **Colors:** edit CSS variables in `app/globals.css` (`:root` and the dark-mode block).
- **Fonts:** swap the `next/font/google` imports in `app/layout.tsx`.
- **Add a lesson:** append a `Lesson` object to `LESSONS` in `lib/lessons.ts` — the dashboard and sidebar render from this data automatically.
- **Add a lesson step:** add to a lesson's `steps` array; set `requiresFutureWork: true` if it depends on hardware/AI not yet implemented.
- **Reset the local profile:** click "Reset profile" at the bottom of the dashboard, or clear `gemma-stem:student-profile` in browser storage.

## Recent Changes

- **2026-07-25 (Part 1):** Built the Gemma STEM foundation — design system, TypeScript types, student profile (local-first, refresh-persistent), age-group logic, reusable lesson data structures, welcome screen, profile modal with validation, student dashboard, and the hybrid Temperature Sensors lesson interface with placeholder Gemma instructor panel. No AI/hardware/sensor/scoring integration yet.
- **2026-07-25 (Part 2A):** Upgraded the Gemma panel into a full chat interface. Added a provider-agnostic AI chat client (`lib/ai/`) targeting the future `/api/ai/chat` route, a `LessonChatContext` (student + lesson + step) wired from `LessonLayout`, and reusable chat UI states (empty/thinking/error-with-retry, bubbles, auto-scroll, Enter-to-send). Used a clearly-marked simulation; no real AI yet.
- **2026-07-25 (Part 2B):** Connected the Gemma chat to a real local AI model. Added the `AIProvider` interface (`lib/ai/provider.ts`), `OllamaProvider` implementation (`lib/ai/ollama-provider.ts` — the only Ollama-aware file), age-adaptive system prompts for all four age groups with the full Gemma STEM instructor persona (`lib/ai/prompts.ts`), and a server-side API route (`app/api/ai/chat/route.ts`) that bridges the frontend to the provider with user-friendly error handling (connection, timeout, model not found, empty response — all user-friendly, no stack traces at the browser). Replaced the Part 2A simulation in `lib/ai/chat-client.ts` with a real fetch. Model name via `GEMMA_MODEL` env var (default `gemma2:2b`). Ollama URL via `OLLAMA_BASE_URL` (default `http://localhost:11434`).
- **2026-07-25 (Part 3A):** Rebuilt the lesson interface around a structured data system. Added `Concept`, `Activity`, `Question` (MCQ + true/false) types to `lib/types.ts`; restructured the Temperature Sensors lesson in `lib/lessons.ts` into 7 steps (Introduction, What is a Sensor?, Temperature Sensors, Prepare the Experiment, Experiment, Knowledge Check, Final Assessment) with concepts, activities, and quiz questions as typed data — not hardcoded in the UI. Built reusable content-block renderers (`components/lesson/content-blocks.tsx`: concept cards, activity cards, question cards, MCQ, true/false) and rewrote `LessonContent.tsx` to dispatch by step kind. Updated `use-lesson-progress.ts` with `completeAndAdvance()` so each content step can be marked done and unlock the next (steps 5–7 still locked pending hardware/scoring). Progressive disclosure concept cards, full quiz interaction with instant feedback, and "Continue" CTAs wired throughout. Gemma panel stays in place across every step.
- **2026-07-25 (Part 3B):** Integrated MakerBuddy curriculum knowledge into the lesson data and Gemma's teaching context. Added `knowledgeBlock`, `requiredHardware`, and age-targeted question `minAge` to the type system. Replaced generic lesson content with MakerBuddy-authentic facts: DHT11 and DS18B20 sensors, the Input→Process→Output IoT cycle, ADC conversion, and data logging. A structured `knowledgeBlock` feeds Gemma's system prompt so all responses stay within the lesson scope and use real sensor specifications. Updated `buildSystemPrompt()` to inject lesson knowledge and refined adaptive teaching: separate paths for "confused" (simplify, guide, re-explain) and "understood" (deeper questions, real-world applications, stretch challenges). Knowledge check (step 6) is now interactive with instant feedback; questions are age-filtered — younger students (5–12) see MCQs and true/false, older students (13+) also get reasoning/conceptual questions. No scoring yet.
- **2026-07-25 (Part 4):** Connected real MakerBuddy hardware. Built the hardware abstraction layer (`lib/hardware/provider.ts` — `HardwareProvider` interface with `connect`, `disconnect`, `subscribeToUpdates`, etc.) with two implementations: `MakerBuddyProvider` (`lib/hardware/makerbuddy-provider.ts`) that communicates with the MakerBuddy ESP32 over Wi-Fi + WebSocket (parses the compact JSON protocol, extracts DS18B20 temperature from `d8` key, handles reconnection with exponential backoff), and `SimulationProvider` (`lib/hardware/simulation-provider.ts`) with four scenarios (stable, warming, cooling, volatile) clearly labeled as simulation. Added hardware UI components (`components/hardware/`): `HardwarePanel` with connection controls, mode toggle (Simulation / Real Hardware), live temperature display, SVG temperature history graph, and `ConnectionStatusBadge` for the five connection states (disconnected, connecting, connected, error, reconnecting). Unlocked the experiment step in the lesson so students connect their DS18B20 and watch real-time data. The browser connects directly to the ESP32's WebSocket server (`ws://<ip>/ws`) over the local network — no server-side proxy needed.