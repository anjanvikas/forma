import type { SetSpec, SetStatus } from '../value-objects/SetSpec'
import type { GymDeviationReason } from '@/constants/deviationReasons'

export interface SetLog {
  id: string
  exerciseLogId: string
  setNumber: number
  planned: SetSpec
  actual: SetSpec | null
  status: SetStatus
  deviationReason: GymDeviationReason | null
  isPositiveDeviation: boolean
  createdAt: number
}
