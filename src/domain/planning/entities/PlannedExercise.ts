import type { MuscleGroup } from '../value-objects/SessionType'

export interface RepRange {
  min: number
  max: number
}

export interface PlannedExercise {
  id: string
  name: string
  sets: number
  reps: RepRange
  isCompound: boolean
  muscleGroup: MuscleGroup
  /** Default starting weight in kg used when no history exists */
  defaultStartingWeightKg: number
  /** Stepper increment in kg for the deviation flow */
  weightStepKg: number
  notes?: string
}
