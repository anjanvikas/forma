import type { PlannedExercise } from './PlannedExercise'
import type { DayOfWeek, PhaseId, SessionType } from '../value-objects/SessionType'

export interface DayPlan {
  phase: PhaseId
  dayOfWeek: DayOfWeek
  sessionType: SessionType
  isVariation: boolean
  exercises: PlannedExercise[]
  isRestDay: boolean
}
