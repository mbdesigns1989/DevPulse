# DevPulse Dashboard — Day 5 Design: React Query Integration

**Date:** 2026-06-13
**Status:** Approved

## Goal

Replace direct mock-array usage with TanStack React Query. A shared `useFetchTasks` hook fetches
via the Day 4 Axios `getTasks()`, with custom `staleTime`/`gcTime`. The Tasks page and Dashboard
both consume the same cached query, and loading states use shadcn `Skeleton`.

## Provider Setup

- Install `@tanstack/react-query`.
- `src/lib/query-client.ts` — export a single `QueryClient` instance (default options are fine;
  per-query tuning lives in the hook).
- `src/main.tsx` — wrap the tree in `<QueryClientProvider client={queryClient}>`, outside the
  existing `<ThemeProvider>`. Order: `QueryClientProvider > ThemeProvider > RouterProvider`.

## Custom Hook

`src/hooks/use-tasks.ts`:

```ts
import { useQuery } from "@tanstack/react-query"
import { getTasks } from "@/api/tasks"

export function useFetchTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 60_000, // 1 min: data is "fresh" — no refetch on remount/navigation within this window
    gcTime: 300_000, // 5 min: unused/inactive cache is kept this long before garbage collection
  })
}
```

The shared `queryKey: ["tasks"]` lets the Dashboard and Tasks page reuse one cached fetch
(React Query dedupes concurrent requests and serves cache within `staleTime`).

## Tasks Page (`src/pages/Tasks.tsx`)

- Replace the `mockTasks` import with:
  `const { data: tasks = [], isLoading, isError } = useFetchTasks()`
- The existing filtering memo now runs on fetched data:
  `useMemo(() => filterAndSortTasks(tasks, filters), [tasks, filters])`
  (dependency array gains `tasks`).
- **Loading:** while `isLoading`, render ~6 `Skeleton` rows matching the real row layout (so there
  is no layout shift when data arrives). The filter controls remain visible.
- **Error:** if `isError`, render an inline message "Couldn't load tasks." (the Axios response
  interceptor already shows a toast; this is the in-place fallback).
- The result count, empty-state ("No tasks match your filters."), and all four filter/sort
  controls are unchanged in behavior.

## Dashboard (`src/pages/Dashboard.tsx`)

- Call `const { data: tasks = [], isLoading } = useFetchTasks()`.
- Derive the four card values from `tasks`:
  - **Total Tasks** = `tasks.length`
  - **In Progress** = count of `status === "in_progress"`
  - **Completed** = count of `status === "done"`
  - **High Priority** = count of `priority === "high"` (replaces the old "Team Members" card, which
    has no data source now)
- Pass `loading={isLoading}` to every `StatCard` so the built-in Skeleton state fires during the
  real fetch. Values are rendered as strings (e.g. `String(total)`).
- Card deltas (e.g. "+12 this week") are removed or replaced with static descriptive captions,
  since we have no historical data to compute a delta. Use a neutral caption per card (e.g.
  "All tasks", "Currently active", "Finished", "Needs attention").

## Cleanup

- Delete `src/data/mock-tasks.ts` — no longer referenced after both pages use `useFetchTasks`.
- Keep `src/lib/filter-tasks.ts` and its test (pure logic, still used by the Tasks page).

## Dependencies to Add

- `@tanstack/react-query`

## Out of Scope (YAGNI)

- Mutations / create / delete / optimistic updates (Day 7).
- React Query Devtools (not required; may be added later if desired).
- Pagination / infinite query.

## Success Criteria

- `npm run build` compiles; `npm test` still passes (Day 3 + Day 4 tests unaffected).
- Visiting `/tasks` fires a `GET /todos?_limit=12` request (with the Bearer header) and renders the
  fetched, mapped tasks through the existing filter/sort controls.
- During the fetch, the Tasks page shows Skeleton rows and the Dashboard stat cards show their
  Skeleton state; neither shifts layout when data arrives.
- The Dashboard cards show values derived from the fetched data (Total/In Progress/Completed/High
  Priority), consistent with the task list.
- **Caching:** navigating Dashboard → Tasks → Dashboard within the `staleTime` window results in
  only ONE `GET /todos` network request (subsequent views served from cache) — verifiable in the
  Network tab.
- `mock-tasks.ts` is deleted and nothing imports it.
- Filtering/sorting/empty-state still work on the live data.
