# DevPulse Dashboard — Day 4 Design: Network Layer (Axios Core & Interceptors)

**Date:** 2026-06-13
**Status:** Approved

## Goal

Construct a production-grade HTTP client layer: a central Axios instance with a request
interceptor (dummy Bearer auth) and a response interceptor (global error toasts), plus a typed
API surface that maps the mock server's shape to our `Task` type.

## Decisions

- **Mock API:** JSONPlaceholder (`https://jsonplaceholder.typicode.com`), `/todos` resource.
- **Toast:** shadcn **`sonner`** (the legacy shadcn `toast` component is deprecated; `sonner` is
  the current recommended replacement).
- **Schema bridge:** an anti-corruption mapper in the API layer converts JSONPlaceholder's
  `{ id, title, completed, userId }` into our Day 3 `Task` type. The rest of the app keeps using
  the clean `Task` type.
- **Day 4 demonstration:** a temporary dev probe (removed before Day 4 closes) proves both
  interceptors work; Day 5 replaces it with React Query.

## Components

### `src/components/ui/sonner.tsx` (shadcn)
Added via `npx shadcn@latest add sonner`. Exports `Toaster`.

### `AppLayout` change
Mount `<Toaster richColors />` once inside `AppLayout` (alongside the existing structure) so
toasts are available on every route.

### `src/api/types.ts`
```ts
export type Todo = {
  id: number
  title: string
  completed: boolean
  userId: number
}
```

### `src/api/apiClient.ts`
- Create the Axios instance:
  - `baseURL: "https://jsonplaceholder.typicode.com"`
  - `headers: { "Content-Type": "application/json" }`
  - `timeout: 10000`
- **Request interceptor:** attach `Authorization: Bearer <dummy>` to `config.headers` on every
  request. The dummy token is a hardcoded constant (no real auth this day).
- **Response interceptor:**
  - Success handler returns the response unchanged.
  - Error handler inspects `error.response?.status` and fires a `sonner` error toast:
    - `401` → "Session expired. Please sign in again."
    - `>= 500` → "Server error. Please try again later."
    - no `error.response` (network/timeout) → "Network error. Check your connection."
    - otherwise → "Request failed (<status>)."
  - After showing the toast, re-throw via `return Promise.reject(error)` so callers still handle
    the failure.

### `src/api/tasks.ts`
- `mapTodoToTask(todo: Todo): Task` — deterministic mapping:
  - `status`: `todo.completed ? "done" : (todo.id % 3 === 0 ? "in_progress" : "todo")`
  - `priority`: derived from `todo.id % 3` → `["low","medium","high"][todo.id % 3]`
  - `assignee`: `["Nour","Sara","Omar","Lina"][todo.userId % 4]`
  - `title`: `todo.title`
  - `id`: `String(todo.id)`
  - `createdAt`: a deterministic date derived from `id` (e.g. day-of-month from `id`), formatted
    `YYYY-MM-DD`, so sorting by date still varies.
- `getTasks(): Promise<Task[]>` — `apiClient.get<Todo[]>("/todos", { params: { _limit: 12 } })`,
  then `res.data.map(mapTodoToTask)`.

## Temporary Dev Probe (removed at end of Day 4)

In `src/pages/Dashboard.tsx`, two `useEffect`s, each clearly commented
`// TEMP Day 4 probe — remove on Day 5`:

1. **Success path:** calls `getTasks()` on mount, `console.log`s the mapped tasks. Used to confirm
   in the browser Network tab that the request carries the `Authorization: Bearer` header and
   returns 12 mapped tasks.
2. **Error path:** a one-shot `apiClient.get("/nonexistent-xyz-404")` on mount to trigger the
   response interceptor's error toast (JSONPlaceholder returns 404 for unknown paths).

Both probes are deleted before Day 4 is marked complete. Nothing else references them.

## What Stays vs. Goes

- **Stays:** `apiClient.ts`, `tasks.ts`, `types.ts`, the `<Toaster>` mount, the `sonner` + `axios`
  deps.
- **Goes (end of Day 4):** the two temporary probe `useEffect`s in Dashboard.

## Dependencies to Add

- `axios`
- `sonner` (via shadcn)

## Out of Scope (YAGNI)

- React Query / data caching (Day 5).
- Mutations / optimistic updates (Day 7).
- Real authentication, token storage, or refresh logic — the Bearer token is a hardcoded dummy.

## Success Criteria

- `npm run build` compiles with no errors.
- During the temporary probe: the browser Network tab shows the `GET /todos` request carrying an
  `Authorization: Bearer <dummy>` header (request interceptor verified), and the console logs 12
  mapped `Task` objects with `status`/`priority`/`assignee` populated (mapper verified).
- The deliberate 404 call triggers a visible error toast (response interceptor verified).
- After the probes are removed, `npm run build` still passes and the app renders normally with no
  leftover console logs or stray requests.
- `axios` is only imported within `src/api/` (the network layer stays isolated).
