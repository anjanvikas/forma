import Dexie, { type Table } from 'dexie'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import type { ExerciseLog } from '@/domain/training/entities/ExerciseLog'
import type { SetLog } from '@/domain/training/entities/SetLog'
import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'
import type { MealLog } from '@/domain/nutrition/entities/MealLog'
import type { BodyWeightEntry, SleepLog, HairProtocolLog } from '@/domain/health/entities/health'
import type { BreakPeriod } from '@/domain/breaks/entities/BreakPeriod'

// We persist flattened records — repositories rehydrate aggregates.
export interface WorkoutSessionRecord extends Omit<WorkoutSession, 'exerciseLogs'> {}
export interface ExerciseLogRecord extends Omit<ExerciseLog, 'setLogs'> {}
export type SetLogRecord = SetLog
export interface NutritionLogRecord extends Omit<DailyNutritionLog, 'mealLogs'> {}
export type MealLogRecord = MealLog
export type BodyWeightRecord = BodyWeightEntry
export type SleepLogRecord = SleepLog
export type HairProtocolRecord = HairProtocolLog
export type BreakPeriodRecord = BreakPeriod

class FormaDB extends Dexie {
  workoutSessions!: Table<WorkoutSessionRecord, string>
  exerciseLogs!: Table<ExerciseLogRecord, string>
  setLogs!: Table<SetLogRecord, string>
  nutritionLogs!: Table<NutritionLogRecord, string>
  mealLogs!: Table<MealLogRecord, string>
  bodyWeightEntries!: Table<BodyWeightRecord, string>
  sleepLogs!: Table<SleepLogRecord, string>
  hairProtocolLogs!: Table<HairProtocolRecord, string>
  breakPeriods!: Table<BreakPeriodRecord, string>

  constructor() {
    super('FormaDB')
    this.version(1).stores({
      workoutSessions:   'id, date, phase, status',
      exerciseLogs:      'id, sessionId, exerciseId, displayOrder',
      setLogs:           'id, exerciseLogId, status, deviationReason',
      nutritionLogs:     'id, &date, phase',
      mealLogs:          'id, nutritionLogId, mealSlot',
      bodyWeightEntries: 'id, &date',
      sleepLogs:         'id, &date',
      hairProtocolLogs:  'id, &date',
      breakPeriods:      'id, status, startDate',
    })
  }
}

export const db = new FormaDB()
