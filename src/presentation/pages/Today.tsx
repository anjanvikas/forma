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
import { logMeal } from '@/application/nutrition/mealUseCases'
import { lookupMeal } from '@/data'
import { ZERO_MACROS, addMacros } from '@/domain/planning/value-objects/MacroTargets'
import type { MealLog } from '@/domain/nutrition/entities/MealLog'

export function Today() {
  const nav = useNavigate()
  const { loaded, info, isRestDay, activeBreak, todaySession, nutrition, load, setNutrition } = useTodayStore()
  const startSession = useSessionStore(s => s.startSession)
  const [mealOpen, setMealOpen] = useState<MealLog | null>(null)

  useEffect(() => { void load() }, [load])

  if (!loaded || !info) {
    return <div className="screen px-md flex items-center justify-center text-text-secondary">Loading…</div>
  }

  const onCheckIn = async () => {
    const session = await startSession()
    if (session) nav('/session/active')
  }

  // Compute actual macros from logs (planned macros for meals marked eaten/swap).
  const actualMacros = (nutrition?.mealLogs ?? []).reduce((acc, m) => {
    if (m.status === 'EATEN_AS_PLANNED' || m.status === 'EATEN_WITH_SWAP') {
      const planned = lookupMeal(nutrition!.phase, m.mealSlot, nutrition!.isRestDay)
      if (planned) return addMacros(acc, planned.macros)
    }
    return acc
  }, ZERO_MACROS)

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
                <button onClick={onCheckIn} className="btn-primary mt-md">Check in</button>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="label-caps">🛌 Rest day</div>
              <div className="text-body-md text-text-secondary mt-1">
                No gym today. Macros are set for a rest day.
              </div>
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
            </section>
          )}
        </>
      )}

      <ProtocolChecklist />

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
