import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Accent = "primary" | "success" | "warning" | "danger"

type StatCardProps = {
  label: string
  value: string
  delta?: string
  icon?: LucideIcon
  loading?: boolean
  accent?: Accent
}

const chipClasses: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
}

const dotClasses: Record<Accent, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  loading,
  accent = "primary",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${dotClasses[accent]}`} />
          {label}
        </CardTitle>
        {Icon ? (
          <span className={`flex h-8 w-8 items-center justify-center rounded-md ${chipClasses[accent]}`}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {delta ? (
              <p className="text-xs text-muted-foreground">{delta}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
