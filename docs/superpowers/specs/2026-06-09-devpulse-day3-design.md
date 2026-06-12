# DevPulse Dashboard — Day 3 Design: State Management & Advanced Hooks

**Date:** 2026-06-09
**Status:** Approved

## Goal

Establish app-wide global state with Zustand, and build client-side filtering/sorting on the
Tasks page that genuinely exercises `useMemo` and `useCallback`. Demonstrate the judgment of
*when* to use global state vs. page-local state.

## State Architecture (the teaching point)

- **Global state → Zustand.** App-wide concerns only: mock user session and a global UI config
  (display density). Lives in `src/store/app-store.ts`.
- **Page-local state → `useReducer`.** The Tasks filter state (search text, status, priority,
  sort) is specific to the Tasks page and does not belong in a global store. Held locally.
- **Theme → React Context (unchanged from Day 2).** Deliberately left as-is, so the project
  demonstrates *both* Context and Zustand patterns.

## Types & Mock Data

- `src/types/task.ts`
  - `export type TaskStatus = "todo" | "in_progress" | "done"`
  - `export type TaskPriority = "low" | "medium" | "high"`
  - `export type Task = { id: string; title: string; status: TaskStatus; priority: TaskPriority; assignee: string; createdAt: string }`
    (`createdAt` is an ISO date string.)
  - These union types are reused later (Day 6 Zod enums, Day 8 status badges).

- `src/data/mock-tasks.ts`
  - `export const mockTasks: Task[]` — 12 hand-written tasks spanning all statuses/priorities,
    varied titles and `createdAt` dates.
  - This is the single source of task data for now. **Day 5 replaces this source with the real
    API (React Query + Axios); the filtering/sorting logic written today does not change.**

## Global Store (Zustand)

`src/store/app-store.ts`:

```ts
type User = { name: string; email: string; role: string }
type Density = "comfortable" | "compact"

type AppState = {
  user: User
  density: Density
  setUser: (user: User) => void
  setDensity: (density: Density) => void
}
```

- Created with `create<AppState>()(...)`.
- Seeded with a mock user (e.g. name "Nour", role "Admin").
- `density` defaults to `"comfortable"`.

The store is consumed in the Topbar: the user-menu label shows `user.name`, and a menu item
toggles `density`. (Density only needs to *exist and toggle* this day; pages may read it later.)

## Tasks Page: Filtering + Optimization Hooks

`src/pages/Tasks.tsx` is rebuilt from the stub into the showcase.

### Filter state — `useReducer`

```ts
type Filters = {
  search: string
  status: TaskStatus | "all"
  priority: TaskPriority | "all"
  sort: "newest" | "oldest" | "priority"
}
```

A reducer with actions `SET_SEARCH`, `SET_STATUS`, `SET_PRIORITY`, `SET_SORT`, `RESET`.

### Controls

- Search `Input` (filters by title, case-insensitive substring).
- Status `Select` (All / To Do / In Progress / Done).
- Priority `Select` (All / Low / Medium / High).
- Sort `Select` (Newest / Oldest / Priority high→low).
- A "Reset" `Button` (dispatches `RESET`).

(Requires the shadcn `select` component — added this day.)

### Optimization hooks

- **`useMemo`** computes the filtered + sorted array, keyed on `[filters]` (mock data is a stable
  module import). This is the "heavy computation" — filtering then sorting the list. A code
  comment explains the rationale.
- **`useCallback`** wraps each control's change handler so they are stable references across
  renders. A code comment explains the rationale.

### Rendering

- A simple list (NOT the Day 8 table): each row shows title, status, and priority as text,
  styled with existing tokens. Density from the store may adjust row padding (optional, low risk).
- A result count line ("Showing N of 12 tasks").
- An empty state ("No tasks match your filters.") when the computed list is empty.

## shadcn Components to Add

- `select`

(`input`, `button`, `card` already present.)

## Dependencies to Add

- `zustand`

## Out of Scope (YAGNI)

- The shadcn data Table (Day 8).
- Real data fetching / React Query / Axios (Days 4–5).
- Task creation form / Zod (Day 6).
- Persisting filters to the URL or localStorage.

## Success Criteria

- `npm run build` compiles with no errors.
- The Zustand store exists; the Topbar shows the store's `user.name` and can toggle `density`
  (verifiable via the user menu).
- On the Tasks page: typing in search narrows the list by title; the status and priority selects
  filter correctly; sort reorders correctly; Reset restores the full list.
- The result count updates; the empty state shows when no task matches.
- The filtered/sorted computation is inside `useMemo`; the change handlers are wrapped in
  `useCallback` (verifiable by reading `src/pages/Tasks.tsx`).
- Theme (Day 2 Context) still works unchanged in light/dark.
