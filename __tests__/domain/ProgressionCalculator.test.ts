import { describe, expect, it } from 'vitest'
import { ProgressionCalculator } from '@/domain/training/services/ProgressionCalculator'
import type { PlannedExercise } from '@/domain/planning/entities/PlannedExercise'
import type { SetLog } from '@/domain/training/entities/SetLog'

const compound: PlannedExercise = {
  id: 'ex_squat',
  name: 'Squat',
  sets: 3,
  reps: { min: 8, max: 10 },
  isCompound: true,
  muscleGroup: 'LEGS',
  defaultStartingWeightKg: 60,
  weightStepKg: 2.5,
}

const isolation: PlannedExercise = { ...compound, id: 'ex_curl', name: 'Curl', isCompound: false, defaultStartingWeightKg: 10 }

function setAt(date: string, weight: number, status: SetLog['status']): SetLog {
  return {
    id: `${date}-${weight}`,
    exerciseLogId: 'ex',
    setNumber: 1,
    planned: { weight, reps: 10 },
    actual: status === 'SKIPPED' ? null : { weight, reps: 10 },
    status,
    deviationReason: null,
    isPositiveDeviation: status === 'POSITIVE',
    createdAt: 0,
  }
}

describe('ProgressionCalculator.computeNextWeight', () => {
  it('returns user starting weight when there is no history', () => {
    const w = ProgressionCalculator.computeNextWeight(compound, [], new Date(), 65)
    expect(w).toBe(65)
  })

  it('keeps the same weight on isolation lifts', () => {
    const history = [{ sessionDate: '2026-04-20', sets: [setAt('2026-04-20', 12, 'AS_PLANNED')] }]
    const w = ProgressionCalculator.computeNextWeight(isolation, history, new Date('2026-04-25'))
    expect(w).toBe(12)
  })

  it('does not increase compound weight if history is under 2 weeks old', () => {
    const history = [
      { sessionDate: '2026-04-20', sets: [setAt('2026-04-20', 60, 'AS_PLANNED')] },
      { sessionDate: '2026-04-22', sets: [setAt('2026-04-22', 60, 'AS_PLANNED')] },
    ]
    const w = ProgressionCalculator.computeNextWeight(compound, history, new Date('2026-04-25'))
    expect(w).toBe(60)
  })

  it('adds 2.5 kg after 2 clean weeks on compound', () => {
    const history = [
      { sessionDate: '2026-04-06', sets: [setAt('2026-04-06', 60, 'AS_PLANNED')] },
      { sessionDate: '2026-04-13', sets: [setAt('2026-04-13', 60, 'AS_PLANNED')] },
      { sessionDate: '2026-04-20', sets: [setAt('2026-04-20', 60, 'AS_PLANNED')] },
    ]
    const w = ProgressionCalculator.computeNextWeight(compound, history, new Date('2026-04-22'))
    expect(w).toBe(62.5)
  })

  it('keeps weight when there is a recent deviation', () => {
    const history = [
      { sessionDate: '2026-04-06', sets: [setAt('2026-04-06', 60, 'AS_PLANNED')] },
      { sessionDate: '2026-04-13', sets: [setAt('2026-04-13', 60, 'DEVIATION')] },
    ]
    const w = ProgressionCalculator.computeNextWeight(compound, history, new Date('2026-04-22'))
    expect(w).toBe(60)
  })

  it('uses positive deviation as new baseline', () => {
    const history = [
      { sessionDate: '2026-04-06', sets: [setAt('2026-04-06', 60, 'AS_PLANNED')] },
      { sessionDate: '2026-04-13', sets: [setAt('2026-04-13', 65, 'POSITIVE')] },
    ]
    const w = ProgressionCalculator.computeNextWeight(compound, history, new Date('2026-04-22'))
    expect(w).toBe(65)
  })
})
