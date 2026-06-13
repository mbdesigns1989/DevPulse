import { describe, expect, it } from "vitest"
import { taskFormSchema } from "@/lib/task-schema"

// Build a YYYY-MM-DD string from LOCAL date parts — this is what a native
// <input type="date"> produces. Using toISOString() here would be UTC and can
// be off by a day near midnight, which is a test bug, not a schema bug.
function isoOffset(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
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
