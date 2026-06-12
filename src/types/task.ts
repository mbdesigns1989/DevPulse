export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export type Task = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  createdAt: string // ISO date
}
