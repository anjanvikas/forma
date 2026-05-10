import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useTodayStore } from '../stores/todayStore'
import { useSessionStore } from '../stores/sessionStore'
import { PhaseBadge } from '../components/shared/PhaseBadge'
import { SleepCard } from '../components/health/SleepCard'
import { WeightCard } from '../components/health/WeightCard'
import { ProtocolChecklist } from '../components/health/ProtocolChecklist'
import { MealCard } from '../components/nutrition/MealCard'
import { MacroBar } from '../components/nutrition/MacroBar'
import { MealLogSheet } from '../components/nutrition/MealLogSheet'
import { AddonsCard } from '../components/nutrition/AddonsCard'
import { logMeal } from '@/application/nutrition/mealUseCases'
import { incrementAddon } from '@/application/nutrition/addonUseCases'
import { lookupMeal } from '@/data'
import { ZERO_MACROS, addMacros } from '@/domain/planning/value-objects/MacroTargets'
import { ADDON_MACROS, type AddonKind } from '@/domain/nutrition/value-objects/Addon'
import type { MealLog } from '@/domain/nutrition/entities/MealLog'
import { BottomSheet } from '../components/shared/BottomSheet'
import type { SessionType } from '@/domain/planning/value-objects/SessionType'

export function Today() {
  const nav = useNavigate()
  const { loaded, info, isRestDay, activeBreak, todaySession, nutrition, load, setNutrition } = useTodayStore()
  const startSession = useSessionStore(s => s.startSession)
  const [mealOpen, setMealOpen] = useState<MealLog | null>(null)
  const [trainAnywayOpen, setTrainAnywayOpen] = useState(false)

  useEffect(() => { void load() }, [load])

  if (!loaded || !info) {
    return <div className="screen px-md flex items-center justify-center text-text-secondary">Loading…</div>
  }

  const onCheckIn = async (override?: Exclude<SessionType, 'REST'>) => {
    const session = await startSession(override)
    if (session) nav('/session/active')
  }

  const adhocOptions: { type: Exclude<SessionType, 'REST'>; label: string }[] =
    info.phase === 'PHASE_1'
      ? [{ type: 'FULL_BODY', label: 'Full body' }]
      : [
          { type: 'PUSH_1', label: 'Push 1' },
          { type: 'PUSH_2', label: 'Push 2' },
          { type: 'PULL_1', label: 'Pull 1' },
          { type: 'PULL_2', label: 'Pull 2' },
          { type: 'LEGS_1', label: 'Legs 1' },
          { type: 'LEGS_2', label: 'Legs 2' },
        ]

  // Compute actual macros from logs (planned macros for meals marked eaten/swap, plus add-ons).
  const mealMacros = (nutrition?.mealLogs ?? []).reduce((acc, m) => {
    if (m.status === 'EATEN_AS_PLANNED' || m.status === 'EATEN_WITH_SWAP') {
      const planned = lookupMeal(nutrition!.phase, m.mealSlot, nutrition!.isRestDay)
      if (planned) return addMacros(acc, planned.macros)
    }
    return acc
  }, ZERO_MACROS)
  const addonMacros = (nutrition?.addons ?? []).reduce((acc, a) => {
    const m = ADDON_MACROS[a.kind]
    return addMacros(acc, {
      protein: m.protein * a.count,
      carbs: m.carbs * a.count,
      fats: m.fats * a.count,
      calories: m.calories * a.count,
    })
  }, ZERO_MACROS)
  const actualMacros = addMacros(mealMacros, addonMacros)

  return (
    <div className="screen px-md space-y-md pt-md">
      <header className="space-y-1">
        <PhaseBadge info={info} onBreak={!!activeBreak} />
        <h1 className="font-display font-semibold text-display-lg uppercase">
          {format(new Date(), 'EEEE')}
        </h1>
        <div className="text-body-sm text-text-secondary">{format(new Date(), 'MMMM d, yyyy')}</div>
      </header>

      <WeightCard />
      <SleepCard />

      {activeBreak ? (
        <BreakModeCard />
      ) : (
        <>
          {!isRestDay ? (
            <div className="card">
              <div className="label-caps">🏋️ Today's workout</div>
              <div className="font-display font-semibold text-display-md mt-1">
                {sessionLabel(info.phase, todaySession?.sessionType)}
              </div>
              {todaySession?.status === 'COMPLETED' ? (
                <div className="mt-md">
                  <div className="text-status-success font-display uppercase tracking-wider">✅ Completed</div>
                  <button onClick={() => nav('/history')} className="btn-secondary mt-md">
                    View session
                  </button>
                </div>
              ) : todaySession?.status === 'IN_PROGRESS' ? (
                <button onClick={() => nav('/session/active')} className="btn-primary mt-md">
                  Resume session
                </button>
              ) : (
                <button onClick={() => onCheckIn()} className="btn-primary mt-md">Check in</button>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="label-caps">🛌 Rest day</div>
              <div className="text-body-md text-text-secondary mt-1">
                No gym today. Macros are set for a rest day.
              </div>
              {todaySession?.status === 'COMPLETED' ? (
                <div className="mt-md text-status-success font-display uppercase tracking-wider">
                  ✅ Trained anyway
                </div>
              ) : todaySession?.status === 'IN_PROGRESS' ? (
                <button onClick={() => nav('/session/active')} className="btn-primary mt-md">
                  Resume session
                </button>
              ) : (
                <button onClick={() => setTrainAnywayOpen(true)} className="btn-secondary mt-md">
                  Train anyway
                </button>
              )}
            </div>
          )}

          {nutrition && (
            <section className="space-y-md">
              <div className="card space-y-2">
                <div className="label-caps mb-2">Macros today</div>
                <MacroBar label="Protein" actual={actualMacros.protein} target={nutrition.targets.protein} />
                <MacroBar label="Carbs" actual={actualMacros.carbs} target={nutrition.targets.carbs} />
                <MacroBar label="Fats" actual={actualMacros.fats} target={nutrition.targets.fats} />
                <MacroBar label="Calories" actual={actualMacros.calories} target={nutrition.targets.calories} unit="" />
              </div>

              <div className="space-y-sm">
                <div className="label-caps">Meals</div>
                {nutrition.mealLogs.map(m => (
                  <MealCard
                    key={m.id}
                    log={m}
                    planned={lookupMeal(nutrition.phase, m.mealSlot, nutrition.isRestDay)}
                    onTap={() => setMealOpen(m)}
                  />
                ))}
              </div>

              <AddonsCard
                log={nutrition}
                onChange={async (kind: AddonKind, delta: number) => {
                  const next = await incrementAddon(nutrition, kind, delta)
                  setNutrition(next)
                }}
              />
            </section>
          )}
        </>
      )}

      <ProtocolChecklist />

      <BottomSheet
        open={trainAnywayOpen}
        onClose={() => setTrainAnywayOpen(false)}
        title="Train anyway"
      >
        <div className="text-body-sm text-text-secondary mb-md">
          Pick a session type. This logs an extra workout on a rest day.
        </div>
        <div className="space-y-sm">
          {adhocOptions.map(opt => (
            <button
              key={opt.type}
              className="btn-secondary"
              onClick={async () => {
                setTrainAnywayOpen(false)
                await onCheckIn(opt.type)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <MealLogSheet
        open={!!mealOpen}
        log={mealOpen}
        planned={mealOpen && nutrition ? lookupMeal(nutrition.phase, mealOpen.mealSlot, nutrition.isRestDay) : null}
        onClose={() => setMealOpen(null)}
        onConfirm={async (status, opts) => {
          if (!nutrition || !mealOpen) return
          const next = await logMeal(nutrition, mealOpen.mealSlot, status, opts)
          setNutrition(next)
          setMealOpen(null)
        }}
      />
    </div>
  )
}

function BreakModeCard() {
  const nav = useNavigate()
  return (
    <div className="card border-status-warning/40">
      <div className="label-caps text-status-warning">⏸ Plan paused</div>
      <div className="font-display font-semibold text-display-md mt-1">Your timeline is paused</div>
      <div className="text-body-sm text-text-secondary mt-1">
        Phase and week resume when you're back.
      </div>
      <button onClick={() => nav('/settings')} className="btn-primary mt-md">Resume plan</button>
    </div>
  )
}

function sessionLabel(_phase: string, type?: string) {
  if (!type) return '—'
  return type.replace('_', ' ')
}
