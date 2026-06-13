import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createTask, getTasks } from "@/api/tasks"
import type { Task } from "@/types/task"
import type { TaskFormValues } from "@/lib/task-schema"

export function useFetchTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 60_000, // 1 min: data stays "fresh" — no refetch on remount/navigation within this window
    gcTime: 300_000, // 5 min: unused cache is kept this long before garbage collection
  })
}

export function useCreateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    // Run the mutation even when offline. React Query's default networkMode
    // ("online") PAUSES mutations while offline — the request never fires and the
    // optimistic update hangs with no rollback. "always" lets it run, fail fast,
    // and trigger onError → rollback. (This is the real reason an offline create
    // appeared "stuck": RQ was pausing it by design, not hanging.)
    networkMode: "always",
    onMutate: async (input: TaskFormValues) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic value.
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const previous = qc.getQueryData<Task[]>(["tasks"])
      const optimistic: Task = {
        id: `temp-${Date.now()}`,
        title: input.title,
        status: input.status,
        priority: input.priority,
        assignee: input.assignee,
        createdAt: input.dueDate,
      }
      qc.setQueryData<Task[]>(["tasks"], (old = []) => [optimistic, ...old])
      return { previous }
    },
    onError: (_err, _input, ctx) => {
      // Roll back to the pre-mutation snapshot. The Axios response interceptor
      // already shows the network error toast.
      if (ctx?.previous) qc.setQueryData(["tasks"], ctx.previous)
    },
    onSuccess: () => {
      toast.success("Task created")
    },
    onSettled: () => {
      // On a real, persisting API you would re-validate here:
      //   qc.invalidateQueries({ queryKey: ["tasks"] })
      // Disabled for JSONPlaceholder, which does not persist writes — a refetch
      // would drop the optimistic task. Left in place to show the pattern.
    },
  })
}
