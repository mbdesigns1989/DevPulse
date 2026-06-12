import type { Task, TaskPriority, TaskStatus } from "@/types/task"

export type Filters = {
  search: string
  status: TaskStatus | "all"
  priority: TaskPriority | "all"
  sort: "newest" | "oldest" | "priority"
}

const priorityRank: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 }

export function filterAndSortTasks(tasks: Task[], filters: Filters): Task[] {
  const q = filters.search.trim().toLowerCase()

  const filtered = tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false
    if (filters.status !== "all" && t.status !== filters.status) return false
    if (filters.priority !== "all" && t.priority !== filters.priority) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return b.createdAt.localeCompare(a.createdAt)
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt)
      case "priority":
        return priorityRank[b.priority] - priorityRank[a.priority]
    }
  })

  return sorted
}
