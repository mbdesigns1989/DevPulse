# DevPulse Dashboard — Day 1 Design: Setup, Architecture & Router

**Date:** 2026-06-07
**Status:** Approved

## Goal

Set up a clean folder structure and establish seamless application navigation. By the
end of Day 1, the app navigates between four pages with placeholder content, and the
project structure is ready for the remaining 9 days of feature work.

## Tooling Baseline

- **Vite + React + TypeScript** (`npm create vite@latest` → `react-ts` template).
- **Tailwind CSS v4** — Vite plugin (`@tailwindcss/vite`), CSS-first config. No
  `tailwind.config.js`; theme tokens live in `src/index.css` via `@theme`.
- **shadcn/ui** — initialized with the latest CLI. Generated primitives land in
  `src/components/ui/`.
- **React Router** (v6/v7) — `createBrowserRouter` + `RouterProvider`.

## Architecture

A single-page React application. Navigation is wired through **one nested layout
route**: a layout component renders the persistent sidebar plus an `<Outlet/>`, and the
four pages render as children inside it. The sidebar does not remount on navigation.

## Folder Structure

```
src/
  components/
    layout/          # AppSidebar, AppLayout (sidebar + <Outlet/>)
    ui/              # shadcn-generated components (button, sidebar, etc.)
  pages/
    Dashboard.tsx    # stub: "Dashboard" heading
    Tasks.tsx        # stub: "Tasks" heading
    Settings.tsx     # stub: "Settings" heading
  router/
    index.tsx        # route tree definition
  lib/
    utils.ts         # shadcn's cn() helper
  index.css          # Tailwind v4 entry + theme tokens
  main.tsx           # RouterProvider mount
```

## Routing

`createBrowserRouter` with one layout route at `/`:

- `/` → `AppLayout` (renders `AppSidebar` + `<Outlet/>`); `index` route redirects to
  `/dashboard`.
- `/dashboard` → `Dashboard` (child)
- `/tasks` → `Tasks` (child)
- `/settings` → `Settings` (child)

The sidebar lives in the layout, so it persists across route changes.

## Sidebar

Built on shadcn's `sidebar` component (responsive, collapsible, mobile drawer included).
A simple branded header at the top, then four nav links rendered with React Router's
`NavLink` so the active route is highlighted automatically.

## Out of Scope for Day 1 (YAGNI)

- Real dashboard analytics cards
- The tasks data table
- Theme toggle logic and settings forms

Pages are stubs solely to prove routing works. These features are scoped to later days.

## Success Criteria

- `npm run dev` serves the app with no errors.
- Visiting `/` redirects to `/dashboard`.
- Clicking sidebar links navigates between Dashboard / Tasks / Settings without full
  page reloads; the active link is highlighted; the sidebar persists.
- Sidebar collapses / opens as a drawer on mobile widths.
- Tailwind v4 utility classes and a shadcn component both render correctly.
