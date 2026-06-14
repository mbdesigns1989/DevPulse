# DevPulse Dashboard — Day 10 Design: Showcase Readiness & Documentation

**Date:** 2026-06-13
**Status:** Approved

## Goal

Replace the boilerplate README with a crisp, boss-facing project doc, and produce a ready-to-record
`WALKTHROUGH.md` demo script (built on the user's own draft) backed by real captured screenshots —
since an actual video/audio recording cannot be produced by the agent.

## Deliverables

1. `README.md` — full replacement of the Vite boilerplate.
2. `WALKTHROUGH.md` — 4-scene demo script (user's 3 scenes + a caching scene), each linked to a
   committed screenshot.
3. `docs/screenshots/` — real screenshots captured from the running app.

## README.md

Replaces the default Vite template content. Sections:

- **Title + one-line pitch** — "DevPulse — a task-management dashboard demonstrating a modern,
  production-style React stack."
- **Honesty note** — states it's a learning/demo project backed by a **mock API (JSONPlaceholder)**
  that does not persist writes; created tasks live in the in-memory cache for the session.
- **Tech stack table** — choice + one-line *why* for each: Vite, React 19 + TypeScript, Tailwind
  CSS v4, shadcn/ui, React Router, Zustand, TanStack Query, Axios, React Hook Form + Zod, Vitest.
- **Architecture (folder map)** — annotated `src/` tree, one line per directory:
  - `api/` — Axios client, interceptors, typed task endpoints + anti-corruption mapper
  - `components/layout/` — sidebar, topbar, app shell
  - `components/ui/` — shadcn primitives
  - `components/dashboard/` — StatCard
  - `components/tasks/` — TaskTable, CreateTaskDialog, badges
  - `components/theme/` — theme provider + mode toggle
  - `hooks/` — `useFetchTasks` / `useCreateTask`
  - `lib/` — filter/sort logic, schema, date format, query client, utils
  - `pages/` — Dashboard, Tasks, Settings
  - `router/` — route tree
  - `store/` — Zustand app store
  - `types/` — domain types
- **Key patterns** — short bullets: anti-corruption mapper, shared `["tasks"]` query cache,
  optimistic create + rollback, type-safe enum→badge mapping, Context (theme) + Zustand (app state)
  split, token-based theming for light/dark.
- **Getting started** — `npm install`, `npm run dev`, `npm test`, `npm run build`.
- **Demo** — 2-3 lines pointing to `WALKTHROUGH.md` and the caching + Zod highlights.

## Screenshots (`docs/screenshots/`)

Captured from the running app:

- `zod-validation.png` — create dialog with inline Zod errors visible.
- `data-mapping.png` — the polished 5-column table (mapper output: badged Priority/Assignee).
  (A literal split with raw JSON is ideal but hard to capture in one automated frame; the table
  screenshot plus an inline JSON snippet in the doc achieves the same side-by-side effect.)
- `optimistic-create.png` — the new task row at the top of the table.
- `caching.png` — Network tab (or a captured request count) showing one `/todos` request after
  navigating Dashboard → Tasks → Dashboard.
- `table-dark.png` — the badge table in dark mode (visual polish).

## WALKTHROUGH.md

Built on the user's draft; keeps its **Scenario → Action → Expected Result → "what it proves"**
structure. Four scenes:

### Scene 1 — Client-Side Schema Validation (Zod + RHF)
User's draft, verbatim intent: open "New Task", submit empty → dialog stays open, inline red errors
appear (char length, enums, deadline boundary). Links `zod-validation.png`.

### Scene 2 — Server Data Mapping (Anti-Corruption Layer)
User's draft: navigate to Tasks / refresh, inspect Network `/todos`; flat API payload vs. the
polished table with derived `Priority`/`Assignee` badges. Side-by-side via `data-mapping.png` plus a
small raw-JSON snippet inline. Keeps the user's excellent split-view framing.

### Scene 3 — React Query Caching (NEW — the headline code-saving win)
Navigate Dashboard → Tasks → Dashboard within the staleTime window; Network tab shows **one**
`/todos` request total — subsequent views served from cache. Talking point: no manual
`useEffect`/loading/error/refetch plumbing; one `useQuery` hook, shared cache across pages. Links
`caching.png`.

### Scene 4 — Optimistic Update & Rollback (offline)
User's draft, with two corrections:
- **Wording:** "table row" / "list", not "card/grid" (Day 8 made it a table).
- **Timing honesty:** the rollback fires after the failed request times out, which **can take a few
  seconds** offline (not "a second later") — set this expectation so a live demo doesn't look stuck.
Sequence: optimistic insert at top → request fails → error toast + row removed (cache rollback).
Links `optimistic-create.png`.

Each scene references its screenshot. A short intro notes the mock-API caveat.

## Out of Scope (YAGNI)

- An actual video/audio recording (agent cannot produce one; the script enables the user to record).
- Deployment, CONTRIBUTING, LICENSE.

## Success Criteria

- `README.md` no longer contains Vite boilerplate; has the stack table, annotated folder map, key
  patterns, getting-started commands, and the mock-API honesty note.
- `WALKTHROUGH.md` has all four scenes, accurate to the live app (table wording, honest offline
  timing), each linking a real screenshot in `docs/screenshots/`.
- `docs/screenshots/` contains the captured PNGs, and they render when the markdown is viewed.
- Getting-started commands in the README are correct (`npm run dev`/`test`/`build` all exist).
- No code/behavior change; build + 17 tests still pass (sanity check only).
