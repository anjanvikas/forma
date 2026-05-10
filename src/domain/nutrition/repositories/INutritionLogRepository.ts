import type { DailyNutritionLog } from '../entities/DailyNutritionLog'

export interface INutritionLogRepository {
  save(log: DailyNutritionLog): Promise<void>
  findByDate(date: string): Promise<DailyNutritionLog | null>
  findRange(from: string, to: string): Promise<DailyNutritionLog[]>
}
