import { CheckCircle2, ListTodo, Loader2, Users } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your team's activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value="128" delta="+12 this week" icon={ListTodo} />
        <StatCard label="In Progress" value="34" delta="+5 today" icon={Loader2} />
        <StatCard label="Completed" value="86" delta="+8 today" icon={CheckCircle2} />
        <StatCard label="Team Members" value="—" loading icon={Users} />
      </div>
    </div>
  )
}
