import type { SetLog } from '@/domain/training/entities/SetLog'
import { GYM_REASONS } from '@/constants/deviationReasons'

interface Props {
  set: SetLog
  onAsPlanned: () => void
  onDeviation: () => void
}

export function SetCard({ set, onAsPlanned, onDeviation }: Props) {
  if (set.status === 'AS_PLANNED') {
    return (
      <Wrapper stripe="bg-status-success" tint="bg-[#001A09]">
        <Row>
          <span className="font-display font-semibold uppercase">Set {set.setNumber}</span>
          <span className="font-mono text-mono-md text-status-success">
            {fmt(set.actual?.weight)} kg × {set.actual?.reps}
          </span>
        </Row>
        <div className="text-status-success font-display uppercase tracking-wider mt-1">✓ As planned</div>
      </Wrapper>
    )
  }
  if (set.status === 'POSITIVE') {
    const r = set.deviationReason ? GYM_REASONS[set.deviationReason] : null
    return (
      <Wrapper stripe="bg-status-positive" tint="bg-[#001A0A]">
        <Row>
          <span className="font-display font-semibold uppercase">Set {set.setNumber}</span>
          <span className="font-mono text-mono-md text-status-positive">
            {fmt(set.actual?.weight)} kg × {set.actual?.reps}
          </span>
        </Row>
        <div className="text-status-positive font-display uppercase tracking-wider mt-1 text-body-sm">
          📈 {r?.label ?? 'Went heavier'}
        </div>
      </Wrapper>
    )
  }
  if (set.status === 'DEVIATION') {
    const r = set.deviationReason ? GYM_REASONS[set.deviationReason] : null
    return (
      <Wrapper stripe="bg-status-deviation" tint="bg-[#1A0900]">
        <Row>
          <span className="font-display font-semibold uppercase">Set {set.setNumber}</span>
          <span className="font-mono text-mono-md text-status-deviation">
            {fmt(set.actual?.weight)} kg × {set.actual?.reps}
          </span>
        </Row>
        <div className="text-status-deviation text-body-sm mt-1">
          {r ? `${r.emoji} ${r.label}` : 'Deviation'}
        </div>
      </Wrapper>
    )
  }
  if (set.status === 'SKIPPED') {
    return (
      <Wrapper>
        <Row>
          <span className="font-display font-semibold uppercase line-through text-text-tertiary">Set {set.setNumber}</span>
          <span className="font-mono text-mono-md line-through text-text-tertiary">
            {fmt(set.planned.weight)} kg × {set.planned.reps}
          </span>
        </Row>
        <div className="text-text-tertiary text-body-sm mt-1">⊘ Skipped</div>
      </Wrapper>
    )
  }
  // PENDING
  return (
    <Wrapper>
      <Row>
        <span className="font-display font-semibold uppercase">Set {set.setNumber}</span>
        <span className="font-mono text-mono-md">{fmt(set.planned.weight)} kg × {set.planned.reps}</span>
      </Row>
      <div className="grid grid-cols-2 gap-sm mt-md">
        <button
          onClick={onAsPlanned}
          className="h-12 rounded-card bg-status-success/10 border border-status-success/40 text-status-success font-display uppercase tracking-wider text-[15px] active:scale-[0.98] transition-transform"
        >
          ✓ As planned
        </button>
        <button
          onClick={onDeviation}
          className="h-12 rounded-card bg-status-deviation/10 border border-status-deviation/40 text-status-deviation font-display uppercase tracking-wider text-[15px] active:scale-[0.98] transition-transform"
        >
          ⚡ Deviation
        </button>
      </div>
    </Wrapper>
  )
}

function Wrapper({ stripe, tint, children }: { stripe?: string; tint?: string; children: React.ReactNode }) {
  return (
    <div className={`relative rounded-card border border-border-subtle ${tint ?? 'bg-bg-surface'} p-md overflow-hidden`}>
      {stripe && <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripe}`} />}
      <div className={stripe ? 'pl-2' : ''}>{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-baseline justify-between gap-md">{children}</div>
}

function fmt(n: number | undefined | null): string {
  if (n == null) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
