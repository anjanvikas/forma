import type { PhaseId, SessionType } from '@/domain/planning/value-objects/SessionType'
import type { SessionStatus } from '../value-objects/SetSpec'
import type { ExerciseLog } from './ExerciseLog'

export interface WorkoutSession {
  id: string
  date: string // ISO YYYY-MM-DD
  phase: PhaseId
  weekNumber: number
  sessionType: SessionType
  checkInTime: string | null
  checkOutTime: string | null
  durationMinutes: number | null
  status: SessionStatus
  exerciseLogs: ExerciseLog[]
  createdAt: number
}
