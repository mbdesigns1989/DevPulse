# DevPulse Day 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated Axios network layer — central client with a Bearer-auth request interceptor and a global error-toast response interceptor — plus a typed `getTasks()` that maps JSONPlaceholder `/todos` to our `Task` type, proven via a temporary dev probe.

**Architecture:** All HTTP lives in `src/api/`. `apiClient.ts` is the single Axios instance with interceptors; `tasks.ts` holds the anti-corruption mapper + `getTasks()`. Global errors surface as `sonner` toasts mounted in `AppLayout`. A temporary Dashboard probe verifies both interceptors, then is removed.

**Tech Stack:** axios, sonner (shadcn toast), React, TypeScript.

**Note on commits:** Per user instruction, this plan does NOT commit. Each task ends with a **Verify** checkpoint.

**Note on testing:** Per the project rule (tests only when they add value, flagged for veto):
**Task 5 adds ONE unit test for the pure `mapTodoToTask` mapper.** If you'd rather skip it,
say so and I'll drop Task 5's test steps. Everything else is verified via build + browser.

**Note on verification:** Run from `d:/0xxxxxx`. Interceptors verified in the browser Network/console; mapper via Vitest.

---

### Task 1: Install axios + add sonner toast

**Files:**
- Create: `src/components/ui/sonner.tsx` (via CLI)
- Modify: `package.json` (axios dep)

- [ ] **Step 1: Install axios**

Run: `npm install axios`
Expected: installs with no errors.

- [ ] **Step 2: Add the sonner component**

Run: `npx shadcn@latest add sonner --yes`
Expected: creates `src/components/ui/sonner.tsx` and installs the `sonner` package.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 2: Mount the Toaster in AppLayout

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Add the Toaster**

Add the import and render `<Toaster richColors />` inside the provider so toasts work app-wide.
Replace the file with:

```tsx
import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "./AppSidebar"
import { Topbar } from "./Topbar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Topbar title="DevPulse" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster richColors />
    </SidebarProvider>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 3: Raw API response type

**Files:**
- Create: `src/api/types.ts`

- [ ] **Step 1: Create the Todo type**

```ts
export type Todo = {
  id: number
  title: string
  completed: boolean
  userId: number
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 4: Axios client + interceptors

**Files:**
- Create: `src/api/apiClient.ts`

- [ ] **Step 1: Create the client with both interceptors**

```ts
import axios from "axios"
import { toast } from "sonner"

const DUMMY_TOKEN = "devpulse-demo-token-123"

export const apiClient = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

// Request interceptor: attach a dummy Bearer token to every request.
apiClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${DUMMY_TOKEN}`
  return config
})

// Response interceptor: surface global failures as toasts, then re-throw.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined
    let message: string
    if (status === 401) {
      message = "Session expired. Please sign in again."
    } else if (status && status >= 500) {
      message = "Server error. Please try again later."
    } else if (!error?.response) {
      message = "Network error. Check your connection."
    } else {
      message = `Request failed (${status}).`
    }
    toast.error(message)
    return Promise.reject(error)
  }
)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 5: Tasks API + mapper (with unit test — see testing note)

**Files:**
- Create: `src/api/tasks.ts`
- Create: `src/api/tasks.test.ts` *(the flagged test — skippable)*

- [ ] **Step 1: Write the failing test for the mapper**

`src/api/tasks.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { mapTodoToTask } from "@/api/tasks"
import type { Todo } from "@/api/types"

const todo: Todo = { id: 3, title: "Sample todo", completed: false, userId: 2 }

describe("mapTodoToTask", () => {
  it("maps id to a string and keeps the title", () => {
    const t = mapTodoToTask(todo)
    expect(t.id).toBe("3")
    expect(t.title).toBe("Sample todo")
  })

  it("derives status: completed -> done, id%3===0 -> in_progress, else todo", () => {
    expect(mapTodoToTask({ ...todo, completed: true }).status).toBe("done")
    expect(mapTodoToTask({ ...todo, id: 3, completed: false }).status).toBe("in_progress")
    expect(mapTodoToTask({ ...todo, id: 4, completed: false }).status).toBe("todo")
  })

  it("derives priority from id % 3", () => {
    expect(mapTodoToTask({ ...todo, id: 3 }).priority).toBe("low")
    expect(mapTodoToTask({ ...todo, id: 4 }).priority).toBe("medium")
    expect(mapTodoToTask({ ...todo, id: 5 }).priority).toBe("high")
  })

  it("derives assignee from userId % 4 and a valid ISO-ish date", () => {
    expect(mapTodoToTask({ ...todo, userId: 2 }).assignee).toBe("Omar")
    expect(mapTodoToTask(todo).createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `mapTodoToTask` not found.

- [ ] **Step 3: Implement `tasks.ts`**

```ts
import type { Task, TaskPriority } from "@/types/task"
import { apiClient } from "@/api/apiClient"
import type { Todo } from "@/api/types"

const priorities: TaskPriority[] = ["low", "medium", "high"]
const assignees = ["Nour", "Sara", "Omar", "Lina"]

export function mapTodoToTask(todo: Todo): Task {
  const status = todo.completed
    ? "done"
    : todo.id % 3 === 0
      ? "in_progress"
      : "todo"

  // Deterministic created date: spread ids across June 2026 (day 1-28).
  const day = String((todo.id % 28) + 1).padStart(2, "0")

  return {
    id: String(todo.id),
    title: todo.title,
    status,
    priority: priorities[todo.id % 3],
    assignee: assignees[todo.userId % 4],
    createdAt: `2026-06-${day}`,
  }
}

export async function getTasks(): Promise<Task[]> {
  const res = await apiClient.get<Todo[]>("/todos", { params: { _limit: 12 } })
  return res.data.map(mapTodoToTask)
}
```

Note on the test expectations: `id:3` → `id%3===0` → status `in_progress`, `priority` =
`priorities[0]` = `low`. `userId:2` → `assignees[2]` = `Omar`. These match the test.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all mapper tests green (plus the existing Day 3 filter tests).

---

### Task 6: Temporary dev probe in Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add the two temporary probes**

Add imports and a `useEffect` block to the existing Dashboard. Keep the existing stat-card JSX
unchanged; only add the imports and the effect. The full file:

```tsx
import { useEffect } from "react"
import { CheckCircle2, ListTodo, Loader2, Users } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { getTasks } from "@/api/tasks"
import { apiClient } from "@/api/apiClient"

export default function Dashboard() {
  // TEMP Day 4 probe — remove on Day 5 (React Query replaces this).
  useEffect(() => {
    getTasks()
      .then((tasks) => console.log("[Day4 probe] mapped tasks:", tasks))
      .catch(() => {})
    // Deliberate failure to exercise the response interceptor's error toast.
    apiClient.get("/nonexistent-xyz-404").catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your team's activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value="128" delta="+12 this week" icon={ListTodo} />
        <StatCard label="In Progress" value="34" delta="+5 today" icon={Loader2} />
        <StatCard label="Completed" value="86" delta="+8 today" icon={CheckCircle2} />
        <StatCard label="Team Members" value="—" loading icon={Users} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 7: Verify interceptors in the browser

- [ ] **Step 1: Run dev server**

Run: `npm run dev` (background). Open `/dashboard`.

- [ ] **Step 2: Verify the request interceptor (Bearer header)**

In the browser Network tab, find the `GET /todos?_limit=12` request → Request Headers →
confirm `Authorization: Bearer devpulse-demo-token-123` is present.
Expected: header present on the request.

- [ ] **Step 3: Verify the mapper (success path)**

In the console, confirm `[Day4 probe] mapped tasks:` logs an array of 12 objects, each with
`status`, `priority`, `assignee`, `createdAt` populated.
Expected: 12 mapped Task objects.

- [ ] **Step 4: Verify the response interceptor (error toast)**

Confirm a red error toast appears (from the `/nonexistent-xyz-404` call). JSONPlaceholder returns
404 for unknown paths → toast message "Request failed (404)."
Expected: visible error toast.
**If no error fires** (endpoint unexpectedly returns 200): change the error probe to
`apiClient.get("https://jsonplaceholder.typicode.com/todos/999999")` or a guaranteed-bad host, so
the interceptor genuinely triggers; re-verify.

---

### Task 8: Remove the temporary probe

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Remove the probe, restore Dashboard to its clean form**

```tsx
import { CheckCircle2, ListTodo, Loader2, Users } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your team's activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value="128" delta="+12 this week" icon={ListTodo} />
        <StatCard label="In Progress" value="34" delta="+5 today" icon={Loader2} />
        <StatCard label="Completed" value="86" delta="+8 today" icon={CheckCircle2} />
        <StatCard label="Team Members" value="—" loading icon={Users} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Confirm no leftover probe references**

Run: Grep for `Day4 probe`, `getTasks`, and `apiClient` in `src/pages`.
Expected: no matches in `src/pages` (the probe is fully removed; `getTasks`/`apiClient` are now
only referenced from within `src/api/`).

- [ ] **Step 3: Final build + tests**

Run: `npm run build` → clean.
Run: `npm test` → all tests pass (Day 3 filter + Day 4 mapper).

- [ ] **Step 4: Confirm axios isolation**

Run: Grep for `from "axios"` (or `import axios`) across `src`.
Expected: only `src/api/apiClient.ts` imports axios — the network layer stays isolated.

---

## Self-Review

**Spec coverage:**
- Isolated `src/api/` with central `apiClient.ts` → Task 4. baseURL → JSONPlaceholder → Task 4.
  Request interceptor (Bearer) → Task 4 + verified Task 7. Response interceptor (401/5xx/network
  toasts) → Task 4 + verified Task 7. sonner toast infra → Tasks 1–2. Raw `Todo` type → Task 3.
  Mapper + `getTasks` → Task 5. Temporary probe → Task 6, removed Task 8. axios isolation → Task 8.
  Success-criteria verification → Tasks 7–8. All spec sections covered.

**Placeholder scan:** No TBD/TODO (the `// TEMP Day 4 probe` comment is an intentional, scoped
marker that Task 8 removes — not a plan placeholder). Every code step shows the full file.

**Type consistency:** `Todo` defined in Task 3 (`src/api/types.ts`), imported by `tasks.ts` (Task 5)
and its test (Task 5). `mapTodoToTask(todo: Todo): Task` signature matches between definition,
test, and the spec. `getTasks(): Promise<Task[]>` returns the Day 3 `Task` type. `apiClient` named
export (Task 4) imported consistently (Tasks 5, 6). Mapper test expectations (id 3 → in_progress/
low, userId 2 → Omar) match the implementation formulas exactly.

**Testing note:** Task 5's mapper test is flagged and skippable per the project rule.

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
