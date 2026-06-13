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
