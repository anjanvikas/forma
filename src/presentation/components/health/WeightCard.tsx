import { useEffect, useState } from 'react'
import { BottomSheet } from '../shared/BottomSheet'
import { Stepper } from '../shared/Stepper'
import { logBodyWeight } from '@/application/health/healthUseCases'
import { healthRepo } from '@/application/repos'
import type { BodyWeightEntry } from '@/domain/health/entities/health'

export function WeightCard() {
  const [latest, setLatest] = useState<BodyWeightEntry | null>(null)
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState(80)

  useEffect(() => {
    healthRepo.findLatestBodyWeight().then(e => {
      if (e) {
        setLatest(e)
        setWeight(e.weightKg)
      } else {
        setWeight(80)
      }
    })
  }, [])

  const isMonday = new Date().getDay() === 1

  const onSave = async () => {
    if (!isMonday) return
    const entry = await logBodyWeight(weight)
    setLatest(entry)
    setOpen(false)
  }

  if (!isMonday && !latest) return null

  return (
    <>
      <button
        onClick={() => isMonday && setOpen(true)}
        className={`w-full text-left card relative overflow-hidden ${isMonday ? 'border-accent/40' : ''}`}
      >
        <div className="label-caps">⚖️ Body weight</div>
        {latest ? (
          <div className="mt-1">
            <span className="font-mono text-mono-lg">{latest.weightKg.toFixed(1)} kg</span>
            <span className="ml-2 text-body-sm text-text-secondary">last logged {latest.date}</span>
          </div>
        ) : (
          <div className="mt-1 text-body-md">Log this week's weight →</div>
        )}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Log weight">
        <Stepper value={weight} step={0.1} onChange={setWeight} unit="kg" />
        <button onClick={onSave} className="btn-primary mt-lg">Log weight</button>
      </BottomSheet>
    </>
  )
}
