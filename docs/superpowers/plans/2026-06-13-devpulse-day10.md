# DevPulse Day 10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace boilerplate README, capture demo screenshots from the running app, and write WALKTHROUGH.md (4 scenes) built on the user's draft.

**Tech Stack:** Markdown docs; Chrome DevTools for screenshot capture.

**Note on commits:** Per user instruction, this plan does NOT commit.

**Note on testing:** No tests — docs only. Build + 17 tests run once as a sanity check.

---

### Task 1: Capture demo screenshots

**Files:**
- Create: `docs/screenshots/{zod-validation,data-mapping,optimistic-create,caching,table-dark}.png`

- [ ] **Step 1: Start a clean dev server** (kill stale ones first).
- [ ] **Step 2:** Capture `data-mapping.png` — Tasks table (light), 5 columns with badges.
- [ ] **Step 3:** Capture `table-dark.png` — Tasks table in dark mode.
- [ ] **Step 4:** Capture `zod-validation.png` — New Task dialog, submit empty, inline errors visible.
- [ ] **Step 5:** Capture `optimistic-create.png` — new task row at top of table after create.
- [ ] **Step 6:** Capture `caching.png` — Network tab / request-count proof of one `/todos` after Dashboard↔Tasks nav. (If a clean Network-panel frame isn't capturable, capture the app state and rely on the doc's inline description + request-count evidence.)

Screenshots saved via the screenshot tool's `filePath` to `docs/screenshots/`.

---

### Task 2: Write README.md

**Files:**
- Modify: `README.md` (full replacement)

- [ ] **Step 1:** Replace with: title + pitch, mock-API honesty note, tech-stack table (choice + why),
  annotated `src/` folder map, key-patterns bullets, getting-started commands, Demo section linking
  WALKTHROUGH.md. (Content per spec.)

---

### Task 3: Write WALKTHROUGH.md

**Files:**
- Create: `WALKTHROUGH.md`

- [ ] **Step 1:** Write the 4 scenes (Zod validation, data mapping, React Query caching, optimistic
  rollback) on the user's Scenario→Action→Expected→"proves" structure, table wording, honest offline
  timing, each embedding its `docs/screenshots/*.png`.

---

### Task 4: Verify

- [ ] **Step 1:** Confirm screenshots exist in `docs/screenshots/` and are referenced by both docs.
- [ ] **Step 2:** `npm run build` + `npm test` → clean (sanity; no code changed).
- [ ] **Step 3:** Read README + WALKTHROUGH back for accuracy (commands exist, wording matches app).
