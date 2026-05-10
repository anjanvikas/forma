import type { WorkoutSession } from '../entities/WorkoutSession'
import type { ExerciseHistoryRow } from '../services/ProgressionCalculator'

export interface IWorkoutSessionRepository {
  save(session: WorkoutSession): Promise<void>
  findById(id: string): Promise<WorkoutSession | null>
  findByDate(date: string): Promise<WorkoutSession | null>
  findRecent(limit: number): Promise<WorkoutSession[]>
  findActiveSession(): Promise<WorkoutSession | null>
  findHistoryForExercise(exerciseId: string, limit?: number): Promise<ExerciseHistoryRow[]>
}
