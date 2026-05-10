import { useEffect, useState } from 'react'
import { sessionRepo } from '@/application/repos'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import { format, parseISO } from 'date-fns'

export function History() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    void sessionRepo.findRecent(60).then(setSessions)
  }, [])

  return (
    <div className="screen px-md pt-md space-y-md">
      <h1 className="font-display font-semibold text-display-lg uppercase">History</h1>
      {sessions.length === 0 && (
        <div className="text-text-secondary">No sessions logged yet.</div>
      )}
      {sessions.map(s => {
        const sets = s.exerciseLogs.flatMap(e => e.setLogs)
        const total = sets.length
        const planned = sets.filter(x => x.status === 'AS_PLANNED' || x.status === 'POSITIVE').length
        return (
          <button
            key={s.id}
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            className="w-full text-left card"
          >
            <div className="flex justify-between items-baseline">
              <div className="font-display font-semibold uppercase">
                {format(parseISO(s.date), 'EEE, MMM d')}
              </div>
              <div className="font-mono text-mono-sm text-text-secondary">
                {s.durationMinutes ? `${s.durationMinutes}m` : s.status}
              </div>
            </div>
            <div className="text-body-sm text-text-secondary mt-1">
              {s.sessionType.replace('_', ' ')} · {planned}/{total} as planned
            </div>
            {expanded === s.id && (
              <div className="mt-md space-y-2">
                {s.exerciseLogs.map(ex => (
                  <div key={ex.id}>
                    <div className="font-display uppercase text-body-md">{ex.exerciseName}</div>
                    <div className="text-body-sm text-text-secondary font-mono">
                      {ex.setLogs.map(set => `${set.actual?.weight ?? set.planned.weight}×${set.actual?.reps ?? set.planned.reps}${set.status === 'DEVIATION' ? '⚡' : set.status === 'POSITIVE' ? '📈' : set.status === 'SKIPPED' ? '⊘' : ''}`).join('  ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
