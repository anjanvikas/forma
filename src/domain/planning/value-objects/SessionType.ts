export type PhaseId = 'PHASE_1' | 'PHASE_2' | 'PHASE_3'

export type TrainingSplit = 'FULL_BODY' | 'PPL'

export type SessionType =
  | 'FULL_BODY'
  | 'PUSH_1'
  | 'PUSH_2'
  | 'PULL_1'
  | 'PULL_2'
  | 'LEGS_1'
  | 'LEGS_2'
  | 'REST'

export type DayOfWeek = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'

export const DAY_INDEX: Record<DayOfWeek, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

export function dayOfWeekFromDate(date: Date): DayOfWeek {
  const map: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return map[date.getDay()]
}

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'LEGS'
  | 'SHOULDERS'
  | 'ARMS'
  | 'CORE'
  | 'FULL_BODY'
