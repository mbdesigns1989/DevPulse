import { useMemo } from "react"
import { Activity } from "lucide-react"
import type { Task, TaskStatus } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelative } from "@/lib/format"

const dotByStatus: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground",
  in_progress: "bg-warning",
  done: "bg-success",
}

export function RecentActivity({ tasks, loading }: { tasks: Task[]; loading?: boolean }) {
  const recent = useMemo(
    () => [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [tasks]
  )
  const now = new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <Activity className="h-6 w-6" />
            No recent activity
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((task) => (
              <li key={task.id} className="flex items-center gap-3 text-sm">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotByStatus[task.status]}`} />
                <span className="truncate font-medium">{task.title}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  created · {formatRelative(task.createdAt, now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
