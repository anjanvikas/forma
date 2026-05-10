import { useState } from 'react'
import { BottomSheet } from '../shared/BottomSheet'
import { ReasonChip } from '../shared/ReasonChip'
import type { MealLog } from '@/domain/nutrition/entities/MealLog'
import type { PlannedMeal } from '@/domain/nutrition/entities/PlannedMeal'
import { MEAL_REASONS, type MealDeviationReason } from '@/constants/deviationReasons'
import type { MealStatus, ProteinSwap, MilkSwap } from '@/domain/nutrition/value-objects/MealSlot'

interface Props {
  open: boolean
  log: MealLog | null
  planned: PlannedMeal | null
  onClose: () => void
  onConfirm: (status: MealStatus, opts: { proteinSwap?: ProteinSwap; milkSwap?: MilkSwap; skipReason?: MealDeviationReason }) => void
}

export function MealLogSheet({ open, log, planned, onClose, onConfirm }: Props) {
  const [mode, setMode] = useState<'idle' | 'swap' | 'skip'>('idle')
  const [reason, setReason] = useState<MealDeviationReason | null>(null)

  if (!log || !planned) {
    return <BottomSheet open={open} onClose={onClose}>...</BottomSheet>
  }

  const reset = () => {
    setMode('idle')
    setReason(null)
  }

  return (
    <BottomSheet open={open} onClose={() => { reset(); onClose() }} title={planned.slot.replace('_', ' ')}>
      <div className="text-body-md text-text-secondary mb-md">{planned.description}</div>

      {mode === 'idle' && (
        <div className="space-y-sm">
          <button onClick={() => onConfirm('EATEN_AS_PLANNED', {})} className="btn-primary">
            ✓ Ate as planned
          </button>
          {planned.hasProteinSwapOption && (
            <button onClick={() => setMode('swap')} className="btn-secondary">
              Swap protein (Chicken ↔ Paneer)
            </button>
          )}
          {planned.hasMilkSwapOption && (
            <button
              onClick={() => onConfirm('EATEN_WITH_SWAP', { milkSwap: 'WATER' })}
              className="btn-secondary"
            >
              Mix with water
            </button>
          )}
          <button onClick={() => setMode('skip')} className="btn-secondary !text-status-deviation">
            Skipped
          </button>
        </div>
      )}

      {mode === 'swap' && (
        <div className="space-y-sm">
          <button onClick={() => onConfirm('EATEN_WITH_SWAP', { proteinSwap: 'CHICKEN' })} className="btn-secondary">
            Stayed with Chicken
          </button>
          <button onClick={() => onConfirm('EATEN_WITH_SWAP', { proteinSwap: 'PANEER' })} className="btn-primary">
            Swapped to Paneer
          </button>
          <button onClick={reset} className="text-text-secondary text-body-sm w-full text-center mt-2">
            Cancel
          </button>
        </div>
      )}

      {mode === 'skip' && (
        <div>
          <div className="label-caps mb-2">Reason</div>
          <div className="flex flex-wrap gap-2 mb-lg">
            {(Object.entries(MEAL_REASONS) as [MealDeviationReason, typeof MEAL_REASONS[MealDeviationReason]][]).map(
              ([key, info]) => (
                <ReasonChip
                  key={key}
                  emoji={info.emoji}
                  label={info.label}
                  selected={reason === key}
                  onClick={() => setReason(key)}
                />
              ),
            )}
          </div>
          <button
            disabled={!reason}
            onClick={() => reason && onConfirm('SKIPPED', { skipReason: reason })}
            className="btn-primary"
          >
            Confirm skip
          </button>
          <button onClick={reset} className="text-text-secondary text-body-sm w-full text-center mt-2">
            Cancel
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
