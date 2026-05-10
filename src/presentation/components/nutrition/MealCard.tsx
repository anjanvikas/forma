import type { MealLog } from '@/domain/nutrition/entities/MealLog'
import type { PlannedMeal } from '@/domain/nutrition/entities/PlannedMeal'
import { MEAL_SLOT_LABEL, MEAL_SLOT_TIME } from '@/domain/nutrition/value-objects/MealSlot'
import { MEAL_REASONS } from '@/constants/deviationReasons'

interface Props {
  log: MealLog
  planned: PlannedMeal | null
  onTap: () => void
}

export function MealCard({ log, planned, onTap }: Props) {
  if (!planned) return null
  const stripe = log.status === 'EATEN_AS_PLANNED' || log.status === 'EATEN_WITH_SWAP'
    ? 'bg-status-success'
    : log.status === 'SKIPPED'
    ? 'bg-status-deviation'
    : null

  const statusLabel = (() => {
    if (log.status === 'EATEN_AS_PLANNED') return '✓ Eaten as planned'
    if (log.status === 'EATEN_WITH_SWAP') {
      if (log.proteinSwap === 'PANEER') return '✓ Paneer variant'
      if (log.milkSwap === 'WATER') return '✓ Water mix'
      return '✓ With swap'
    }
    if (log.status === 'SKIPPED' && log.skipReason) {
      const r = MEAL_REASONS[log.skipReason]
      return `⊘ Skipped · ${r.emoji} ${r.label}`
    }
    return null
  })()

  return (
    <button
      onClick={onTap}
      className="relative w-full text-left rounded-card bg-bg-surface border border-border-subtle p-md overflow-hidden active:scale-[0.99] transition-transform"
    >
      {stripe && <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripe}`} />}
      <div className={stripe ? 'pl-2' : ''}>
        <div className="flex justify-between items-baseline">
          <div className="font-mono text-mono-sm text-text-secondary">{MEAL_SLOT_TIME[log.mealSlot]}</div>
          <div className="text-body-sm text-text-tertiary font-mono">~{planned.macros.calories} kcal</div>
        </div>
        <div className="font-display font-semibold uppercase tracking-wide mt-1">
          {MEAL_SLOT_LABEL[log.mealSlot]}
        </div>
        <div className="text-body-md text-text-secondary mt-1">{planned.description}</div>
        <div className="font-mono text-mono-sm text-text-tertiary mt-1">
          P:{planned.macros.protein} · C:{planned.macros.carbs} · F:{planned.macros.fats}
        </div>
        {statusLabel && (
          <div className="mt-2 text-body-sm text-status-success">
            {log.status === 'SKIPPED' ? <span className="text-status-deviation">{statusLabel}</span> : statusLabel}
          </div>
        )}
      </div>
    </button>
  )
}
