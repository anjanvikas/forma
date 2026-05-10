export interface SetSpec {
  weight: number
  reps: number
}

export type SetStatus = 'PENDING' | 'AS_PLANNED' | 'DEVIATION' | 'POSITIVE' | 'SKIPPED'

export type SessionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
