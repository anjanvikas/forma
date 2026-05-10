import type { PhaseId } from '@/domain/planning/value-objects/SessionType'
import type { MacroTargets } from '@/domain/planning/value-objects/MacroTargets'
import type { MealLog } from './MealLog'
import type { AddonLog } from './AddonLog'

export interface DailyNutritionLog {
  id: string
  date: string
  phase: PhaseId
  isRestDay: boolean
  targets: MacroTargets
  mealLogs: MealLog[]
  addons: AddonLog[]
  createdAt: number
}
