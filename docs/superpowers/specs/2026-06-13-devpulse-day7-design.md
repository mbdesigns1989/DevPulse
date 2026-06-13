# DevPulse Dashboard — Day 7 Design: React Query Mutations (Create + Optimistic Update)

**Date:** 2026-06-13
**Status:** Approved

## Goal

Turn the Day 6 form into a real create flow with `useMutation`: an optimistic cache update so the
new task appears instantly, with smooth rollback on failure. Demonstrate `invalidateQueries`
knowledge (present + explained) without breaking the demo on a non-persisting mock API.

## Key Constraint (drives the whole design)

JSONPlaceholder accepts `POST /todos` (returns `201` with a fake `id: 201`) but **does not
persist**. Therefore:

- We do **not** call `invalidateQueries` on success — a refetch of `/todos` returns the original 12
  todos and would erase the newly created task.
- Instead the new task is written **optimistically into the React Query cache** and stays there
  (in-memory) for the session. A full page reload resets to the original 12 — an honest limitation
  of the mock API, not a bug.
- `invalidateQueries` is included in `onSettled` but **commented out with an explanatory note**, to
  show the pattern and the judgment of when not to use it.

## API Layer (`src/api/tasks.ts`)

Add:

```ts
import type { TaskFormValues } from "@/lib/task-schema"

export async function createTask(input: TaskFormValues): Promise<Task> {
  // POST runs through the Axios client (Bearer header + error interceptor).
  // JSONPlaceholder returns a fake { id: 201 } and does NOT persist.
  const res = await apiClient.post<Todo>("/todos", {
    title: input.title,
    completed: input.status === "done",
  })
  // Build the Task from the form input (richer than the fake echo), using the
  // returned id when present.
  return {
    id: String(res.data?.id ?? Date.now()),
    title: input.title,
    status: input.status,
    priority: input.priority,
    assignee: input.assignee,
    createdAt: input.dueDate,
  }
}
```

## Mutation Hook (`src/hooks/use-tasks.ts`)

Add `useCreateTask` with the full optimistic lifecycle on the shared `["tasks"]` cache:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createTask } from "@/api/tasks"
import type { Task } from "@/types/task"
import type { TaskFormValues } from "@/lib/task-schema"

export function useCreateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onMutate: async (input: TaskFormValues) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const previous = qc.getQueryData<Task[]>(["tasks"])
      const optimistic: Task = {
        id: `temp-${Date.now()}`,
        title: input.title,
        status: input.status,
        priority: input.priority,
        assignee: input.assignee,
        createdAt: input.dueDate,
      }
      qc.setQueryData<Task[]>(["tasks"], (old = []) => [optimistic, ...old])
      return { previous }
    },
    onError: (_err, _input, ctx) => {
      // Roll back to the snapshot taken in onMutate. The Axios response
      // interceptor already shows the network error toast.
      if (ctx?.previous) qc.setQueryData(["tasks"], ctx.previous)
    },
    onSuccess: () => {
      toast.success("Task created")
    },
    onSettled: () => {
      // On a real, persisting API you would re-validate here:
      //   qc.invalidateQueries({ queryKey: ["tasks"] })
      // Disabled for JSONPlaceholder, which does not persist writes — a refetch
      // would drop the optimistic task. Left in place to show the pattern.
    },
  })
}
```

## Form Wiring (`src/components/tasks/CreateTaskDialog.tsx`)

- Import and call `useCreateTask()`.
- Replace the Day 6 `onSubmit` body with:
  - `mutation.mutate(data)`
  - `form.reset()`
  - `setOpen(false)` (close immediately — the optimistic update means the task is already visible)
- The success/error toast now lives in the hook (so messaging reflects the real outcome); remove
  the inline `toast.success` and `console.log` from the component.
- Disable the "Create task" button while `mutation.isPending` to prevent double-submit.

## Data Flow

`CreateTaskDialog` submit → `useCreateTask().mutate(values)` → `onMutate` optimistically prepends to
`["tasks"]` cache → Tasks list and Dashboard (both read that cache) update instantly → `POST /todos`
fires → on success: success toast; on error: rollback to snapshot + interceptor error toast.

## Out of Scope (YAGNI)

- Edit and delete mutations.
- Real persistence (localStorage or a persisting backend).
- Pagination / infinite query.

## Success Criteria

- `npm run build` compiles; `npm test` passes (no new tests required this day — mutation/optimistic
  logic is verified in the browser).
- Submitting a valid task makes it appear **instantly** at the top of the Tasks list (count
  12 → 13) and bumps the Dashboard counts (both read the shared cache), with a "Task created" toast.
- A `POST /todos` request is sent (visible in the Network tab, carrying the Bearer header).
- **Rollback:** with DevTools set to offline, submitting makes the task appear then revert when the
  POST fails, and the interceptor's error toast shows.
- The submit button is disabled while the mutation is pending.
- `invalidateQueries` appears in the hook (commented, with explanation) — demonstrating the pattern.
