# DevPulse Day 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Zustand global store (mock user + UI density), and a Tasks page with client-side search/status/priority/sort filtering whose pure filter logic is unit-tested and memoized with `useMemo`/`useCallback`.

**Architecture:** Global app state in a Zustand store; page-local filter state via `useReducer`; theme stays in Day 2's React Context. The filter/sort logic is extracted into a pure function (`filterAndSortTasks`) so it can be unit-tested in isolation and reused unchanged when Day 5 swaps mock data for the API.

**Tech Stack:** React 19, TypeScript, Zustand, shadcn/ui (select), Vitest (new, for the pure-logic test).

**Note on commits:** Per user instruction, this plan does NOT commit — the user commits. Each task ends with a **Verify** checkpoint.

**Note on verification:** Run from `d:/0xxxxxx`. Pure logic is verified with Vitest; store + UI behavior via `npm run build` + a browser check.

---

### Task 1: Install Zustand + set up Vitest

**Files:**
- Modify: `package.json` (deps + test script)
- Create: `vitest.config.ts`

- [ ] **Step 1: Install dependencies**

Run: `npm install zustand` then `npm install -D vitest`
Expected: both install with no errors.

- [ ] **Step 2: Create `vitest.config.ts`**

Vitest needs the same `@` alias the app uses.

```ts
import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
  },
})
```

- [ ] **Step 3: Add a `test` script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verify the test runner works (no tests yet)**

Run: `npm test`
Expected: Vitest runs and reports "No test files found" (exit is non-zero but that's fine at this
point — it confirms Vitest is wired). Proceed.

---

### Task 2: Task types

**Files:**
- Create: `src/types/task.ts`

- [ ] **Step 1: Create the types**

```ts
export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export type Task = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  createdAt: string // ISO date
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 3: Mock task data

**Files:**
- Create: `src/data/mock-tasks.ts`

- [ ] **Step 1: Create 12 mock tasks**

```ts
import type { Task } from "@/types/task"

export const mockTasks: Task[] = [
  { id: "1", title: "Fix login redirect loop", status: "in_progress", priority: "high", assignee: "Nour", createdAt: "2026-06-01" },
  { id: "2", title: "Add dark mode toggle", status: "done", priority: "medium", assignee: "Sara", createdAt: "2026-05-28" },
  { id: "3", title: "Write API docs", status: "todo", priority: "low", assignee: "Omar", createdAt: "2026-06-05" },
  { id: "4", title: "Optimize image loading", status: "todo", priority: "medium", assignee: "Nour", createdAt: "2026-06-03" },
  { id: "5", title: "Refactor auth middleware", status: "in_progress", priority: "high", assignee: "Sara", createdAt: "2026-06-02" },
  { id: "6", title: "Set up CI pipeline", status: "done", priority: "high", assignee: "Omar", createdAt: "2026-05-25" },
  { id: "7", title: "Design settings page", status: "todo", priority: "low", assignee: "Lina", createdAt: "2026-06-06" },
  { id: "8", title: "Migrate to Tailwind v4", status: "done", priority: "medium", assignee: "Nour", createdAt: "2026-05-30" },
  { id: "9", title: "Add task filtering", status: "in_progress", priority: "medium", assignee: "Lina", createdAt: "2026-06-07" },
  { id: "10", title: "Fix mobile sidebar overlap", status: "todo", priority: "high", assignee: "Sara", createdAt: "2026-06-04" },
  { id: "11", title: "Update dependencies", status: "todo", priority: "low", assignee: "Omar", createdAt: "2026-06-08" },
  { id: "12", title: "Write unit tests for store", status: "in_progress", priority: "medium", assignee: "Nour", createdAt: "2026-06-09" },
]
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 4: Pure filter/sort logic (TDD)

**Files:**
- Create: `src/lib/filter-tasks.ts`
- Create: `src/lib/filter-tasks.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/filter-tasks.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { filterAndSortTasks, type Filters } from "@/lib/filter-tasks"
import type { Task } from "@/types/task"

const tasks: Task[] = [
  { id: "a", title: "Alpha task", status: "todo", priority: "low", assignee: "X", createdAt: "2026-01-01" },
  { id: "b", title: "Beta task", status: "done", priority: "high", assignee: "Y", createdAt: "2026-03-01" },
  { id: "c", title: "Gamma alpha", status: "in_progress", priority: "medium", assignee: "Z", createdAt: "2026-02-01" },
]

const base: Filters = { search: "", status: "all", priority: "all", sort: "newest" }

describe("filterAndSortTasks", () => {
  it("returns all tasks newest-first by default", () => {
    const r = filterAndSortTasks(tasks, base)
    expect(r.map((t) => t.id)).toEqual(["b", "c", "a"])
  })

  it("filters by case-insensitive title substring", () => {
    const r = filterAndSortTasks(tasks, { ...base, search: "ALPHA" })
    expect(r.map((t) => t.id).sort()).toEqual(["a", "c"])
  })

  it("filters by status", () => {
    const r = filterAndSortTasks(tasks, { ...base, status: "done" })
    expect(r.map((t) => t.id)).toEqual(["b"])
  })

  it("filters by priority", () => {
    const r = filterAndSortTasks(tasks, { ...base, priority: "high" })
    expect(r.map((t) => t.id)).toEqual(["b"])
  })

  it("sorts oldest-first", () => {
    const r = filterAndSortTasks(tasks, { ...base, sort: "oldest" })
    expect(r.map((t) => t.id)).toEqual(["a", "c", "b"])
  })

  it("sorts by priority high to low", () => {
    const r = filterAndSortTasks(tasks, { ...base, sort: "priority" })
    expect(r.map((t) => t.id)).toEqual(["b", "c", "a"])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `filterAndSortTasks` is not defined / module not found.

- [ ] **Step 3: Implement `filter-tasks.ts`**

```ts
import type { Task, TaskPriority, TaskStatus } from "@/types/task"

export type Filters = {
  search: string
  status: TaskStatus | "all"
  priority: TaskPriority | "all"
  sort: "newest" | "oldest" | "priority"
}

const priorityRank: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 }

export function filterAndSortTasks(tasks: Task[], filters: Filters): Task[] {
  const q = filters.search.trim().toLowerCase()

  const filtered = tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false
    if (filters.status !== "all" && t.status !== filters.status) return false
    if (filters.priority !== "all" && t.priority !== filters.priority) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return b.createdAt.localeCompare(a.createdAt)
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt)
      case "priority":
        return priorityRank[b.priority] - priorityRank[a.priority]
    }
  })

  return sorted
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all 6 tests green.

---

### Task 5: Zustand global store

**Files:**
- Create: `src/store/app-store.ts`

- [ ] **Step 1: Create the store**

```ts
import { create } from "zustand"

export type User = { name: string; email: string; role: string }
export type Density = "comfortable" | "compact"

type AppState = {
  user: User
  density: Density
  setUser: (user: User) => void
  setDensity: (density: Density) => void
}

export const useAppStore = create<AppState>()((set) => ({
  user: { name: "Nour", email: "nour@devpulse.app", role: "Admin" },
  density: "comfortable",
  setUser: (user) => set({ user }),
  setDensity: (density) => set({ density }),
}))
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 6: Consume the store in the Topbar

**Files:**
- Modify: `src/components/layout/Topbar.tsx`

- [ ] **Step 1: Show user name and a density toggle in the user menu**

The user menu currently has static items. Wire it to the store: show the user's name in the
label, and toggle density. Replace the file with:

```tsx
import { CircleUser } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { useAppStore } from "@/store/app-store"

export function Topbar({ title }: { title: string }) {
  const user = useAppStore((s) => s.user)
  const density = useAppStore((s) => s.density)
  const setDensity = useAppStore((s) => s.setDensity)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                setDensity(density === "comfortable" ? "compact" : "comfortable")
              }
            >
              Density: {density}
            </DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 7: Add shadcn select

**Files:**
- Create: `src/components/ui/select.tsx` (via CLI)

- [ ] **Step 1: Add the component**

Run: `npx shadcn@latest add select --yes`
Expected: creates `src/components/ui/select.tsx`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 8: Tasks page — filter reducer + controls + memoized list

**Files:**
- Modify: `src/pages/Tasks.tsx`

- [ ] **Step 1: Build the Tasks page**

Uses `useReducer` for filter state, `useMemo` for the filtered/sorted list (delegating to the
unit-tested `filterAndSortTasks`), and `useCallback` for stable handlers.

```tsx
import { useCallback, useMemo, useReducer } from "react"
import { mockTasks } from "@/data/mock-tasks"
import { filterAndSortTasks, type Filters } from "@/lib/filter-tasks"
import type { TaskPriority, TaskStatus } from "@/types/task"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters)

  // Heavy computation: filter + sort the full list. Memoized so it only
  // recomputes when the filters change, not on every unrelated re-render.
  const visibleTasks = useMemo(
    () => filterAndSortTasks(mockTasks, filters),
    [filters]
  )

  // Stable handler references across renders (useCallback).
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

      <p className="text-sm text-muted-foreground">
        Showing {visibleTasks.length} of {mockTasks.length} tasks
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
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 9: Full verification against success criteria

- [ ] **Step 1: Unit tests + build**

Run: `npm test` → expected: 6 tests pass.
Run: `npm run build` → expected: clean build.

- [ ] **Step 2: Browser verification**

Run: `npm run dev` (background). On the Tasks page (`/tasks`) confirm:
- The list shows 12 tasks, "Showing 12 of 12 tasks".
- Typing "fix" in search narrows to matching titles; count updates.
- Status select = "Done" shows only done tasks; Priority = "High" filters correctly.
- Sort = "Oldest" reverses order; "Priority" orders high→low.
- Reset restores all 12.
- Set search to gibberish → empty state "No tasks match your filters." shows.

On the Topbar user menu confirm:
- The label shows the store's user name ("Nour").
- Clicking "Density: comfortable" toggles it to "Density: compact" and back (reads/writes store).

- [ ] **Step 3: Confirm hooks are present in source**

Run: Grep for `useMemo` and `useCallback` in `src/pages/Tasks.tsx`.
Expected: both present (the memoized list + memoized handlers).

- [ ] **Step 4: Confirm theme still works**

Toggle dark mode via the topbar; confirm Tasks page + cards stay legible.

---

## Self-Review

**Spec coverage:**
- Zustand global store (user + density) → Tasks 5–6. Page-local filter state via `useReducer` →
  Task 8. Theme unchanged (Context) → verified Task 9 Step 4. Types → Task 2. Mock data (12,
  swappable on Day 5) → Task 3. Filtering controls (search/status/priority/sort + reset) → Task 8.
  `useMemo` for filter/sort, `useCallback` for handlers → Task 8. shadcn select → Task 7. Result
  count + empty state → Task 8. Pure logic unit-tested → Task 4. Success-criteria verification →
  Task 9. All spec sections covered.
- Note: spec marked density-driven row padding as optional/stretch; intentionally omitted to keep
  scope tight. Core criterion (density toggles via store) is covered.

**Placeholder scan:** No TBD/TODO. Every code step shows the full file/function. Verify steps give
exact commands + expected results.

**Type consistency:** `Filters` is defined once in `filter-tasks.ts` (Task 4) and imported by both
the test (Task 4) and the Tasks page (Task 8). `filterAndSortTasks(tasks, filters)` signature
matches between definition (Task 4), test (Task 4), and call site (Task 8). `Task`/`TaskStatus`/
`TaskPriority` from Task 2 used consistently. Store exports `useAppStore` with `user`/`density`/
`setUser`/`setDensity` (Task 5) matching consumption in Task 6. Reducer `Action` variants match
the `dispatch` calls in the `useCallback` handlers (Task 8).

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
