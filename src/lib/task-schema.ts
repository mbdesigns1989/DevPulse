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
