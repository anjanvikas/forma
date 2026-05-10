import { useEffect, useState } from 'react'
import { BottomSheet } from '../shared/BottomSheet'
import { ReasonChip } from '../shared/ReasonChip'
import { GYM_REASONS, type GymDeviationReason } from '@/constants/deviationReasons'

interface Props {
  open: boolean
  exerciseName: string
  totalSets: number
  onClose: () => void
  onSkip: (reason: GymDeviationReason) => void
}

export function SkipExerciseSheet({ open, exerciseName, totalSets, onClose, onSkip }: Props) {
  const [reason, setReason] = useState<GymDeviationReason | null>(null)
  useEffect(() => {
    if (open) setReason(null)
  }, [open])

  return (
    <BottomSheet open={open} onClose={onClose} title="Skip exercise">
      <div className="text-body-sm text-text-secondary mb-md">
        Skip all {totalSets} sets of {exerciseName}?
      </div>
      <div className="label-caps mb-2">Reason</div>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(GYM_REASONS) as [GymDeviationReason, typeof GYM_REASONS[GymDeviationReason]][])
          .filter(([k]) => k !== 'WENT_HEAVIER')
          .map(([key, info]) => (
            <ReasonChip
              key={key}
              emoji={info.emoji}
              label={info.label}
              selected={reason === key}
              onClick={() => setReason(key)}
            />
          ))}
      </div>
      <button
        disabled={!reason}
        onClick={() => reason && onSkip(reason)}
        className="btn-primary mt-lg"
      >
        Skip exercise
      </button>
    </BottomSheet>
  )
}
