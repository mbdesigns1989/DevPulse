# DevPulse Dashboard

A task-management dashboard built to demonstrate a modern, production-style React stack —
data fetching with caching, type-safe forms, optimistic updates, and a polished themed UI.

> **Note:** This is a learning/demo project. It runs against a **mock API**
> ([JSONPlaceholder](https://jsonplaceholder.typicode.com)) that accepts writes but does **not
> persist** them — newly created tasks live in the in-memory query cache for the session and reset
> on a full page reload. The point is to showcase the patterns, not to be a real backend.

## Tech Stack

| Tool | Why it's here |
|---|---|
| **Vite + React 19 + TypeScript** | Fast dev/build; typed components end to end. |
| **Tailwind CSS v4** | CSS-first config (`@theme`), design-token driven — light/dark "for free". |
| **shadcn/ui** | Accessible, owned-in-repo component primitives (table, dialog, select, badge, …). |
| **React Router** | Nested layout route so the shell (sidebar + topbar) persists across pages. |
| **Zustand** | Lightweight global app state (user session, UI density). |
| **TanStack Query** | Server-state caching, dedup, loading/error states, optimistic mutations. |
| **Axios** | Central HTTP client with auth + error-toast interceptors. |
| **React Hook Form + Zod** | One schema = runtime validation **and** static types for the create form. |
| **sonner** | Toast notifications (errors surfaced globally via the Axios interceptor). |
| **Recharts** (via shadcn chart) | The dashboard status donut, styled with the app's theme tokens. |
| **Vitest** | Unit tests for the pure logic (filter/sort, schema, API mapper). |

## Architecture

```
src/
  api/             # Axios client + interceptors; typed task endpoints + anti-corruption mapper
  components/
    layout/        # AppLayout (shell), AppSidebar, Topbar
    ui/            # shadcn primitives (owned in-repo)
    dashboard/     # StatCard (with built-in Skeleton loading state)
    tasks/         # TaskTable, CreateTaskDialog, status/priority badges
    theme/         # ThemeProvider (Context) + ModeToggle
  hooks/           # useFetchTasks (useQuery) + useCreateTask (useMutation)
  lib/             # filter/sort logic, Zod schema, date format, QueryClient, utils
  pages/           # Dashboard, Tasks, Settings
  router/          # route tree (nested layout)
  store/           # Zustand app store
  types/           # domain types (Task, TaskStatus, TaskPriority)
```

## Key Patterns

- **Anti-corruption layer** — the API returns flat `{id, title, completed, userId}`; a mapper
  (`api/tasks.ts`) translates it into the app's richer `Task` shape, so the UI never depends on the
  API's vocabulary.
- **Shared query cache** — Dashboard and Tasks both read the same `["tasks"]` query, so navigating
  between them triggers **zero** extra network requests within the stale window.
- **Optimistic create + rollback** — new tasks appear instantly via cache write; on failure the
  cache is restored from a snapshot and an error toast fires.
- **Type-safe enum → UI mapping** — status/priority badge colors come from exhaustive
  `Record<TaskStatus, …>` lookups, so adding an enum value without a color is a compile error.
- **Right tool per state** — React **Context** for theme, **Zustand** for global app state,
  **`useReducer`** for page-local filter state.
- **Token-based theming** — all colors are CSS theme tokens, so light/dark mode works everywhere
  without per-component branching.
- **Insight-rich dashboard** — accented stat cards, a task-status donut chart (Recharts), a recent-
  activity feed, and a quick-actions grid — all derived from the single shared `["tasks"]` query
  (no extra fetches) and fully theme-aware.

## Getting Started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the unit tests
npm run build    # type-check + production build
```

## Demo

See **[WALKTHROUGH.md](WALKTHROUGH.md)** for a short, presenter-ready demo script with screenshots —
highlighting the two biggest wins: **React Query caching** (no manual fetch/loading/refetch
plumbing) and **Zod validation** (one schema for runtime + compile-time safety).
