import { nutritionRepo } from '../repos'
import { newId } from '@/lib/id'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import { mealsFor } from '@/data'
import { PHASES } from '@/domain/planning/entities/FitnessPhase'
import { breakRepo } from '../repos'
import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'
import type { MealLog } from '@/domain/nutrition/entities/MealLog'
import type { MealSlot, MealStatus, ProteinSwap, MilkSwap } from '@/domain/nutrition/value-objects/MealSlot'
import type { MealDeviationReason } from '@/constants/deviationReasons'

export async function ensureNutritionLog(now: Date = new Date()): Promise<DailyNutritionLog> {
  const date = PhaseCalendar.toISODate(now)
  const existing = await nutritionRepo.findByDate(date)
  if (existing) return existing

  const breaks = await breakRepo.getAll()
  const calendar = new PhaseCalendar(breaks)
  const info = calendar.currentInfo(now)
  const isRestDay = calendar.isRestDay(now)
  const targets = isRestDay ? PHASES[info.phase].restDayMacros : PHASES[info.phase].trainingDayMacros
  const planned = mealsFor(info.phase, isRestDay)

  const id = newId()
  const log: DailyNutritionLog = {
    id,
    date,
    phase: info.phase,
    isRestDay,
    targets,
    mealLogs: planned.map<MealLog>(m => ({
      id: newId(),
      nutritionLogId: id,
      mealSlot: m.slot,
      status: 'PENDING',
      proteinSwap: null,
      milkSwap: null,
      skipReason: null,
      loggedAt: null,
      createdAt: Date.now(),
    })),
    createdAt: Date.now(),
  }
  await nutritionRepo.save(log)
  return log
}

export async function logMeal(
  log: DailyNutritionLog,
  slot: MealSlot,
  status: MealStatus,
  opts: { proteinSwap?: ProteinSwap; milkSwap?: MilkSwap; skipReason?: MealDeviationReason } = {},
): Promise<DailyNutritionLog> {
  const next: DailyNutritionLog = {
    ...log,
    mealLogs: log.mealLogs.map(m => {
      if (m.mealSlot !== slot) return m
      return {
        ...m,
        status,
        proteinSwap: opts.proteinSwap ?? null,
        milkSwap: opts.milkSwap ?? null,
        skipReason: opts.skipReason ?? null,
        loggedAt: new Date().toISOString(),
      }
    }),
  }
  await nutritionRepo.save(next)
  return next
}
