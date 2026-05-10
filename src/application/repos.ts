import { WorkoutSessionRepository } from '@/infrastructure/repositories/WorkoutSessionRepository'
import { NutritionLogRepository } from '@/infrastructure/repositories/NutritionLogRepository'
import { HealthRepository } from '@/infrastructure/repositories/HealthRepository'
import { BreakPeriodRepository } from '@/infrastructure/repositories/BreakPeriodRepository'

export const sessionRepo = new WorkoutSessionRepository()
export const nutritionRepo = new NutritionLogRepository()
export const healthRepo = new HealthRepository()
export const breakRepo = new BreakPeriodRepository()
