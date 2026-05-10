import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../stores/sessionStore'
import { SetCard } from '../components/gym/SetCard'
import { DeviationSheet } from '../components/gym/DeviationSheet'
import { SkipExerciseSheet } from '../components/gym/SkipExerciseSheet'
import { SessionTimer } from '../components/gym/SessionTimer'
import { lookupExercise } from '@/data'
import type { ExerciseLog } from '@/domain/training/entities/ExerciseLog'

export function ActiveSession() {
  const nav = useNavigate()
  const { active, loadActive, asPlanned, deviation, skipExercise, finish, busy } = useSessionStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [devSheet, setDevSheet] = useState<{ exerciseLogId: string; setNumber: number } | null>(null)
  const [skipSheet, setSkipSheet] = useState<ExerciseLog | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null)

  useEffect(() => {
    if (!active) void loadActive()
  }, [active, loadActive])

  useEffect(() => {
    if (active && expanded === null && active.exerciseLogs.length > 0) {
      setExpanded(active.exerciseLogs[0].id)
    }
  }, [active, expanded])

  if (!active) {
    return <div className="screen px-md flex items-center justify-center text-text-secondary">Loading…</div>
  }

  const onFinish = async () => {
    await finish()
    nav('/session/summary')
  }

  const startLongPress = (ex: ExerciseLog) => {
    const timer = window.setTimeout(() => setSkipSheet(ex), 600)
    setLongPressTimer(timer)
  }
  const cancelLongPress = () => {
    if (longPressTimer != null) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const devTarget = devSheet
    ? active.exerciseLogs.find(e => e.id === devSheet.exerciseLogId)
    : null
  const devSet = devTarget?.setLogs.find(s => s.setNumber === devSheet?.setNumber)
  const devPlanned = devTarget ? lookupExercise(devTarget.exerciseId) : null

  return (
    <div className="screen px-md pt-md pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <header className="flex items-center justify-between mb-md">
        <button onClick={() => nav('/')} className="text-text-secondary text-2xl">←</button>
        <h1 className="font-display font-semibold uppercase text-display-md">
          {active.sessionType.replace('_', ' ')}
        </h1>
        <SessionTimer start={active.checkInTime} />
      </header>

      <div className="space-y-md">
        {active.exerciseLogs.map(ex => {
          const isOpen = expanded === ex.id
          return (
            <div key={ex.id} className="rounded-card bg-bg-surface border border-border-subtle overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-md"
                onClick={() => setExpanded(isOpen ? null : ex.id)}
                onTouchStart={() => startLongPress(ex)}
                onTouchEnd={cancelLongPress}
                onTouchCancel={cancelLongPress}
                onMouseDown={() => startLongPress(ex)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
              >
                <div className="text-left">
                  <div className="font-display font-semibold uppercase text-display-md">{ex.exerciseName}</div>
                  <div className="text-body-sm text-text-secondary">
                    {ex.setLogs.length} sets · {summarise(ex)}
                  </div>
                </div>
                <span className="text-text-secondary">{isOpen ? '▼' : '▶'}</span>
              </button>
              {isOpen && (
                <div className="px-md pb-md space-y-sm">
                  {ex.setLogs.map(s => (
                    <SetCard
                      key={s.id}
                      set={s}
                      onAsPlanned={() => asPlanned(ex.id, s.setNumber)}
                      onDeviation={() => setDevSheet({ exerciseLogId: ex.id, setNumber: s.setNumber })}
                    />
                  ))}
                  <button
                    onClick={() => setSkipSheet(ex)}
                    className="w-full text-text-tertiary text-body-sm py-2 hover:text-status-deviation"
                  >
                    Skip entire exercise
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto px-md pb-[calc(env(safe-area-inset-bottom)+12px)] pt-md bg-gradient-to-t from-bg-base via-bg-base to-transparent">
        <button onClick={onFinish} disabled={busy} className="btn-primary">
          {busy ? 'Saving…' : 'Finish session'}
        </button>
      </div>

      <DeviationSheet
        open={!!devSheet}
        exerciseName={devTarget?.exerciseName ?? ''}
        setNumber={devSheet?.setNumber ?? 0}
        exercise={devPlanned}
        plannedWeight={devSet?.planned.weight ?? 0}
        plannedReps={devSet?.planned.reps ?? 0}
        onClose={() => setDevSheet(null)}
        onConfirm={async (w, r, reason) => {
          if (!devSheet) return
          await deviation(devSheet.exerciseLogId, devSheet.setNumber, w, r, reason)
          setDevSheet(null)
        }}
      />
      <SkipExerciseSheet
        open={!!skipSheet}
        exerciseName={skipSheet?.exerciseName ?? ''}
        totalSets={skipSheet?.setLogs.length ?? 0}
        onClose={() => setSkipSheet(null)}
        onSkip={async (reason) => {
          if (!skipSheet) return
          await skipExercise(skipSheet.id, reason)
          setSkipSheet(null)
        }}
      />
    </div>
  )
}

function summarise(ex: ExerciseLog): string {
  const planned = ex.setLogs[0]?.planned
  if (!planned) return ''
  const fmt = Number.isInteger(planned.weight) ? String(planned.weight) : planned.weight.toFixed(1)
  const done = ex.setLogs.filter(s => s.status !== 'PENDING').length
  return `${fmt} kg × ${planned.reps} · ${done}/${ex.setLogs.length} done`
}
