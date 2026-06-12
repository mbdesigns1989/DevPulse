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
