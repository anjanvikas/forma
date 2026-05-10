import { nutritionRepo } from '../repos'
import { newId } from '@/lib/id'
import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'
import type { AddonLog } from '@/domain/nutrition/entities/AddonLog'
import type { AddonKind } from '@/domain/nutrition/value-objects/Addon'

export async function setAddonCount(
  log: DailyNutritionLog,
  kind: AddonKind,
  count: number,
): Promise<DailyNutritionLog> {
  const safe = Math.max(0, Math.floor(count))
  const existing = log.addons.find(a => a.kind === kind)
  const now = Date.now()

  let nextAddons: AddonLog[]
  if (safe === 0) {
    nextAddons = log.addons.filter(a => a.kind !== kind)
  } else if (existing) {
    nextAddons = log.addons.map(a =>
      a.kind === kind ? { ...a, count: safe, updatedAt: now } : a,
    )
  } else {
    nextAddons = [
      ...log.addons,
      {
        id: newId(),
        nutritionLogId: log.id,
        kind,
        count: safe,
        createdAt: now,
        updatedAt: now,
      },
    ]
  }

  const next: DailyNutritionLog = { ...log, addons: nextAddons }
  await nutritionRepo.save(next)
  return next
}

export async function incrementAddon(
  log: DailyNutritionLog,
  kind: AddonKind,
  delta: number,
): Promise<DailyNutritionLog> {
  const current = log.addons.find(a => a.kind === kind)?.count ?? 0
  return setAddonCount(log, kind, current + delta)
}
