import type { Task, TaskPriority } from "@/types/task"
import { apiClient } from "@/api/apiClient"
import type { Todo } from "@/api/types"

const priorities: TaskPriority[] = ["low", "medium", "high"]
const assignees = ["Nour", "Sara", "Omar", "Lina"]

export function mapTodoToTask(todo: Todo): Task {
  const status = todo.completed
    ? "done"
    : todo.id % 3 === 0
      ? "in_progress"
      : "todo"

  // Deterministic created date: spread ids across June 2026 (day 1-28).
  const day = String((todo.id % 28) + 1).padStart(2, "0")

  return {
    id: String(todo.id),
    title: todo.title,
    status,
    priority: priorities[todo.id % 3],
    assignee: assignees[todo.userId % 4],
    createdAt: `2026-06-${day}`,
  }
}

export async function getTasks(): Promise<Task[]> {
  const res = await apiClient.get<Todo[]>("/todos", { params: { _limit: 12 } })
  return res.data.map(mapTodoToTask)
}
