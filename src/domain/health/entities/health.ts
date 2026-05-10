import type { PhaseId } from '@/domain/planning/value-objects/SessionType'

export interface BodyWeightEntry {
  id: string
  date: string // always Monday
  weightKg: number
  phase: PhaseId
  weekNumber: number
  createdAt: number
}

export interface SleepLog {
  id: string
  date: string
  bedtime: string  // HH:MM
  wakeTime: string // HH:MM
  durationMinutes: number
  ruleMetBedtime: boolean
  ruleMetDuration: boolean
  createdAt: number
}

export interface HairProtocolLog {
  id: string
  date: string
  minoxidilApplied: boolean
  supplementsTaken: boolean
  ketoShampooUsed: boolean | null
  dermaRollerUsed: boolean | null
  finasterideTaken: boolean | null
  createdAt: number
}

export interface SleepEvalInput {
  bedtime: string
  wakeTime: string
}

export function evalSleep(input: SleepEvalInput): {
  durationMinutes: number
  ruleMetBedtime: boolean
  ruleMetDuration: boolean
} {
  const [bH, bM] = input.bedtime.split(':').map(Number)
  const [wH, wM] = input.wakeTime.split(':').map(Number)
  let bMin = bH * 60 + bM
  const wMin = wH * 60 + wM
  // If bedtime is after wake time numerically → bedtime was previous evening
  if (bMin > wMin) bMin -= 24 * 60
  const durationMinutes = wMin - bMin
  // Rule: bedtime by 9:30 PM (21:30 → 1290 min)
  // Bedtime might already be normalised negative (previous day). Convert to evening minute.
  const eveningMin = bMin < 0 ? bMin + 24 * 60 : bMin
  const ruleMetBedtime = eveningMin <= 21 * 60 + 30
  const ruleMetDuration = durationMinutes >= 7 * 60 + 30
  return { durationMinutes, ruleMetBedtime, ruleMetDuration }
}
