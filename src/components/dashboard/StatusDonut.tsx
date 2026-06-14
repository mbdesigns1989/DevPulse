import { useMemo } from "react"
import { Pie, PieChart } from "recharts"
import type { Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  todo: { label: "To Do", color: "var(--muted-foreground)" },
  in_progress: { label: "In Progress", color: "var(--warning)" },
  done: { label: "Done", color: "var(--success)" },
} satisfies ChartConfig

export function StatusDonut({ tasks, loading }: { tasks: Task[]; loading?: boolean }) {
  const data = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, done: 0 }
    for (const t of tasks) counts[t.status]++
    return [
      { key: "todo", label: "To Do", value: counts.todo, fill: "var(--muted-foreground)" },
      { key: "in_progress", label: "In Progress", value: counts.in_progress, fill: "var(--warning)" },
      { key: "done", label: "Done", value: counts.done, fill: "var(--success)" },
    ]
  }, [tasks])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Task Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        ) : tasks.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
        ) : (
          <div className="flex items-center gap-6">
            <ChartContainer config={chartConfig} className="aspect-square h-40">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={45} strokeWidth={2} />
              </PieChart>
            </ChartContainer>
            <ul className="space-y-2 text-sm">
              {data.map((d) => (
                <li key={d.key} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="ml-auto font-medium">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
