import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { SetLog } from '../entities/SetLog'
import type { PlannedExercise } from '@/domain/planning/entities/PlannedExercise'

/**
 * History rows for a single exercise across recent sessions.
 * Each row has a date (session date) and the SetLogs of that session for this exercise.
 */
export interface ExerciseHistoryRow {
  sessionDate: string // ISO date
  sets: SetLog[]
}

export class ProgressionCalculator {
  /**
   * Compute the planned weight for the next session for one exercise.
   *
   * Rules:
   * 1. No history → return user-configured starting weight (or default).
   * 2. Isolation lifts → keep last session's weight.
   * 3. Compound lifts:
   *    a. Any deviation/skipped set in the last 2 weeks → keep weight.
   *    b. Any positive deviation (went heavier) in last 2 weeks → use highest actual weight as new baseline.
   *    c. Clean ≥ 2 weeks → +2.5 kg.
   */
  static computeNextWeight(
    exercise: PlannedExercise,
    history: ExerciseHistoryRow[],
    today: Date = new Date(),
    userStartingWeight?: number,
  ): number {
    if (history.length === 0) {
      return userStartingWeight ?? exercise.defaultStartingWeightKg
    }

    const sorted = [...history].sort(
      (a, b) => parseISO(b.sessionDate).getTime() - parseISO(a.sessionDate).getTime(),
    )

    const lastSession = sorted[0]
    const lastWeight = lastSession.sets[0]?.planned.weight ?? exercise.defaultStartingWeightKg

    if (!exercise.isCompound) {
      return lastWeight
    }

    const inLastTwoWeeks = sorted.filter(
      r => differenceInCalendarDays(today, parseISO(r.sessionDate)) <= 14,
    )

    const allRecentSets = inLastTwoWeeks.flatMap(r => r.sets)

    const hadDeviation = allRecentSets.some(
      s => s.status === 'DEVIATION' || s.status === 'SKIPPED',
    )
    if (hadDeviation) return lastWeight

    const positiveSets = allRecentSets.filter(s => s.status === 'POSITIVE')
    if (positiveSets.length > 0) {
      const maxActual = Math.max(...positiveSets.map(s => s.actual?.weight ?? lastWeight))
      return Math.max(maxActual, lastWeight)
    }

    // Need at least 2 weeks of clean training before incrementing.
    const earliest = parseISO(sorted[sorted.length - 1].sessionDate)
    const span = differenceInCalendarDays(today, earliest)
    if (span < 14) return lastWeight

    return lastWeight + 2.5
  }

  static classifyActual(planned: { weight: number; reps: number }, actual: { weight: number; reps: number }): 'AS_PLANNED' | 'DEVIATION' | 'POSITIVE' {
    if (actual.weight > planned.weight) return 'POSITIVE'
    if (actual.weight < planned.weight) return 'DEVIATION'
    if (actual.reps < planned.reps) return 'DEVIATION'
    if (actual.reps > planned.reps) return 'POSITIVE'
    return 'AS_PLANNED'
  }
}
