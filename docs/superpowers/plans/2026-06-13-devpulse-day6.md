# DevPulse Day 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A type-safe task-creation flow — a shadcn Dialog with a React Hook Form wired to a strict Zod schema, showing inline validation; valid submit logs + toasts + closes (the Day 7 mutation seam).

**Architecture:** Pure Zod schema in `src/lib/task-schema.ts` (unit-tested). A self-contained `CreateTaskDialog` uses `useForm` + `zodResolver` + shadcn `form` primitives for inline errors. The Tasks page renders the dialog trigger.

**Tech Stack:** react-hook-form, @hookform/resolvers, zod, shadcn (dialog/form/label), sonner.

**Note on commits:** Per user instruction, this plan does NOT commit. Each task ends with a **Verify** checkpoint.

**Note on testing:** Per the project rule, **Task 2 adds ONE unit test for the pure Zod schema**
(flagged & skippable). The form component is verified via build + browser.

**Note on verification:** Run from `d:/0xxxxxx`.

---

### Task 1: Install deps + shadcn form components

**Files:**
- Create: `src/components/ui/dialog.tsx`, `src/components/ui/form.tsx`, `src/components/ui/label.tsx` (via CLI)
- Modify: `package.json`

- [ ] **Step 1: Install RHF + resolvers**

Run: `npm install react-hook-form @hookform/resolvers`
Expected: installs with no errors (zod already present).

- [ ] **Step 2: Add shadcn components**

Run: `npx shadcn@latest add dialog form label --yes`
Expected: creates `dialog.tsx`, `form.tsx`, `label.tsx` in `src/components/ui/`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 2: Zod schema (with unit test — see testing note)

**Files:**
- Create: `src/lib/task-schema.ts`
- Create: `src/lib/task-schema.test.ts` *(flagged test — skippable)*

- [ ] **Step 1: Write the failing test**

`src/lib/task-schema.test.ts`. Note the dates are computed relative to "now" so the test stays
valid over time (no hardcoded future date that eventually goes stale).

```ts
import { describe, expect, it } from "vitest"
import { taskFormSchema } from "@/lib/task-schema"

function isoOffset(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const valid = {
  title: "Write the API docs",
  status: "todo",
  priority: "medium",
  assignee: "Nour",
  dueDate: isoOffset(3),
}

describe("taskFormSchema", () => {
  it("accepts a fully valid task", () => {
    expect(taskFormSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects a title shorter than 3 chars", () => {
    expect(taskFormSchema.safeParse({ ...valid, title: "ab" }).success).toBe(false)
  })

  it("rejects an invalid status enum", () => {
    expect(taskFormSchema.safeParse({ ...valid, status: "archived" }).success).toBe(false)
  })

  it("rejects an assignee shorter than 2 chars", () => {
    expect(taskFormSchema.safeParse({ ...valid, assignee: "N" }).success).toBe(false)
  })

  it("rejects an empty due date", () => {
    expect(taskFormSchema.safeParse({ ...valid, dueDate: "" }).success).toBe(false)
  })

  it("rejects a past due date", () => {
    expect(taskFormSchema.safeParse({ ...valid, dueDate: isoOffset(-1) }).success).toBe(false)
  })

  it("accepts a due date of today", () => {
    expect(taskFormSchema.safeParse({ ...valid, dueDate: isoOffset(0) }).success).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `task-schema` module not found.

- [ ] **Step 3: Implement `task-schema.ts`**

```ts
import { z } from "zod"

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be 80 characters or fewer"),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z
    .string()
    .min(2, "Assignee must be at least 2 characters")
    .max(40, "Assignee must be 40 characters or fewer"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((v) => {
      const d = new Date(v + "T00:00:00")
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return !Number.isNaN(d.getTime()) && d >= today
    }, "Due date must be today or later"),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all schema cases green (plus existing Day 3/4 tests).

---

### Task 3: CreateTaskDialog component

**Files:**
- Create: `src/components/tasks/CreateTaskDialog.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { taskFormSchema, type TaskFormValues } from "@/lib/task-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const defaultValues: TaskFormValues = {
  title: "",
  status: "todo",
  priority: "medium",
  assignee: "",
  dueDate: "",
}

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Add a new task to your board.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fix login redirect" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nour" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 4: Mount the dialog on the Tasks page

**Files:**
- Modify: `src/pages/Tasks.tsx`

- [ ] **Step 1: Add the import and the trigger in the header row**

Add the import near the top of `src/pages/Tasks.tsx`:

```tsx
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
```

Then replace the existing header block:

```tsx
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Filter and sort your team's tasks.
        </p>
      </div>
```

with this (heading on the left, dialog trigger on the right):

```tsx
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Filter and sort your team's tasks.
          </p>
        </div>
        <CreateTaskDialog />
      </div>
```

Leave everything else in the file (filters, query, list, states) unchanged.

- [ ] **Step 2: Verify build + tests**

Run: `npm run build` → clean.
Run: `npm test` → all pass (existing + schema test).

---

### Task 5: Browser verification against success criteria

- [ ] **Step 1: Run dev server**

Run: `npm run dev` (background). Open `/tasks`.

- [ ] **Step 2: Open the dialog**

Click "New Task" → the Dialog opens with five fields (Title, Status, Priority, Assignee, Due date).

- [ ] **Step 3: Invalid submit shows inline errors, stays open**

With Title empty (and Due date empty), click "Create task".
Expected: inline messages appear ("Title must be at least 3 characters", "Due date is required");
the dialog stays open; no success toast.

- [ ] **Step 4: Past-date rule**

Enter a valid title/assignee, set Due date to yesterday, submit.
Expected: inline "Due date must be today or later"; dialog stays open.

- [ ] **Step 5: Valid submit logs + toasts + closes**

Fill Title (≥3 chars), Assignee (≥2 chars), pick status/priority, set Due date to today or later,
submit.
Expected: console logs `[create task]` with the typed payload; a "Task created" success toast
appears; the form resets and the dialog closes.

- [ ] **Step 6: Existing behavior intact**

Confirm the task list still fetches/renders and the filter controls still work (the dialog did not
disturb the query or filtering).

---

## Self-Review

**Spec coverage:**
- Dialog container + "New Task" trigger on Tasks page → Tasks 3–4. Strict Zod schema (char lengths,
  enums, today-or-later date) → Task 2. RHF + zodResolver wiring + inline `FormMessage` → Task 3.
  Validate + log + toast + close submit (Day 7 seam) → Task 3. Native date input → Task 3
  (`<Input type="date">`). No textarea → omitted. Browser verification of all success criteria →
  Task 5. Schema unit test (flagged) → Task 2. All spec sections covered.

**Placeholder scan:** No TBD/TODO. Every code step shows the full file/edit. Verify steps give
exact actions + expected results.

**Type consistency:** `taskFormSchema` + `TaskFormValues` defined in Task 2, imported by both the
test (Task 2) and the component (Task 3). The schema's enum literals (`todo/in_progress/done`,
`low/medium/high`) match the `SelectItem` values in Task 3 and the project's `TaskStatus`/
`TaskPriority` unions. `defaultValues` is typed `TaskFormValues` and covers every schema field.
`CreateTaskDialog` named export (Task 3) imported as named (Task 4). `onSubmit(data: TaskFormValues)`
matches `form.handleSubmit`. Test dates are relative (no stale hardcoded date).

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
