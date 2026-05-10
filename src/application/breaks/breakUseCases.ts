import { differenceInCalendarDays, parseISO } from 'date-fns'
import { breakRepo, sessionRepo } from '../repos'
import { newId } from '@/lib/id'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import type { BreakPeriod } from '@/domain/breaks/entities/BreakPeriod'
import type { BreakReason } from '@/constants/deviationReasons'

export async function startBreak(reason: BreakReason | null, now: Date = new Date()): Promise<BreakPeriod> {
  const active = await breakRepo.getActive()
  if (active) throw new Error('A break is already active.')
  const inProgress = await sessionRepo.findActiveSession()
  if (inProgress) throw new Error('Finish the active session before pausing.')

  const period: BreakPeriod = {
    id: newId(),
    startDate: PhaseCalendar.toISODate(now),
    endDate: null,
    durationDays: null,
    reason,
    status: 'ACTIVE',
    createdAt: Date.now(),
  }
  await breakRepo.save(period)
  return period
}

export interface ResumeResult {
  break: BreakPeriod
  durationDays: number
  showWeightAdvisory: boolean
}

export async function resumeBreak(now: Date = new Date()): Promise<ResumeResult> {
  const active = await breakRepo.getActive()
  if (!active) throw new Error('No active break to resume.')
  const days = Math.max(1, differenceInCalendarDays(now, parseISO(active.startDate)))
  const updated: BreakPeriod = {
    ...active,
    endDate: PhaseCalendar.toISODate(now),
    durationDays: days,
    status: 'COMPLETED',
  }
  await breakRepo.update(updated)
  return { break: updated, durationDays: days, showWeightAdvisory: days > 14 }
}
