import { useEffect, useState } from 'react'
import { BottomSheet } from '../shared/BottomSheet'
import { Stepper } from '../shared/Stepper'
import { ReasonChip } from '../shared/ReasonChip'
import { GYM_REASONS, type GymDeviationReason } from '@/constants/deviationReasons'
import type { PlannedExercise } from '@/domain/planning/entities/PlannedExercise'

interface Props {
  open: boolean
  exerciseName: string
  setNumber: number
  exercise: PlannedExercise | null
  plannedWeight: number
  plannedReps: number
  onClose: () => void
  onConfirm: (weight: number, reps: number, reason: GymDeviationReason) => void
}

export function DeviationSheet({
  open, exerciseName, setNumber, exercise, plannedWeight, plannedReps, onClose, onConfirm,
}: Props) {
  const [weight, setWeight] = useState(plannedWeight)
  const [reps, setReps] = useState(plannedReps)
  const [reason, setReason] = useState<GymDeviationReason | null>(null)

  useEffect(() => {
    if (open) {
      setWeight(plannedWeight)
      setReps(plannedReps)
      setReason(null)
    }
  }, [open, plannedWeight, plannedReps])

  const weightStep = exercise?.weightStepKg ?? 2.5
  const isWentHeavier = reason === 'WENT_HEAVIER'

  return (
    <BottomSheet open={open} onClose={onClose} title={`Set ${setNumber} — ${exerciseName}`}>
      <div className="text-body-sm text-text-secondary mb-md">
        Planned: {fmt(plannedWeight)} kg × {plannedReps} reps
      </div>

      <div className="space-y-md">
        <div>
          <div className="label-caps mb-2">Actual weight</div>
          <Stepper value={weight} step={weightStep} onChange={setWeight} unit="kg" />
        </div>
        <div>
          <div className="label-caps mb-2">Actual reps</div>
          <Stepper value={reps} step={1} onChange={setReps} decimals={0} />
        </div>
        <div>
          <div className="label-caps mb-2">Reason</div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(GYM_REASONS) as [GymDeviationReason, typeof GYM_REASONS[GymDeviationReason]][]).map(
              ([key, info]) => (
                <ReasonChip
                  key={key}
                  emoji={info.emoji}
                  label={info.label}
                  selected={reason === key}
                  positive={info.positive}
                  onClick={() => setReason(key)}
                />
              ),
            )}
          </div>
        </div>

        <button
          disabled={!reason}
          onClick={() => reason && onConfirm(weight, reps, reason)}
          className={`btn-primary mt-lg ${isWentHeavier ? '!bg-status-positive' : ''}`}
        >
          Confirm
        </button>
      </div>
    </BottomSheet>
  )
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
