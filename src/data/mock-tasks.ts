import type { Task } from "@/types/task"

export const mockTasks: Task[] = [
  { id: "1", title: "Fix login redirect loop", status: "in_progress", priority: "high", assignee: "Nour", createdAt: "2026-06-01" },
  { id: "2", title: "Add dark mode toggle", status: "done", priority: "medium", assignee: "Sara", createdAt: "2026-05-28" },
  { id: "3", title: "Write API docs", status: "todo", priority: "low", assignee: "Omar", createdAt: "2026-06-05" },
  { id: "4", title: "Optimize image loading", status: "todo", priority: "medium", assignee: "Nour", createdAt: "2026-06-03" },
  { id: "5", title: "Refactor auth middleware", status: "in_progress", priority: "high", assignee: "Sara", createdAt: "2026-06-02" },
  { id: "6", title: "Set up CI pipeline", status: "done", priority: "high", assignee: "Omar", createdAt: "2026-05-25" },
  { id: "7", title: "Design settings page", status: "todo", priority: "low", assignee: "Lina", createdAt: "2026-06-06" },
  { id: "8", title: "Migrate to Tailwind v4", status: "done", priority: "medium", assignee: "Nour", createdAt: "2026-05-30" },
  { id: "9", title: "Add task filtering", status: "in_progress", priority: "medium", assignee: "Lina", createdAt: "2026-06-07" },
  { id: "10", title: "Fix mobile sidebar overlap", status: "todo", priority: "high", assignee: "Sara", createdAt: "2026-06-04" },
  { id: "11", title: "Update dependencies", status: "todo", priority: "low", assignee: "Omar", createdAt: "2026-06-08" },
  { id: "12", title: "Write unit tests for store", status: "in_progress", priority: "medium", assignee: "Nour", createdAt: "2026-06-09" },
]
