import type { MealSlot, MealStatus, ProteinSwap, MilkSwap } from '../value-objects/MealSlot'
import type { MealDeviationReason } from '@/constants/deviationReasons'

export interface MealLog {
  id: string
  nutritionLogId: string
  mealSlot: MealSlot
  status: MealStatus
  proteinSwap: ProteinSwap | null
  milkSwap: MilkSwap | null
  skipReason: MealDeviationReason | null
  loggedAt: string | null
  createdAt: number
}
