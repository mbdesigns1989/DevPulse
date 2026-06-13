# DevPulse Day 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire TanStack React Query into the app — a shared `useFetchTasks` hook (custom staleTime/gcTime) feeds both the Tasks page (with Skeleton rows) and the Dashboard (derived stat cards with their Skeleton state), all from one cached `getTasks()` query.

**Architecture:** A single `QueryClient` wraps the app. `useFetchTasks()` (queryKey `["tasks"]`) calls the Day 4 `getTasks()`. Tasks and Dashboard both consume it, so React Query serves one cached fetch across navigation. The mock array is removed.

**Tech Stack:** @tanstack/react-query, React, TypeScript, shadcn Skeleton.

**Note on commits:** Per user instruction, this plan does NOT commit. Each task ends with a **Verify** checkpoint.

**Note on testing:** No unit tests this day — the work is hook/provider wiring + UI loading states, verified via `npm run build` + browser (Network tab for caching). Existing Day 3/4 tests must keep passing.

**Note on verification:** Run from `d:/0xxxxxx`.

---

### Task 1: Install React Query + QueryClient + provider

**Files:**
- Modify: `package.json` (dep)
- Create: `src/lib/query-client.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install**

Run: `npm install @tanstack/react-query`
Expected: installs with no errors.

- [ ] **Step 2: Create the QueryClient**

`src/lib/query-client.ts`:

```ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient()
```

- [ ] **Step 3: Wrap the app in `src/main.tsx`**

Replace the file with:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { queryClient } from "@/lib/query-client"
import { router } from "@/router"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 2: useFetchTasks hook

**Files:**
- Create: `src/hooks/use-tasks.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useQuery } from "@tanstack/react-query"
import { getTasks } from "@/api/tasks"

export function useFetchTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 60_000, // 1 min: data stays "fresh" — no refetch on remount/navigation within this window
    gcTime: 300_000, // 5 min: unused cache is kept this long before garbage collection
  })
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 3: Rewire the Tasks page to useQuery + Skeleton rows

**Files:**
- Modify: `src/pages/Tasks.tsx`

- [ ] **Step 1: Replace the file**

Swaps the `mockTasks` import for `useFetchTasks`; the filter memo now depends on fetched `tasks`;
adds loading (Skeleton rows) and error states. Filter controls/reducer/handlers unchanged.

```tsx
import { useCallback, useMemo, useReducer } from "react"
import { useFetchTasks } from "@/hooks/use-tasks"
import { filterAndSortTasks, type Filters } from "@/lib/filter-tasks"
import type { TaskPriority, TaskStatus } from "@/types/task"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Action =
  | { type: "SET_SEARCH"; value: string }
  | { type: "SET_STATUS"; value: TaskStatus | "all" }
  | { type: "SET_PRIORITY"; value: TaskPriority | "all" }
  | { type: "SET_SORT"; value: Filters["sort"] }
  | { type: "RESET" }

const initialFilters: Filters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "newest",
}

function filtersReducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.value }
    case "SET_STATUS":
      return { ...state, status: action.value }
    case "SET_PRIORITY":
      return { ...state, priority: action.value }
    case "SET_SORT":
      return { ...state, sort: action.value }
    case "RESET":
      return initialFilters
  }
}

const statusLabel: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

export default function Tasks() {
  const { data: tasks = [], isLoading, isError } = useFetchTasks()
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters)

  // Heavy computation: filter + sort. Recomputes only when tasks or filters change.
  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, filters),
    [tasks, filters]
  )

  const onSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: "SET_SEARCH", value: e.target.value }),
    []
  )
  const onStatus = useCallback(
    (value: string) =>
      dispatch({ type: "SET_STATUS", value: value as TaskStatus | "all" }),
    []
  )
  const onPriority = useCallback(
    (value: string) =>
      dispatch({ type: "SET_PRIORITY", value: value as TaskPriority | "all" }),
    []
  )
  const onSort = useCallback(
    (value: string) =>
      dispatch({ type: "SET_SORT", value: value as Filters["sort"] }),
    []
  )
  const onReset = useCallback(() => dispatch({ type: "RESET" }), [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Filter and sort your team's tasks.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by title..."
          value={filters.search}
          onChange={onSearch}
          className="max-w-xs"
        />
        <Select value={filters.status} onValueChange={onStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={onPriority}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.sort} onValueChange={onSort}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onReset}>Reset</Button>
      </div>

      {isLoading ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Couldn't load tasks.
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {visibleTasks.length} of {tasks.length} tasks
          </p>
          {visibleTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No tasks match your filters.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {visibleTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="font-medium">{task.title}</span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{statusLabel[task.status]}</span>
                    <span className="capitalize">{task.priority}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 4: Rewire the Dashboard to derived data + Skeleton

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace the file**

Cards now derive from fetched tasks; `loading` drives the StatCard Skeleton. No fake deltas —
neutral captions instead.

```tsx
import { useMemo } from "react"
import { AlertTriangle, CheckCircle2, ListTodo, Loader2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { useFetchTasks } from "@/hooks/use-tasks"

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useFetchTasks()

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "done").length,
      highPriority: tasks.filter((t) => t.priority === "high").length,
    }),
    [tasks]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your team's activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value={String(stats.total)} delta="All tasks" icon={ListTodo} loading={isLoading} />
        <StatCard label="In Progress" value={String(stats.inProgress)} delta="Currently active" icon={Loader2} loading={isLoading} />
        <StatCard label="Completed" value={String(stats.completed)} delta="Finished" icon={CheckCircle2} loading={isLoading} />
        <StatCard label="High Priority" value={String(stats.highPriority)} delta="Needs attention" icon={AlertTriangle} loading={isLoading} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 5: Delete the mock data

**Files:**
- Delete: `src/data/mock-tasks.ts`

- [ ] **Step 1: Confirm nothing imports it**

Run: Grep for `mock-tasks` across `src`.
Expected: no matches (Tasks page now uses `useFetchTasks`).

- [ ] **Step 2: Delete the file**

Run: `rm src/data/mock-tasks.ts`
(Leave `src/data/` empty dir or remove it; harmless either way.)

- [ ] **Step 3: Verify build + tests**

Run: `npm run build` → clean.
Run: `npm test` → Day 3 + Day 4 tests still pass (filter-tasks + mapper).

---

### Task 6: Full verification against success criteria

- [ ] **Step 1: Build + tests**

Run: `npm run build` → clean. `npm test` → all pass.

- [ ] **Step 2: Browser — Tasks page fetch + skeleton**

Run: `npm run dev` (background). Open `/tasks`:
- Network tab (Fetch/XHR): a `GET /todos?_limit=12` request appears, with `Authorization: Bearer`
  header (carried over from Day 4 interceptor).
- Briefly on load, Skeleton rows show, then real fetched tasks render through the filter controls.
- Typing in search still filters; sort/status/priority still work on the live data.

- [ ] **Step 3: Browser — Dashboard derived cards + skeleton**

Open `/dashboard`:
- The 4 cards show values derived from the data (Total = 12 from JSONPlaceholder's `_limit=12`,
  plus In Progress / Completed / High Priority counts consistent with the task list).
- On a hard reload, the cards briefly show their Skeleton state, then the numbers.

- [ ] **Step 4: Browser — caching demo (the key proof)**

With the Network tab open and cleared: navigate Dashboard → Tasks → Dashboard within ~60s.
Expected: only ONE `GET /todos` request total (subsequent page views served from React Query
cache within `staleTime`). This demonstrates the custom `staleTime`.

Note: React StrictMode in dev may double-invoke once on first mount; the caching point is that
*navigation between the two pages* does not refetch — confirm no new request fires on the 2nd/3rd
navigation.

---

## Self-Review

**Spec coverage:**
- Install RQ + QueryClientProvider (order RQ > Theme > Router) → Task 1. `useFetchTasks` with
  staleTime/gcTime → Task 2. Tasks page: useQuery + Skeleton rows + error state, filter memo on
  fetched data → Task 3. Dashboard: derived cards + StatCard loading skeleton, neutral captions
  (no fake deltas) → Task 4. Delete mock-tasks → Task 5. Shared cache / caching demo → Task 6
  Step 4. Skeleton-no-layout-shift, filtering on live data → Task 6. All spec sections covered.

**Placeholder scan:** No TBD/TODO. Every code step shows the full file. Verify steps give exact
commands + expected results.

**Type consistency:** `useFetchTasks()` returns React Query's result; consumed as
`{ data: tasks = [], isLoading, isError }` (Task 3) and `{ data: tasks = [], isLoading }` (Task 4) —
both valid destructures of the same hook. `getTasks(): Promise<Task[]>` (Day 4) is the queryFn, so
`data` is `Task[]`; `filterAndSortTasks(tasks, filters)` (Day 3) accepts `Task[]`. `StatCard` props
(`label`/`value`/`delta`/`icon`/`loading`) match Day 2's definition. `queryKey: ["tasks"]` is
identical in the single hook (one definition, shared). `statusLabel`/`Filters`/reducer `Action`
unchanged from Day 3.

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
