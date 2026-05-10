# FORMA

Personal fitness logger PWA. Built for one user, one 15-month plan, one phone.

## What it is

- **Vite + React + TypeScript** front-end, no backend.
- **Dexie.js** (IndexedDB) for structured local storage; `localStorage` for settings.
- **Zustand** for UI state, **Framer Motion** for sheets, **Recharts** for charts.
- **PWA**: installable on iOS via Safari → Share → Add to Home Screen.
- **Nutrition tracking**: meals + addons (supplements, macros, etc).
- **Gym logging**: session tracking, progressive overload, backfill for past workouts.

Everything runs offline. All data stays on the device.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` on your laptop or a phone on the same network.

## Build & deploy

```bash
npm run build
npm run preview              # local preview at port 4173
npx vercel --prod            # deploy to Vercel free tier
```

`vercel.json` already routes all paths to `index.html` for client-side routing.

## Install on iPhone

1. Visit the deployed URL in Safari.
2. Tap the share icon → **Add to Home Screen**.
3. Open the app from your home screen — it opens full-screen, works offline, and saves
   data to IndexedDB local to that browser profile.

## Project layout

See [CLAUDE.md](./CLAUDE.md) for the architecture and agent rules.

```
src/
  domain/           pure types + invariants
  infrastructure/   Dexie + localStorage adapters
  application/      use cases
  presentation/     pages, components, Zustand stores
  data/             static plan content (exercises, meals)
  constants/        plan start date, deviation reasons
```

## Plan parameters

- Plan start: **April 3, 2026** (constant in `src/constants/plan.ts`)
- Duration: 15 months
- Phase 1 — Foundation, full-body Mon/Wed/Fri (months 1–2)
- Phase 2 — Lean Bulk, PPL six days (months 3–10)
- Phase 3 — Sculpt, PPL + LISS cardio (months 11–15)

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |

## Source documents

The product, design and architecture specs are kept in `../docs/artifacts/` at the
repo root. Read those before adding features.
