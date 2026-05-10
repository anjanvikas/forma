import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { GYM_REASONS } from '@/constants/deviationReasons'

export function SessionSummary() {
  const nav = useNavigate()
  const { summary, clearSummary } = useSessionStore()

  useEffect(() => {
    if (!summary) nav('/', { replace: true })
  }, [summary, nav])

  if (!summary) return null

  const r = summary.topReason ? GYM_REASONS[summary.topReason] : null

  return (
    <div className="screen px-md pt-lg flex flex-col">
      <div className="flex-1">
        <div className="text-center">
          <div className="label-caps">Session complete</div>
          <div className="font-display font-bold text-display-xl mt-2 font-mono">
            {fmtTime(summary.durationMinutes)}
          </div>
        </div>

        <div className="card mt-lg">
          <div className="grid grid-cols-3 gap-md text-center">
            <Stat value={summary.asPlannedCount + summary.positiveCount} label="As planned" color="text-status-success" />
            <Stat value={summary.deviationCount} label="Deviations" color="text-status-deviation" />
            <Stat value={summary.skippedCount} label="Skipped" color="text-text-tertiary" />
          </div>
        </div>

        {r && (
          <div className="card mt-md">
            <div className="label-caps">Top reason</div>
            <div className="text-display-md font-display mt-1">
              {r.emoji} {r.label}
            </div>
          </div>
        )}

        {summary.nextTargets.length > 0 && (
          <div className="card mt-md">
            <div className="label-caps mb-md">Next session targets</div>
            <ul className="space-y-2">
              {summary.nextTargets.map(t => {
                const arrow = t.next > t.previous ? '↑' : t.next < t.previous ? '↓' : ''
                const color = t.next > t.previous ? 'text-status-positive' : 'text-text-secondary'
                return (
                  <li key={t.exerciseId} className="flex justify-between items-baseline">
                    <span className="text-body-md">{t.exerciseName}</span>
                    <span className={`font-mono text-mono-md ${color}`}>
                      {t.previous.toFixed(1)} → {t.next.toFixed(1)} kg {arrow}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => { clearSummary(); nav('/') }}
        className="btn-primary mt-lg mb-[env(safe-area-inset-bottom)]"
      >
        Done
      </button>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className={`font-display font-bold text-display-lg ${color}`}>{value}</div>
      <div className="text-body-sm text-text-secondary uppercase tracking-wider">{label}</div>
    </div>
  )
}

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}:00`
  return `${h}:${String(m).padStart(2, '0')}`
}
