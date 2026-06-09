# DevPulse Day 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an indigo/violet brand theme + status color tokens, a Light/Dark/System theme toggle (persisted, no-flash), a sticky Topbar, and a Dashboard showcase of Card + Skeleton stat cards.

**Architecture:** All color lives as CSS theme tokens in `src/index.css` (`:root` + `.dark`), exposed through `@theme inline`, and consumed via Tailwind utilities — never hardcoded `slate`/`indigo` classes, so dark mode works. A React context `ThemeProvider` toggles the `dark` class on `<html>`; an inline script in `index.html` prevents the wrong-theme flash on load.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (card, dropdown-menu, button, skeleton), lucide-react.

**Note on commits:** Per user instruction, this plan does NOT commit — the user commits themselves. Each task ends with a **Verify** checkpoint.

**Note on verification:** Run from `d:/0xxxxxx`. UI behavior is verified via `npm run build` + a browser check (Chrome DevTools), not unit tests.

---

### Task 1: Add color tokens to index.css

**Files:**
- Modify: `src/index.css` — `@theme inline` block, `:root` block, `.dark` block

- [ ] **Step 1: Expose status colors in the `@theme inline` block**

In `src/index.css`, find the line `--color-primary: var(--primary);` (inside `@theme inline`)
and add these lines immediately after it:

```css
    --color-success: var(--success);
    --color-success-foreground: var(--success-foreground);
    --color-warning: var(--warning);
    --color-warning-foreground: var(--warning-foreground);
    --color-danger: var(--danger);
    --color-danger-foreground: var(--danger-foreground);
```

- [ ] **Step 2: Set the indigo brand accent + status tokens in `:root` (light)**

In the `:root` block, replace the existing primary + sidebar-primary lines.
Find:

```css
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
```

Replace with:

```css
    --primary: oklch(0.55 0.22 277);
    --primary-foreground: oklch(0.985 0 0);
```

Find:

```css
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
```

Replace with:

```css
    --sidebar-primary: oklch(0.55 0.22 277);
    --sidebar-primary-foreground: oklch(0.985 0 0);
```

Then, at the end of the `:root` block (just before its closing `}`), add the status tokens:

```css
    --success: oklch(0.72 0.17 152);
    --success-foreground: oklch(0.985 0 0);
    --warning: oklch(0.8 0.16 78);
    --warning-foreground: oklch(0.27 0.04 78);
    --danger: oklch(0.62 0.22 25);
    --danger-foreground: oklch(0.985 0 0);
```

- [ ] **Step 3: Set the indigo brand accent + status tokens in `.dark`**

In the `.dark` block, find:

```css
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
```

Replace with:

```css
    --primary: oklch(0.68 0.19 277);
    --primary-foreground: oklch(0.145 0 0);
```

Find:

```css
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
```

Replace with:

```css
    --sidebar-primary: oklch(0.68 0.19 277);
    --sidebar-primary-foreground: oklch(0.145 0 0);
```

Then, at the end of the `.dark` block (just before its closing `}`), add:

```css
    --success: oklch(0.7 0.15 152);
    --success-foreground: oklch(0.145 0 0);
    --warning: oklch(0.82 0.15 78);
    --warning-foreground: oklch(0.27 0.04 78);
    --danger: oklch(0.65 0.2 25);
    --danger-foreground: oklch(0.145 0 0);
```

- [ ] **Step 4: Verify build compiles**

Run: `npm run build`
Expected: builds with no errors. (Visual effect verified in later tasks.)

---

### Task 2: Add shadcn card and dropdown-menu components

**Files:**
- Create: `src/components/ui/card.tsx`, `src/components/ui/dropdown-menu.tsx` (via CLI)

- [ ] **Step 1: Add the components**

Run: `npx shadcn@latest add card dropdown-menu --yes`
Expected: creates `src/components/ui/card.tsx` and `src/components/ui/dropdown-menu.tsx`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 3: ThemeProvider

**Files:**
- Create: `src/components/theme/theme-provider.tsx`

- [ ] **Step 1: Create the provider**

```tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "devpulse-theme"

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => undefined,
})

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  root.classList.toggle("dark", isDark)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || "system"
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme("system")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeProviderContext)
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 4: Anti-flash script + ThemeProvider mount + title

**Files:**
- Modify: `index.html`
- Modify: `src/main.tsx`

- [ ] **Step 1: Add the anti-flash inline script and fix the title in `index.html`**

Replace:

```html
    <title>devpulse-tmp</title>
  </head>
```

with:

```html
    <title>DevPulse</title>
    <script>
      (function () {
        try {
          var t = localStorage.getItem("devpulse-theme") || "system";
          var dark =
            t === "dark" ||
            (t === "system" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches);
          if (dark) document.documentElement.classList.add("dark");
        } catch (e) {}
      })();
    </script>
  </head>
```

- [ ] **Step 2: Wrap the router in ThemeProvider in `src/main.tsx`**

Replace the file contents with:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { router } from "@/router"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 5: ModeToggle

**Files:**
- Create: `src/components/theme/mode-toggle.tsx`

- [ ] **Step 1: Create the toggle**

```tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 6: Topbar

**Files:**
- Create: `src/components/layout/Topbar.tsx`

- [ ] **Step 1: Create the Topbar**

```tsx
import { CircleUser } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/theme/mode-toggle"

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 7: Wire Topbar into AppLayout

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Replace AppLayout contents**

The current layout renders a standalone `SidebarTrigger` inside `<main>`. The trigger now
lives in the Topbar, so remove it here and render the Topbar above the scroll area.

Replace the file with:

```tsx
import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Topbar } from "./Topbar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Topbar title="DevPulse" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 8: StatCard

**Files:**
- Create: `src/components/dashboard/StatCard.tsx`

- [ ] **Step 1: Create the StatCard**

```tsx
import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type StatCardProps = {
  label: string
  value: string
  delta?: string
  icon?: LucideIcon
  loading?: boolean
}

export function StatCard({ label, value, delta, icon: Icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 9: Dashboard showcase

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace the Dashboard stub with the showcase**

```tsx
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
```

Note: the `<h1>DevPulse</h1>` page title now lives in the Topbar; the Dashboard heading is an
`<h2>` section title, which is correct semantically.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds with no errors.

---

### Task 10: Full verification against success criteria

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 2: Run dev server and verify in the browser**

Run: `npm run dev` (background). Then verify each criterion:
- Dashboard shows 4 stat cards in a responsive grid; the "Team Members" card shows
  Skeleton lines (no layout shift vs. the others).
- The brand accent (indigo/violet) appears on the active nav item, the StatCard icon chips,
  and the brand mark.
- Click the Sun/Moon toggle → Dark → the whole shell (sidebar, topbar, cards, text) stays
  legible; nothing is dark-on-dark.
- Set Light, reload → stays light with no flash. Set Dark, reload → stays dark with no flash.
- Topbar is sticky (scroll the page if content overflows) and shows title + toggle + user menu.

Expected: all criteria pass.

- [ ] **Step 3: Confirm no hardcoded slate/indigo utilities crept in**

Run: `git grep -nE "(slate|indigo)-[0-9]" -- src` (or Grep for `(slate|indigo)-[0-9]` in `src`)
Expected: no matches in our authored files (`src/components/layout`, `src/components/theme`,
`src/components/dashboard`, `src/pages`). Matches only acceptable inside generated
`src/components/ui/*` if shadcn shipped any (it should not for these).

---

## Self-Review

**Spec coverage:**
- Token principle / brand accent / status tokens → Task 1. shadcn card + dropdown-menu → Task 2.
  ThemeProvider (context, `.dark` on `documentElement`, system listener, localStorage) → Task 3.
  Anti-flash script + mount + title → Task 4. ModeToggle (Light/Dark/System) → Task 5.
  Sticky Topbar (trigger + title + toggle + user menu, backdrop-blur) → Task 6.
  Topbar wired above Outlet, standalone trigger removed → Task 7. StatCard (Card + Skeleton,
  no layout shift, accent chip) → Task 8. Dashboard showcase (4 cards, 1 loading) → Task 9.
  Success-criteria verification → Task 10. All spec sections covered.

**Placeholder scan:** No TBD/TODO. Every code step shows full file or exact find/replace.
Verify steps give exact commands + expected output.

**Type consistency:** `useTheme()` returns `{ theme, setTheme }` (Task 3) and is consumed in
Task 5. `StatCard` prop names (`label`, `value`, `delta`, `icon`, `loading`) defined in Task 8
match usage in Task 9. `Topbar` takes `title: string` (Task 6) and is called with `title="DevPulse"`
(Task 7). `ThemeProvider` named export (Task 3) imported as named (Task 4). `localStorage` key
`devpulse-theme` matches between the provider (Task 3) and the anti-flash script (Task 4).

**Commit note:** Commits intentionally omitted; user commits. Verify checkpoints replace them.
