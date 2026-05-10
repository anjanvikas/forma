import type { BreakPeriod } from '../entities/BreakPeriod'

export interface IBreakPeriodRepository {
  save(b: BreakPeriod): Promise<void>
  update(b: BreakPeriod): Promise<void>
  getActive(): Promise<BreakPeriod | null>
  getAll(): Promise<BreakPeriod[]>
  getTotalBreakDays(): Promise<number>
}
