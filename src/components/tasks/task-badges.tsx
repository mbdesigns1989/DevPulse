import type { TaskPriority, TaskStatus } from "@/types/task"
import { Badge } from "@/components/ui/badge"

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In Progress", className: "bg-warning text-warning-foreground" },
  done: { label: "Done", className: "bg-success text-success-foreground" },
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-secondary text-secondary-foreground" },
  medium: { label: "Medium", className: "bg-warning text-warning-foreground" },
  high: { label: "High", className: "bg-danger text-danger-foreground" },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const c = statusConfig[status]
  return <Badge className={c.className}>{c.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = priorityConfig[priority]
  return <Badge className={c.className}>{c.label}</Badge>
}
