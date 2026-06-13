import { useMemo } from "react"
import { AlertTriangle, CheckCircle2, ListTodo, Loader2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { useFetchTasks } from "@/hooks/use-tasks"

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useFetchTasks()

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "done").length,
      highPriority: tasks.filter((t) => t.priority === "high").length,
    }),
    [tasks]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your team's activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value={String(stats.total)} delta="All tasks" icon={ListTodo} loading={isLoading} />
        <StatCard label="In Progress" value={String(stats.inProgress)} delta="Currently active" icon={Loader2} loading={isLoading} />
        <StatCard label="Completed" value={String(stats.completed)} delta="Finished" icon={CheckCircle2} loading={isLoading} />
        <StatCard label="High Priority" value={String(stats.highPriority)} delta="Needs attention" icon={AlertTriangle} loading={isLoading} />
      </div>
    </div>
  )
}
