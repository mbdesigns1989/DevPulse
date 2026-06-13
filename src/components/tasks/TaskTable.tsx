import type { Task } from "@/types/task"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges"
import { formatDate } from "@/lib/format"

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell><StatusBadge status={task.status} /></TableCell>
              <TableCell><PriorityBadge priority={task.priority} /></TableCell>
              <TableCell>{task.assignee}</TableCell>
              <TableCell>{formatDate(task.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
