# DevPulse Dashboard — Day 8 Design: shadcn Table + Status/Priority Badges

**Date:** 2026-06-13
**Status:** Approved

## Goal

Replace the plain task list with an enterprise-style shadcn `Table`, and add colored badges whose
colors are derived from the Zod-validated `TaskStatus`/`TaskPriority` enums via type-safe lookups.
Uses the `--success`/`--warning`/`--danger` tokens added on Day 2.

## shadcn Components to Add

- `table`
- `badge`

## Badge Mapping (`src/components/tasks/task-badges.tsx`)

The "map styling rules to validated types" piece. Two small components backed by exhaustive,
type-safe `Record` lookups (a missing enum key is a compile error).

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

Color mapping:
- **Status:** To Do → neutral (secondary), In Progress → warning (amber), Done → success (green).
- **Priority:** Low → neutral, Medium → warning (amber), High → danger (red).

These tokens already adapt to light/dark from Day 2, so badges stay legible in both themes.

## Date Formatting (`src/lib/format.ts`)

A tiny helper (pure, reusable):

```ts
export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}
```

Renders `2026-06-13` → "Jun 13, 2026". Falls back to the raw string if unparseable.

## Table Component (`src/components/tasks/TaskTable.tsx`)

- Props: `{ tasks: Task[] }`.
- shadcn `Table` with `TableHeader` row: **Title · Status · Priority · Assignee · Due date**.
- One `TableRow` per task:
  - Title — `font-medium`
  - Status — `<StatusBadge status={task.status} />`
  - Priority — `<PriorityBadge priority={task.priority} />`
  - Assignee — plain text
  - Due date — `formatDate(task.createdAt)`

## Tasks Page Change (`src/pages/Tasks.tsx`)

- Replace the loaded-state `<ul>`/`<li>` block with `<TaskTable tasks={visibleTasks} />`.
- Everything else stays exactly as-is: `useFetchTasks` query, filter controls + reducer, `useMemo`
  filtering, `isLoading` skeleton, `isError` message, empty state ("No tasks match your filters."),
  the result count line, and the `CreateTaskDialog` trigger.
- The loading skeleton may optionally be reshaped to resemble table rows; not required — the
  existing skeleton list is acceptable.

## Out of Scope (YAGNI)

- Header-click column sorting (the sort `Select` already covers sorting).
- Row selection, row actions (edit/delete), pagination.
- Virtualization.

## Success Criteria

- `npm run build` compiles; `npm test` passes (no new tests required; mapping is type-checked).
- The Tasks page renders tasks in a shadcn `Table` with the five columns.
- Status badges render: **Done = green**, **In Progress = amber**, **To Do = neutral**.
- Priority badges render: **High = red**, **Medium = amber**, **Low = neutral**.
- Badges remain legible in both light and dark mode.
- Filtering, sorting, search, the loading skeleton, the empty state, the result count, and task
  creation all still work — the only change is the loaded list now renders as a table.
