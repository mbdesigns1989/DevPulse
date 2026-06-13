import { useQuery } from "@tanstack/react-query"
import { getTasks } from "@/api/tasks"

export function useFetchTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 60_000, // 1 min: data stays "fresh" — no refetch on remount/navigation within this window
    gcTime: 300_000, // 5 min: unused cache is kept this long before garbage collection
  })
}
