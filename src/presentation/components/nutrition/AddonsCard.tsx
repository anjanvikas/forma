import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'
import { ADDON_EMOJI, ADDON_LABEL, ADDON_MACROS, ADDON_ORDER, type AddonKind } from '@/domain/nutrition/value-objects/Addon'

interface Props {
  log: DailyNutritionLog
  onChange: (kind: AddonKind, delta: number) => void
}

export function AddonsCard({ log, onChange }: Props) {
  const countOf = (kind: AddonKind) => log.addons.find(a => a.kind === kind)?.count ?? 0

  return (
    <div className="card space-y-sm">
      <div className="label-caps">Add-ons</div>
      <div className="text-body-sm text-text-tertiary -mt-1">Whey, protein bars — log anytime, any day.</div>
      <div className="space-y-2 pt-1">
        {ADDON_ORDER.map(kind => {
          const count = countOf(kind)
          const macros = ADDON_MACROS[kind]
          return (
            <div
              key={kind}
              className="flex items-center justify-between rounded-card bg-bg-surface border border-border-subtle p-md"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-display font-semibold uppercase tracking-wide text-body-md">
                  {ADDON_EMOJI[kind]} {ADDON_LABEL[kind]}
                </div>
                <div className="font-mono text-mono-sm text-text-tertiary mt-1">
                  P:{macros.protein} · C:{macros.carbs} · F:{macros.fats} · ~{macros.calories} kcal
                </div>
              </div>
              <Stepper count={count} onMinus={() => onChange(kind, -1)} onPlus={() => onChange(kind, 1)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stepper({ count, onMinus, onPlus }: { count: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onMinus}
        disabled={count === 0}
        className="w-9 h-9 rounded-full border border-border-subtle text-text-primary disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform font-mono"
        aria-label="Decrease"
      >
        −
      </button>
      <div className="font-mono text-mono-md w-6 text-center tabular-nums">{count}</div>
      <button
        onClick={onPlus}
        className="w-9 h-9 rounded-full border border-border-subtle text-text-primary active:scale-95 transition-transform font-mono"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}
