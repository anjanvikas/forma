import { db } from '../db/database'
import type { INutritionLogRepository } from '@/domain/nutrition/repositories/INutritionLogRepository'
import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'

export class NutritionLogRepository implements INutritionLogRepository {
  async save(log: DailyNutritionLog): Promise<void> {
    await db.transaction('rw', [db.nutritionLogs, db.mealLogs, db.addonLogs], async () => {
      const { mealLogs, addons, ...record } = log
      await db.nutritionLogs.put(record)

      const existingMeals = await db.mealLogs.where('nutritionLogId').equals(log.id).toArray()
      const mealIds = new Set(mealLogs.map(m => m.id))
      const staleMeals = existingMeals.filter(m => !mealIds.has(m.id)).map(m => m.id)
      if (staleMeals.length > 0) await db.mealLogs.bulkDelete(staleMeals)
      await db.mealLogs.bulkPut(mealLogs)

      const existingAddons = await db.addonLogs.where('nutritionLogId').equals(log.id).toArray()
      const addonIds = new Set(addons.map(a => a.id))
      const staleAddons = existingAddons.filter(a => !addonIds.has(a.id)).map(a => a.id)
      if (staleAddons.length > 0) await db.addonLogs.bulkDelete(staleAddons)
      if (addons.length > 0) await db.addonLogs.bulkPut(addons)
    })
  }

  async findByDate(date: string): Promise<DailyNutritionLog | null> {
    const record = await db.nutritionLogs.where('date').equals(date).first()
    if (!record) return null
    const mealLogs = await db.mealLogs.where('nutritionLogId').equals(record.id).toArray()
    const addons = await db.addonLogs.where('nutritionLogId').equals(record.id).toArray()
    return { ...record, mealLogs, addons }
  }

  async findRange(from: string, to: string): Promise<DailyNutritionLog[]> {
    const records = await db.nutritionLogs.where('date').between(from, to, true, true).toArray()
    const out: DailyNutritionLog[] = []
    for (const r of records) {
      const mealLogs = await db.mealLogs.where('nutritionLogId').equals(r.id).toArray()
      const addons = await db.addonLogs.where('nutritionLogId').equals(r.id).toArray()
      out.push({ ...r, mealLogs, addons })
    }
    return out
  }
}
