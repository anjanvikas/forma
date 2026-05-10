import type { PhaseInfo } from '@/domain/planning/PhaseCalendar'
import { PHASES } from '@/domain/planning/entities/FitnessPhase'

export function PhaseBadge({ info, onBreak }: { info: PhaseInfo; onBreak?: boolean }) {
  const name = PHASES[info.phase].name.toUpperCase()
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-display uppercase tracking-wider ${
        onBreak ? 'bg-status-warning/15 text-status-warning' : 'bg-bg-elevated text-text-secondary'
      }`}
    >
      {onBreak && <span>⏸</span>}
      <span>
        Phase {phaseNumber(info)} · {name} · M{info.monthInPlan} · W{info.weekInPhase}
      </span>
    </div>
  )
}

function phaseNumber(info: PhaseInfo) {
  if (info.phase === 'PHASE_1') return 1
  if (info.phase === 'PHASE_2') return 2
  return 3
}
