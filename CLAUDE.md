# FORMA — Agent Guide

Personal fitness logger PWA. Single-user, fully offline, dark-mode only.
Read this before touching any code.

## Architecture (DDD, layered)

```
src/
├── domain/                  ← Pure TypeScript. No React. No browser APIs.
│   ├── planning/            ← PhaseCalendar, FitnessPhase, PlannedExercise
│   ├── training/            ← WorkoutSession aggregate, ProgressionCalculator
│   ├── nutrition/           ← DailyNutritionLog aggregate, MealLog
│   ├── health/              ← BodyWeight, SleepLog, HairProtocol, evalSleep
│   └── breaks/              ← BreakPeriod
├── infrastructure/          ← Concrete adapters
│   ├── db/database.ts       ← Dexie (IndexedDB) schema + instance
│   ├── repositories/        ← Implements IRepository interfaces
│   └── storage/             ← localStorage Settings
├── application/             ← Use cases — orchestrate domain + infra
│   ├── gym/                 ← checkIn, logSet, deviation, skip, checkOut
│   ├── nutrition/           ← ensureNutritionLog, logMeal
│   ├── health/              ← logSleep, logBodyWeight, protocol
│   ├── breaks/              ← startBreak, resumeBreak
│   └── progress/            ← weekly + monthly summaries
├── presentation/            ← React, Tailwind, Framer Motion, Zustand
│   ├── pages/               ← Route-level screens
│   ├── components/          ← gym/ nutrition/ health/ progress/ shared/ layout/
│   └── stores/              ← Zustand: todayStore, sessionStore
├── data/                    ← Static plan content (phases, exercises, meals)
└── constants/               ← plan.ts, deviationReasons.ts
```

**Dependency rule:** presentation → application → domain. Domain depends on nothing.
Infrastructure implements domain interfaces. Never import from `presentation` inside
`domain`/`application`.

## Hard constraints

- **Plan start date is fixed**: `PLAN_START_DATE = 2026-04-03` in `src/constants/plan.ts`.
  Never make this user-configurable.
- **No backend.** No fetch, no axios. All data is local (IndexedDB via Dexie + localStorage).
- **Dark mode only.** Don't add a light theme.
- **No free-text inputs anywhere.** Use chips, steppers, and toggles only.
- **iPhone-only viewport.** Layouts target ~390px width inside a 440px max container.

## Domain rules to preserve

- Phase 1 (months 1–2): Full Body, Mon/Wed/Fri.
- Phase 2 (months 3–10) + Phase 3 (months 11–15): PPL, six days, Sunday rest.
- Body weight is logged on Mondays only (`logBodyWeight` throws otherwise).
- Progressive overload: +2.5 kg every 2 clean weeks on compound lifts. Any deviation in
  the last 14 days resets the clock. A POSITIVE deviation (went heavier) sets a new
  baseline. See `ProgressionCalculator.computeNextWeight`.
- Hair protocol continues during breaks. Gym + nutrition pause.

## Common tasks

| Task | Where |
|---|---|
| Add a new exercise | `src/data/phaseN/exercises.ts` |
| Tweak meals | `src/data/phaseN/meals.ts` |
| Add a deviation reason | `src/constants/deviationReasons.ts` (and DB stays loose — string column) |
| Add a screen | `src/presentation/pages/` + register in `App.tsx` |
| Add a Dexie table | bump version in `src/infrastructure/db/database.ts` and add a repository |

## Run / build / test

```bash
npm install
npm run dev          # Vite dev server, http://localhost:5173
npm run build        # production bundle to dist/
npm run preview      # serve dist/ locally
npm run typecheck    # tsc --noEmit
```

## Deploy

The repo includes `vercel.json`. From this folder:

```bash
npm run build
npx vercel --prod
```

## Ground rules for agents

1. Don't touch `domain/` from React. Use a use-case in `application/`.
2. Aggregates are saved as flat records by repositories. Never reach into Dexie directly
   from a use case — go through `application/repos.ts`.
3. Keep new components inside an existing component folder (`gym/`, `nutrition/`,
   `health/`, `progress/`, `shared/`, `layout/`). Don't create a new top-level folder.
4. New plan content is data, not code: prefer adding to `src/data/` over hard-coding in
   components.
5. The state machine for sets is `PENDING → AS_PLANNED | DEVIATION | POSITIVE | SKIPPED`.
   Don't introduce intermediate states.
