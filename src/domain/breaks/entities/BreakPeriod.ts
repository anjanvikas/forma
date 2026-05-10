import type { BreakReason } from '@/constants/deviationReasons'

export type BreakStatus = 'ACTIVE' | 'COMPLETED'

export interface BreakPeriod {
  id: string
  startDate: string // ISO date YYYY-MM-DD
  endDate: string | null
  durationDays: number | null
  reason: BreakReason | null
  status: BreakStatus
  createdAt: number
}
