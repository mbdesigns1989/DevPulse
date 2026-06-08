# DevPulse Day 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Vite + React + TS app with Tailwind v4, shadcn/ui, and a nested-layout React Router setup that navigates between four placeholder pages.

**Architecture:** Single-page React app. One nested layout route renders a persistent shadcn sidebar plus `<Outlet/>`; `/dashboard`, `/tasks`, `/settings` render as children. `/` redirects to `/dashboard`.

**Tech Stack:** Vite, React 18+, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui, React Router.

**Note on commits:** Per user instruction, this plan does NOT commit. Each task ends with a **Verify** checkpoint instead of a commit.

**Note on working dir:** All commands run from `d:/0xxxxxx`. The Vite scaffold is created in-place (`.`), not in a subfolder.

---

### Task 1: Scaffold Vite + React + TS

**Files:**
- Create: project skeleton (`package.json`, `vite.config.ts`, `tsconfig*.json`, `src/`, `index.html`)

- [ ] **Step 1: Scaffold into current directory**

Run: `npm create vite@latest . -- --template react-ts`
If prompted that the directory is not empty (docs/ exists), choose "Ignore files and continue".

- [ ] **Step 2: Install base dependencies**

Run: `npm install`

- [ ] **Step 3: Verify dev server boots**

Run: `npm run dev` (then stop it).
Expected: Vite prints a `localhost` URL with no errors.

---

### Task 2: Install & configure Tailwind CSS v4

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css` (replace contents)
- Create: `tsconfig.json` / `tsconfig.app.json` path alias entries

- [ ] **Step 1: Install Tailwind v4 + Vite plugin**

Run: `npm install tailwindcss @tailwindcss/vite`

- [ ] **Step 2: Add the plugin and `@` alias to `vite.config.ts`**

```ts
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
```

- [ ] **Step 3: Replace `src/index.css` with the Tailwind v4 entry**

```css
@import "tailwindcss";
```

- [ ] **Step 4: Register the `@` path alias for TypeScript**

In `tsconfig.json`, add to `compilerOptions` (create the block if absent):

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

Mirror the same `baseUrl` + `paths` in `tsconfig.app.json` so the editor and build agree.

- [ ] **Step 5: Install node types (needed for `path` import)**

Run: `npm install -D @types/node`

- [ ] **Step 6: Verify Tailwind renders**

Temporarily set `src/App.tsx` body to `<h1 className="text-3xl font-bold text-red-600">tw ok</h1>`, run `npm run dev`, confirm large bold red text. Revert App.tsx after.
Expected: utility classes apply.

---

### Task 3: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `src/index.css` (CLI injects theme tokens)
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Run the shadcn init**

Run: `npx shadcn@latest init`
Accept defaults; when asked for base color choose `Neutral` (or preference). The CLI detects Tailwind v4 and writes theme tokens into `src/index.css`.

- [ ] **Step 2: Add the components needed for the sidebar**

Run: `npx shadcn@latest add sidebar button`
This pulls `sidebar`, `button`, and their dependencies (e.g. `sheet`, `separator`, `tooltip`) into `src/components/ui/`.

- [ ] **Step 3: Verify a shadcn component renders**

Temporarily render `<Button>hi</Button>` (import from `@/components/ui/button`) in `src/App.tsx`, run `npm run dev`, confirm a styled button. Revert App.tsx after.
Expected: styled shadcn button, no import-resolution errors (confirms `@` alias works).

---

### Task 4: Create page stubs

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/Tasks.tsx`
- Create: `src/pages/Settings.tsx`

- [ ] **Step 1: Create the three stub pages**

`src/pages/Dashboard.tsx`:

```tsx
export default function Dashboard() {
  return <h1 className="text-2xl font-semibold">Dashboard</h1>
}
```

`src/pages/Tasks.tsx`:

```tsx
export default function Tasks() {
  return <h1 className="text-2xl font-semibold">Tasks</h1>
}
```

`src/pages/Settings.tsx`:

```tsx
export default function Settings() {
  return <h1 className="text-2xl font-semibold">Settings</h1>
}
```

---

### Task 5: Build the sidebar

**Files:**
- Create: `src/components/layout/AppSidebar.tsx`

- [ ] **Step 1: Create `AppSidebar.tsx`**

```tsx
import { LayoutDashboard, ListTodo, Settings as SettingsIcon } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 font-semibold">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">
            DP
          </div>
          DevPulse
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

Note: `lucide-react` is installed as a shadcn dependency in Task 3. If missing, run `npm install lucide-react`.

---

### Task 6: Build the layout

**Files:**
- Create: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Create `AppLayout.tsx`**

```tsx
import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6">
        <SidebarTrigger className="mb-4" />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
```

---

### Task 7: Wire the router

**Files:**
- Install: `react-router-dom`
- Create: `src/router/index.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install React Router**

Run: `npm install react-router-dom`

- [ ] **Step 2: Create `src/router/index.tsx`**

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import Dashboard from "@/pages/Dashboard"
import Tasks from "@/pages/Tasks"
import Settings from "@/pages/Settings"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "tasks", element: <Tasks /> },
      { path: "settings", element: <Settings /> },
    ],
  },
])
```

- [ ] **Step 3: Replace `src/main.tsx`**

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **Step 4: Delete leftover scaffold artifacts**

Remove `src/App.tsx`, `src/App.css` (no longer imported). Confirm nothing imports them.

---

### Task 8: Full verification against success criteria

- [ ] **Step 1: Type-check + build**

Run: `npm run build`
Expected: TypeScript compiles, Vite builds with no errors.

- [ ] **Step 2: Run dev server and verify behavior**

Run: `npm run dev`. In the browser confirm each success criterion:
- Visiting `/` redirects to `/dashboard`.
- Sidebar links navigate between Dashboard / Tasks / Settings with no full reload.
- The active link is highlighted.
- Sidebar persists across navigation (does not flash/remount).
- Narrowing the window collapses the sidebar / opens it as a drawer via the trigger.

Expected: all criteria pass.

---

## Self-Review

**Spec coverage:**
- Vite+React+TS → Task 1. Tailwind v4 → Task 2. shadcn init → Task 3. React Router + 4 routes (`/`→redirect, `/dashboard`, `/tasks`, `/settings`) → Task 7. Responsive sidebar in layout → Tasks 5–6. Page stubs → Task 4. Folder structure (`components/layout`, `components/ui`, `pages`, `router`, `lib`) → created across Tasks 3–7. All spec sections covered.

**Placeholder scan:** No TBD/TODO. Every code step shows full file contents. Verification steps give exact commands + expected output.

**Type consistency:** `AppLayout` (named export) imported as named in router; `AppSidebar` (named export) imported as named in AppLayout; page components are default exports imported as defaults. `router` named export matches `import { router }`. Consistent.

**Commit note:** Commits intentionally omitted per user instruction; replaced with Verify checkpoints.
