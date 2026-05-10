import { db } from '../db/database'
import type { INutritionLogRepository } from '@/domain/nutrition/repositories/INutritionLogRepository'
import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'

export class NutritionLogRepository implements INutritionLogRepository {
  async save(log: DailyNutritionLog): Promise<void> {
    await db.transaction('rw', [db.nutritionLogs, db.mealLogs], async () => {
      const { mealLogs, ...record } = log
      await db.nutritionLogs.put(record)
      const existing = await db.mealLogs.where('nutritionLogId').equals(log.id).toArray()
      const ids = new Set(mealLogs.map(m => m.id))
      const stale = existing.filter(m => !ids.has(m.id)).map(m => m.id)
      if (stale.length > 0) await db.mealLogs.bulkDelete(stale)
      await db.mealLogs.bulkPut(mealLogs)
    })
  }

  async findByDate(date: string): Promise<DailyNutritionLog | null> {
    const record = await db.nutritionLogs.where('date').equals(date).first()
    if (!record) return null
    const mealLogs = await db.mealLogs.where('nutritionLogId').equals(record.id).toArray()
    return { ...record, mealLogs }
  }

  async findRange(from: string, to: string): Promise<DailyNutritionLog[]> {
    const records = await db.nutritionLogs.where('date').between(from, to, true, true).toArray()
    const out: DailyNutritionLog[] = []
    for (const r of records) {
      const mealLogs = await db.mealLogs.where('nutritionLogId').equals(r.id).toArray()
      out.push({ ...r, mealLogs })
    }
    return out
  }
}
