# DevPulse Dashboard — Day 2 Design: Base UI Foundations

**Date:** 2026-06-09
**Status:** Approved

## Goal

Build a polished, premium-looking UI skeleton: a colored brand theme, a sticky top bar,
a working Light/Dark/System theme toggle, and a Dashboard showcase of `Card` + `Skeleton`
components. All color is applied through shadcn theme tokens so dark mode works correctly.

## Design Principle: Tokens, Not Hardcoded Colors

All color is defined as CSS theme tokens in `src/index.css` (`:root` + `.dark`) and consumed
via Tailwind utilities that map to those tokens (`bg-primary`, `text-success-foreground`, etc.).
We deliberately do **not** use hardcoded utilities like `bg-slate-50` / `text-indigo-600`,
because those do not respond to the `.dark` class and would break dark mode — which is the
central feature of this day.

## Color Tokens

Brand direction: **indigo/violet** accent + semantic status colors.

Add to `src/index.css`:

- **Brand accent** — redefine the existing `--primary` and `--sidebar-primary` (and keep
  `--ring`/`--sidebar-ring` aligned) to an indigo/violet hue, with distinct `:root` (light)
  and `.dark` values for legibility in both modes. `--primary-foreground` stays high-contrast.
- **Status colors** — add new pairs in both `:root` and `.dark`:
  - `--success` / `--success-foreground`
  - `--warning` / `--warning-foreground`
  - `--danger` / `--danger-foreground`
- Expose them in the `@theme inline` block as `--color-success`, `--color-success-foreground`,
  `--color-warning`, `--color-warning-foreground`, `--color-danger`, `--color-danger-foreground`
  so utilities `bg-success`, `text-warning-foreground`, `bg-danger`, etc. become available.

Status tokens are introduced now; Day 8's task-status badges consume them.

## Components (new units)

Each file has one clear responsibility:

- `src/components/theme/theme-provider.tsx`
  - React context. State: `theme: "light" | "dark" | "system"`.
  - Applies the resolved theme by toggling the `dark` class on `document.documentElement`.
  - When `theme === "system"`, follows `window.matchMedia("(prefers-color-scheme: dark)")`
    and updates live on OS change.
  - Persists the choice to `localStorage` under key `devpulse-theme`; reads it on init.
  - Exports `ThemeProvider` and a `useTheme()` hook returning `{ theme, setTheme }`.

- `src/components/theme/mode-toggle.tsx`
  - A `DropdownMenu` triggered by a `Button` (variant `ghost`, `size icon`) showing a
    Sun icon (light) / Moon icon (dark) that cross-fades.
  - Menu items: Light, Dark, System — each calls `setTheme(...)`.

- `src/components/layout/Topbar.tsx`
  - Sticky top bar: `sticky top-0 z-40`, `border-b border-border`, `bg-background/95`
    with `backdrop-blur` for a sleek scroll effect.
  - Left: `SidebarTrigger` + a page-title slot (string prop `title`).
  - Right: `ModeToggle` + a placeholder user-avatar `DropdownMenu` (items: "Profile",
    "Settings", "Log out" — non-functional placeholders this day).

- `src/components/dashboard/StatCard.tsx`
  - Built on shadcn `Card` (`CardHeader`, `CardTitle`, `CardContent`).
  - Props: `label: string`, `value: string`, `delta?: string`, `icon?: LucideIcon`,
    `loading?: boolean`.
  - When `loading`, renders `Skeleton` blocks for value and delta while preserving the
    card's height/layout (no layout shift when real data arrives on Day 5).
  - The icon sits in a small accent chip using `bg-primary/10 text-primary`.

## shadcn Components to Add

- `card`
- `dropdown-menu`

(`button`, `skeleton` already present from Day 1.)

## Wiring

- `index.html` — add an inline `<script>` in `<head>`, before the app bundle, that reads
  `localStorage["devpulse-theme"]` (or OS preference for "system"/unset) and adds the `dark`
  class to `<html>` synchronously, preventing a light-mode flash on reload in dark mode.
- `src/main.tsx` — wrap `<RouterProvider/>` in `<ThemeProvider>`.
- `src/components/layout/AppLayout.tsx` — render `<Topbar/>` above the `<Outlet/>` inside the
  main content area; the existing standalone `SidebarTrigger` moves into the Topbar.

## Showcase: Dashboard Page

`src/pages/Dashboard.tsx` becomes the visual showcase:

- A heading row ("Dashboard" + short subtitle).
- A responsive grid (`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`) of **4 `StatCard`s** with
  placeholder values (e.g. Total Tasks, In Progress, Completed, Team Members), each with a
  Lucide icon in the accent chip.
- One card rendered with `loading` to demonstrate the Skeleton state.

Day 3+ replaces placeholder values with real/derived data.

## Out of Scope (YAGNI)

- Real data fetching, charts, settings forms, the tasks data table — all later days.
- Functional user-menu actions (placeholders only).

## Success Criteria

- `npm run build` compiles with no errors.
- The theme toggle switches Light / Dark / System; choice persists across reload with no
  flash of the wrong theme.
- "System" follows the OS setting and updates live when the OS theme changes.
- In dark mode, all shell surfaces, text, the active nav item, and the stat cards remain
  legible (verifies tokens, not hardcoded colors).
- The brand accent (indigo/violet) is visible on the active nav item, primary buttons, the
  brand mark, and the stat-card icon chips.
- The Dashboard shows 4 stat cards in a responsive grid; the loading card shows Skeletons
  without layout shift.
- The Topbar is sticky and shows the page title, mode toggle, and user menu.
