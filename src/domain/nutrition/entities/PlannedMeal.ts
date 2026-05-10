import type { MacroTargets } from '@/domain/planning/value-objects/MacroTargets'
import type { PhaseId } from '@/domain/planning/value-objects/SessionType'
import type { MealSlot } from '../value-objects/MealSlot'

export interface PlannedMeal {
  slot: MealSlot
  phase: PhaseId
  isRestDay: boolean
  description: string
  macros: MacroTargets
  hasProteinSwapOption: boolean
  hasMilkSwapOption: boolean
}
