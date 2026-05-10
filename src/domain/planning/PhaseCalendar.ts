import { differenceInCalendarDays, addDays, parseISO, min as minDate } from 'date-fns'
import { PLAN_START_DATE, PLAN_DURATION_MONTHS, DAYS_PER_MONTH } from '@/constants/plan'
import { PHASES } from './entities/FitnessPhase'
import { dayOfWeekFromDate } from './value-objects/SessionType'
import type { PhaseId, SessionType, DayOfWeek } from './value-objects/SessionType'
import type { BreakPeriod } from '@/domain/breaks/entities/BreakPeriod'

export interface PhaseInfo {
  phase: PhaseId
  monthInPlan: number     // 1..15
  weekInPhase: number     // 1..N
  weekInPlan: number      // 1..~65
  dayInPhase: number      // 1..N
}

export class PhaseCalendar {
  constructor(private readonly breaks: BreakPeriod[] = []) {}

  static toISODate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  isOnBreak(asOf: Date = new Date()): boolean {
    return this.activeBreak(asOf) !== null
  }

  activeBreak(_asOf: Date = new Date()): BreakPeriod | null {
    return this.breaks.find(b => b.status === 'ACTIVE') ?? null
  }

  /** Sum of completed-break days that are strictly before `date`. Active breaks count up to date. */
  totalBreakDaysBefore(date: Date): number {
    let total = 0
    for (const b of this.breaks) {
      const start = parseISO(b.startDate)
      if (start >= date) continue
      const end = b.endDate ? parseISO(b.endDate) : date
      const cappedEnd = minDate([end, date])
      const days = Math.max(0, differenceInCalendarDays(cappedEnd, start))
      total += days
    }
    return total
  }

  effectiveDaysElapsed(asOf: Date = new Date()): number {
    const raw = differenceInCalendarDays(asOf, PLAN_START_DATE)
    return Math.max(0, raw - this.totalBreakDaysBefore(asOf))
  }

  currentInfo(asOf: Date = new Date()): PhaseInfo {
    const referenceDate = this.isOnBreak(asOf)
      ? parseISO(this.activeBreak(asOf)!.startDate)
      : asOf

    const days = this.effectiveDaysElapsed(referenceDate)
    const monthInPlan = Math.min(PLAN_DURATION_MONTHS, Math.floor(days / DAYS_PER_MONTH) + 1)
    const weekInPlan = Math.floor(days / 7) + 1

    let phase: PhaseId
    if (monthInPlan <= 2) phase = 'PHASE_1'
    else if (monthInPlan <= 10) phase = 'PHASE_2'
    else phase = 'PHASE_3'

    // Compute weekInPhase
    const phaseStartMonth =
      phase === 'PHASE_1' ? 1 : phase === 'PHASE_2' ? 3 : 11
    const phaseStartDays = (phaseStartMonth - 1) * DAYS_PER_MONTH
    const dayInPhase = Math.max(1, days - phaseStartDays + 1)
    const weekInPhase = Math.floor((dayInPhase - 1) / 7) + 1

    return { phase, monthInPlan, weekInPhase, weekInPlan, dayInPhase }
  }

  currentPhase(asOf: Date = new Date()): PhaseId {
    return this.currentInfo(asOf).phase
  }

  isRestDay(date: Date = new Date()): boolean {
    if (this.isOnBreak(date)) return true
    const phase = this.currentPhase(date)
    const dow = dayOfWeekFromDate(date)
    const trainingDays = PHASES[phase].trainingDays
    return !trainingDays.includes(dow)
  }

  sessionType(date: Date = new Date()): SessionType {
    if (this.isRestDay(date)) return 'REST'
    const phase = this.currentPhase(date)
    const dow = dayOfWeekFromDate(date)
    return PhaseCalendar.sessionTypeFor(phase, dow)
  }

  static sessionTypeFor(phase: PhaseId, dow: DayOfWeek): SessionType {
    if (phase === 'PHASE_1') {
      // Mon/Wed/Fri all FULL_BODY
      if (dow === 'MON' || dow === 'WED' || dow === 'FRI') return 'FULL_BODY'
      return 'REST'
    }
    // PPL phases (2 and 3): Mon Push1, Tue Pull1, Wed Legs1, Thu Push2, Fri Pull2, Sat Legs2, Sun rest
    switch (dow) {
      case 'MON': return 'PUSH_1'
      case 'TUE': return 'PULL_1'
      case 'WED': return 'LEGS_1'
      case 'THU': return 'PUSH_2'
      case 'FRI': return 'PULL_2'
      case 'SAT': return 'LEGS_2'
      default:    return 'REST'
    }
  }

  projectedEndDate(): Date {
    const totalBreakDays = this.breaks.reduce((sum, b) => {
      if (!b.endDate) return sum
      return sum + (b.durationDays ?? 0)
    }, 0)
    return addDays(PLAN_START_DATE, PLAN_DURATION_MONTHS * DAYS_PER_MONTH + totalBreakDays)
  }
}
