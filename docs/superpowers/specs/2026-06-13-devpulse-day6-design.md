# DevPulse Dashboard — Day 6 Design: Task Creation Form (RHF + Zod)

**Date:** 2026-06-13
**Status:** Approved

## Goal

A robust, type-safe task-creation flow: a shadcn Dialog containing a React Hook Form wired to a
strict Zod schema, with instant inline validation messages. Submission is validated and logged
this day (no API call); Day 7 swaps the submit handler for a React Query mutation.

## Decisions

- **Container:** shadcn `Dialog` (centered modal), triggered by a "New Task" button in the Tasks
  page header.
- **Submit behavior (Day 6):** on valid submit → `console.log` the validated payload, success
  toast, reset form, close dialog. Invalid submit → inline errors, dialog stays open. No persistence.
- **Date field:** native `<input type="date">` (no date-picker dependency).

## Dependencies & Components

- Install: `react-hook-form`, `@hookform/resolvers`. (`zod` already present.)
- Add shadcn components: `dialog`, `form`, `label`. (`button`, `input`, `select` already exist.)
  The shadcn `form` primitives (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`,
  `FormMessage`) wrap RHF and render inline validation messages. (No `textarea` — the Day 6 form
  has no description field; YAGNI.)

## Zod Schema (`src/lib/task-schema.ts`)

The centerpiece. Reuses the existing `TaskStatus`/`TaskPriority` unions as enum sources.

```ts
import { z } from "zod"

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80, "Title must be 80 characters or fewer"),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z.string().min(2, "Assignee must be at least 2 characters").max(40, "Assignee must be 40 characters or fewer"),
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

- This pure schema is a unit-test candidate (valid input passes; short title, bad enum, past date
  each fail). **Flagged in the plan per the testing rule** — the user may veto.

## Form Component (`src/components/tasks/CreateTaskDialog.tsx`)

A self-contained component exporting `CreateTaskDialog`.

- Internal `open` state controls the Dialog.
- `const form = useForm<TaskFormValues>({ resolver: zodResolver(taskFormSchema), defaultValues })`
  with `defaultValues`: `{ title: "", status: "todo", priority: "medium", assignee: "", dueDate: "" }`.
- Fields rendered via shadcn `FormField` (each with `FormLabel`, `FormControl`, `FormMessage`):
  - **title** → `Input`
  - **status** → `Select` (To Do / In Progress / Done)
  - **priority** → `Select` (Low / Medium / High)
  - **assignee** → `Input`
  - **dueDate** → `<Input type="date">`
- **onSubmit(data: TaskFormValues):**
  - `console.log("[create task]", data)`
  - `toast.success("Task created")`
  - `form.reset()`
  - close the dialog (`setOpen(false)`)
  - This handler is the seam Day 7 replaces with `useMutation`.
- The dialog footer has a Cancel button (closes, resets) and a Submit button ("Create task").

## Wiring (`src/pages/Tasks.tsx`)

- Render `<CreateTaskDialog />` in the Tasks page header row, alongside the existing title/subtitle
  (e.g. right-aligned in the heading block). It is independent of the filter controls and the
  fetched list; adding it must not change existing filter/query behavior.

## Out of Scope (YAGNI)

- Real POST / persistence / cache update / optimistic UI (Day 7).
- Edit and delete flows.
- A calendar-popover date picker (native date input only).
- A description field / `textarea` (not needed by this form).

## Success Criteria

- `npm run build` compiles; `npm test` passes (existing + the new schema test if kept).
- Clicking "New Task" opens the Dialog with the five fields.
- Submitting empty/invalid shows inline messages — title < 3 chars, missing/invalid enum, assignee
  < 2 chars, empty or past `dueDate` — and the dialog stays open.
- A fully valid submit logs the typed payload to the console, shows a "Task created" success toast,
  resets the form, and closes the dialog.
- Existing Tasks filtering/sorting and the React Query fetch are unaffected.
