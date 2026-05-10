import type { PhaseId } from '@/domain/planning/value-objects/SessionType'
import type { MacroTargets } from '@/domain/planning/value-objects/MacroTargets'
import type { MealLog } from './MealLog'

export interface DailyNutritionLog {
  id: string
  date: string
  phase: PhaseId
  isRestDay: boolean
  targets: MacroTargets
  mealLogs: MealLog[]
  createdAt: number
}
