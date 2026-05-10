import type { PhaseId, SessionType } from '@/domain/planning/value-objects/SessionType'
import type { PlannedExercise } from '@/domain/planning/entities/PlannedExercise'
import type { PlannedMeal } from '@/domain/nutrition/entities/PlannedMeal'
import type { MealSlot } from '@/domain/nutrition/value-objects/MealSlot'

import { PHASE_1_FULL_BODY } from './phase1/exercises'
import { PHASE_2_BY_SESSION } from './phase2/exercises'
import { PHASE_3_BY_SESSION } from './phase3/exercises'

import { PHASE_1_MEALS } from './phase1/meals'
import { PHASE_2_MEALS } from './phase2/meals'
import { PHASE_3_MEALS } from './phase3/meals'

export function exercisesFor(phase: PhaseId, session: SessionType): PlannedExercise[] {
  if (session === 'REST') return []
  if (phase === 'PHASE_1') return PHASE_1_FULL_BODY
  if (phase === 'PHASE_2') return PHASE_2_BY_SESSION[session] ?? []
  return PHASE_3_BY_SESSION[session] ?? []
}

export function mealsFor(phase: PhaseId, isRestDay: boolean): PlannedMeal[] {
  const set =
    phase === 'PHASE_1' ? PHASE_1_MEALS :
    phase === 'PHASE_2' ? PHASE_2_MEALS : PHASE_3_MEALS
  const slotMap = isRestDay ? set.REST : set.TRAINING
  return Object.values(slotMap).filter(Boolean) as PlannedMeal[]
}

export function lookupExercise(id: string): PlannedExercise | null {
  for (const list of [
    PHASE_1_FULL_BODY,
    ...Object.values(PHASE_2_BY_SESSION),
    ...Object.values(PHASE_3_BY_SESSION),
  ]) {
    if (!list) continue
    const found = list.find(e => e.id === id)
    if (found) return found
  }
  return null
}

export function lookupMeal(phase: PhaseId, slot: MealSlot, isRestDay: boolean): PlannedMeal | null {
  const set =
    phase === 'PHASE_1' ? PHASE_1_MEALS :
    phase === 'PHASE_2' ? PHASE_2_MEALS : PHASE_3_MEALS
  const slotMap = isRestDay ? set.REST : set.TRAINING
  return slotMap[slot] ?? null
}
