# DevPulse Day 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the create-task form into a real `useMutation` flow with an optimistic cache update (task appears instantly) and rollback on failure, against the shared `["tasks"]` query.

**Architecture:** `createTask()` POSTs through the Axios client. `useCreateTask()` wraps `useMutation` with `onMutate` (snapshot + optimistic prepend), `onError` (rollback), `onSuccess` (toast), and a commented `invalidateQueries` in `onSettled` (JSONPlaceholder doesn't persist). The dialog calls `mutate` and closes immediately.

**Tech Stack:** @tanstack/react-query (useMutation), axios, sonner.

**Note on commits:** Per user instruction, this plan does NOT commit. Each task ends with a **Verify** checkpoint.

**Note on testing:** No unit tests — the optimistic/rollback logic is verified in the browser
(happy path + DevTools-offline failure path). Existing Day 3/4/6 tests must keep passing.

**Note on verification:** Run from `d:/0xxxxxx`.

---

### Task 1: Add createTask to the API layer

**Files:**
- Modify: `src/api/tasks.ts`

- [ ] **Step 1: Add the import and `createTask` function**

At the top of `src/api/tasks.ts`, add the form-values import:

```ts
import type { TaskFormValues } from "@/lib/task-schema"
```

Then append `createTask` to the file (after `getTasks`):

```ts
export async function createTask(input: TaskFormValues): Promise<Task> {
  // POST runs through the Axios client (Bearer header + error interceptor).
  // JSONPlaceholder returns a fake { id: 201 } and does NOT persist the write.
  const res = await apiClient.post<Todo>("/todos", {
    title: input.title,
    completed: input.status === "done",
  })
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

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 2: Add useCreateTask mutation hook

**Files:**
- Modify: `src/hooks/use-tasks.ts`

- [ ] **Step 1: Replace the file with the query + new mutation hook**

The file currently exports only `useFetchTasks`. Replace it with:

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createTask, getTasks } from "@/api/tasks"
import type { Task } from "@/types/task"
import type { TaskFormValues } from "@/lib/task-schema"

export function useFetchTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 60_000, // 1 min: data stays "fresh" — no refetch on remount/navigation within this window
    gcTime: 300_000, // 5 min: unused cache is kept this long before garbage collection
  })
}

export function useCreateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onMutate: async (input: TaskFormValues) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic value.
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
      // Roll back to the pre-mutation snapshot. The Axios response interceptor
      // already shows the network error toast.
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

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 3: Wire the dialog to the mutation

**Files:**
- Modify: `src/components/tasks/CreateTaskDialog.tsx`

- [ ] **Step 1: Swap the toast import for the mutation hook**

Replace this import line:

```tsx
import { toast } from "sonner"
```

with:

```tsx
import { useCreateTask } from "@/hooks/use-tasks"
```

- [ ] **Step 2: Use the mutation and replace onSubmit**

Replace this block:

```tsx
export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  // Day 6: validate + log + toast + close. Day 7 replaces this body with a useMutation call.
  function onSubmit(data: TaskFormValues) {
    console.log("[create task]", data)
    toast.success("Task created")
    form.reset()
    setOpen(false)
  }
```

with:

```tsx
export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const createTask = useCreateTask()
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  // Optimistically create the task (appears instantly via the cache), then close.
  // Success/error toasts are handled inside useCreateTask.
  function onSubmit(data: TaskFormValues) {
    createTask.mutate(data)
    form.reset()
    setOpen(false)
  }
```

- [ ] **Step 3: Disable the submit button while pending**

Replace the submit button:

```tsx
              <Button type="submit">Create task</Button>
```

with:

```tsx
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? "Creating…" : "Create task"}
              </Button>
```

- [ ] **Step 4: Verify build + tests**

Run: `npm run build` → clean.
Run: `npm test` → all existing tests still pass (Day 3/4/6).

---

### Task 4: Browser verification against success criteria

- [ ] **Step 1: Run dev server**

Run: `npm run dev` (background). Open `/tasks`. Note the current count ("Showing 12 of 12 tasks").

- [ ] **Step 2: Happy path — optimistic insert**

Click "New Task", fill a valid task (title ≥3, assignee ≥2, future due date), submit.
Expected:
- The dialog closes immediately.
- The new task appears **instantly** at the top of the list; count becomes "13 of 13".
- A "Task created" success toast shows.
- The Network tab shows a `POST /todos` (201) carrying the `Authorization: Bearer` header.

- [ ] **Step 3: Dashboard reflects the new task**

Navigate to `/dashboard` (within the staleTime window). The "Total Tasks" card shows 13 (both
pages read the same `["tasks"]` cache). Navigate back to `/tasks` — the new task is still there.

- [ ] **Step 4: Rollback path — offline**

In Chrome DevTools, set the network to **Offline**. Click "New Task", fill a valid task, submit.
Expected:
- The task appears optimistically for a moment, then **reverts** (disappears) when the POST fails.
- The interceptor's error toast shows ("Network error. Check your connection.").
- The list returns to its prior count.
Then set the network back to **Online**.

- [ ] **Step 5: Confirm invalidateQueries is present (commented)**

Open `src/hooks/use-tasks.ts` and confirm the commented `invalidateQueries` line + explanation
exist in `onSettled`.

---

## Self-Review

**Spec coverage:**
- `createTask` POST via Axios → Task 1. `useMutation` hook with onMutate/onError/onSuccess/onSettled
  → Task 2. Optimistic prepend + snapshot → Task 2 (`onMutate`). Rollback → Task 2 (`onError`) +
  verified Task 4 Step 4. `invalidateQueries` present + commented + explained → Task 2 (`onSettled`).
  Form wired to `mutate`, immediate close, pending-disable → Task 3. Shared-cache dashboard bump →
  Task 4 Step 3. Browser verification of happy + rollback paths → Task 4. All spec sections covered.

**Placeholder scan:** No TBD/TODO. Every code step shows full functions or exact find/replace. The
commented `invalidateQueries` is an intentional, explained artifact (per the spec), not a plan gap.

**Type consistency:** `createTask(input: TaskFormValues): Promise<Task>` (Task 1) — `TaskFormValues`
from Day 6's `task-schema`, `Task` from Day 3, `Todo` from Day 4. `useCreateTask` uses `createTask`
as `mutationFn` and operates on `Task[]` in the `["tasks"]` cache (same key as `useFetchTasks`,
Task 2). The optimistic object satisfies `Task` (id/title/status/priority/assignee/createdAt). The
dialog calls `createTask.mutate(data)` where `data: TaskFormValues` matches the mutationFn input
(Task 3). `createTask.isPending` is the standard mutation flag.

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
