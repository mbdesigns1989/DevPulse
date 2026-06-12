import { useCallback, useMemo, useReducer } from "react"
import { mockTasks } from "@/data/mock-tasks"
import { filterAndSortTasks, type Filters } from "@/lib/filter-tasks"
import type { TaskPriority, TaskStatus } from "@/types/task"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Action =
  | { type: "SET_SEARCH"; value: string }
  | { type: "SET_STATUS"; value: TaskStatus | "all" }
  | { type: "SET_PRIORITY"; value: TaskPriority | "all" }
  | { type: "SET_SORT"; value: Filters["sort"] }
  | { type: "RESET" }

const initialFilters: Filters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "newest",
}

function filtersReducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.value }
    case "SET_STATUS":
      return { ...state, status: action.value }
    case "SET_PRIORITY":
      return { ...state, priority: action.value }
    case "SET_SORT":
      return { ...state, sort: action.value }
    case "RESET":
      return initialFilters
  }
}

const statusLabel: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

export default function Tasks() {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters)

  // Heavy computation: filter + sort the full list. Memoized so it only
  // recomputes when the filters change, not on every unrelated re-render.
  const visibleTasks = useMemo(
    () => filterAndSortTasks(mockTasks, filters),
    [filters]
  )

  // Stable handler references across renders (useCallback).
  const onSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: "SET_SEARCH", value: e.target.value }),
    []
  )
  const onStatus = useCallback(
    (value: string) =>
      dispatch({ type: "SET_STATUS", value: value as TaskStatus | "all" }),
    []
  )
  const onPriority = useCallback(
    (value: string) =>
      dispatch({ type: "SET_PRIORITY", value: value as TaskPriority | "all" }),
    []
  )
  const onSort = useCallback(
    (value: string) =>
      dispatch({ type: "SET_SORT", value: value as Filters["sort"] }),
    []
  )
  const onReset = useCallback(() => dispatch({ type: "RESET" }), [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Filter and sort your team's tasks.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by title..."
          value={filters.search}
          onChange={onSearch}
          className="max-w-xs"
        />
        <Select value={filters.status} onValueChange={onStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={onPriority}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.sort} onValueChange={onSort}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onReset}>Reset</Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {visibleTasks.length} of {mockTasks.length} tasks
      </p>

      {visibleTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No tasks match your filters.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {visibleTasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="font-medium">{task.title}</span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{statusLabel[task.status]}</span>
                <span className="capitalize">{task.priority}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
