# DevPulse Day 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the live tasks in a shadcn Table with colored Status/Priority badges whose colors map from the Zod-validated enums via type-safe lookups.

**Architecture:** A `task-badges.tsx` module maps `TaskStatus`/`TaskPriority` → color classes (Day 2 success/warning/danger tokens) via exhaustive `Record` lookups. `TaskTable.tsx` renders a shadcn `Table` of those rows. The Tasks page swaps its `<ul>` loaded-state for `<TaskTable>`; everything else (query, filters, skeleton, empty/error states) is untouched.

**Tech Stack:** shadcn `table` + `badge`, React, TypeScript.

**Note on commits:** Per user instruction, this plan does NOT commit. Each task ends with a **Verify** checkpoint.

**Note on testing:** No unit tests — the mapping is exhaustively type-checked (`Record<TaskStatus,…>`/
`Record<TaskPriority,…>`), and the table/colors are verified via build + browser (light + dark).

**Note on verification:** Run from `d:/0xxxxxx`.

---

### Task 1: Add shadcn table + badge

**Files:**
- Create: `src/components/ui/table.tsx`, `src/components/ui/badge.tsx` (via CLI)

- [ ] **Step 1: Add the components**

Run: `npx shadcn@latest add table badge --yes`
Expected: creates `table.tsx` and `badge.tsx` in `src/components/ui/`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 2: Date format helper

**Files:**
- Create: `src/lib/format.ts`

- [ ] **Step 1: Create the helper**

```ts
export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 3: Status + Priority badge components

**Files:**
- Create: `src/components/tasks/task-badges.tsx`

- [ ] **Step 1: Create the badges**

```tsx
import type { TaskPriority, TaskStatus } from "@/types/task"
import { Badge } from "@/components/ui/badge"

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In Progress", className: "bg-warning text-warning-foreground" },
  done: { label: "Done", className: "bg-success text-success-foreground" },
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-secondary text-secondary-foreground" },
  medium: { label: "Medium", className: "bg-warning text-warning-foreground" },
  high: { label: "High", className: "bg-danger text-danger-foreground" },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const c = statusConfig[status]
  return <Badge className={c.className}>{c.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = priorityConfig[priority]
  return <Badge className={c.className}>{c.label}</Badge>
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 4: TaskTable component

**Files:**
- Create: `src/components/tasks/TaskTable.tsx`

- [ ] **Step 1: Create the table**

```tsx
import type { Task } from "@/types/task"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges"
import { formatDate } from "@/lib/format"

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell><StatusBadge status={task.status} /></TableCell>
              <TableCell><PriorityBadge priority={task.priority} /></TableCell>
              <TableCell>{task.assignee}</TableCell>
              <TableCell>{formatDate(task.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 5: Swap the Tasks list for the table

**Files:**
- Modify: `src/pages/Tasks.tsx`

- [ ] **Step 1: Import TaskTable**

Add near the other imports in `src/pages/Tasks.tsx`:

```tsx
import { TaskTable } from "@/components/tasks/TaskTable"
```

- [ ] **Step 2: Replace the loaded-state `<ul>` with the table**

Find this block:

```tsx
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
```

Replace it with:

```tsx
            <TaskTable tasks={visibleTasks} />
```

- [ ] **Step 3: Remove the now-unused `statusLabel`**

`statusLabel` was only used by the old `<ul>`. Delete its declaration from `src/pages/Tasks.tsx`:

```tsx
const statusLabel: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}
```

If `TaskStatus` is now unused in the file after this removal, also drop it from the
`import type { TaskPriority, TaskStatus } from "@/types/task"` line (keep `TaskPriority` —
it's still used by the reducer `Action` type). The build's `noUnusedLocals` will flag it if missed.

- [ ] **Step 4: Verify build + tests**

Run: `npm run build` → clean (watch for unused-import errors from Step 3).
Run: `npm test` → all existing tests still pass.

---

### Task 6: Browser verification against success criteria

- [ ] **Step 1: Run dev server**

Run: `npm run dev` (background). Open `/tasks`.

- [ ] **Step 2: Table renders with five columns**

Confirm the tasks render in a table with headers Title · Status · Priority · Assignee · Due date,
and dates show formatted (e.g. "Jun 13, 2026").

- [ ] **Step 3: Badge colors (light mode)**

Confirm Status badges: Done = green, In Progress = amber, To Do = neutral. Priority badges:
High = red, Medium = amber, Low = neutral.

- [ ] **Step 4: Badge colors (dark mode)**

Toggle dark mode via the topbar; confirm all badges remain legible (token-based colors adapt).

- [ ] **Step 5: Existing behavior intact**

Confirm filtering/search/sort still drive the table rows, the result count updates, the empty state
shows when filters exclude everything, and creating a task still adds a row.

---

## Self-Review

**Spec coverage:**
- shadcn table + badge → Task 1. Type-safe enum→color mapping (success/warning/danger tokens) →
  Task 3. Table with 5 columns rendering live tasks → Task 4. Date formatting → Task 2. Tasks page
  swap, other behavior untouched → Task 5. Light + dark badge verification + intact filters →
  Task 6. All spec sections covered.

**Placeholder scan:** No TBD/TODO. Every code step shows full files or exact find/replace.

**Type consistency:** `StatusBadge`/`PriorityBadge` take `TaskStatus`/`TaskPriority` (Task 3),
consumed by `TaskTable` (Task 4) which takes `Task[]` and is called with `visibleTasks: Task[]`
(Task 5). `formatDate(iso: string)` (Task 2) called with `task.createdAt` (string). `Record<TaskStatus,…>`
and `Record<TaskPriority,…>` are exhaustive — a missing/extra enum key fails the build. Removing
`statusLabel` + possibly the `TaskStatus` import (Task 5 Step 3) is covered with the `noUnusedLocals`
note.

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
