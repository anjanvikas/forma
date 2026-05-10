import type { GymDeviationReason } from '@/constants/deviationReasons'
import type { SetLog } from './SetLog'

export interface ExerciseLog {
  id: string
  sessionId: string
  exerciseId: string
  exerciseName: string
  isCompound: boolean
  displayOrder: number
  setLogs: SetLog[]
  isSkipped: boolean
  skipReason: GymDeviationReason | null
}
