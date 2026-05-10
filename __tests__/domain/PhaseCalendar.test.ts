import { describe, expect, it } from 'vitest'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'

describe('PhaseCalendar', () => {
  it('returns Phase 1 at plan start', () => {
    const cal = new PhaseCalendar([])
    const info = cal.currentInfo(new Date('2026-04-03'))
    expect(info.phase).toBe('PHASE_1')
    expect(info.weekInPhase).toBe(1)
  })

  it('treats Tue/Thu/Sat/Sun as rest days in Phase 1', () => {
    const cal = new PhaseCalendar([])
    const tuesday = new Date('2026-04-07')
    expect(cal.isRestDay(tuesday)).toBe(true)
    const monday = new Date('2026-04-06')
    expect(cal.isRestDay(monday)).toBe(false)
  })

  it('progresses to Phase 2 around month 3', () => {
    const cal = new PhaseCalendar([])
    const info = cal.currentInfo(new Date('2026-06-10'))
    expect(info.phase).toBe('PHASE_2')
  })

  it('flags break mode when an active break exists', () => {
    const cal = new PhaseCalendar([
      { id: 'b1', startDate: '2026-04-15', endDate: null, durationDays: null, reason: null, status: 'ACTIVE', createdAt: 0 },
    ])
    expect(cal.isOnBreak(new Date('2026-04-20'))).toBe(true)
    expect(cal.isRestDay(new Date('2026-04-20'))).toBe(true)
  })

  it('subtracts completed break days from elapsed time', () => {
    const noBreaks = new PhaseCalendar([])
    const withBreak = new PhaseCalendar([
      { id: 'b1', startDate: '2026-04-10', endDate: '2026-04-17', durationDays: 7, reason: null, status: 'COMPLETED', createdAt: 0 },
    ])
    const reference = new Date('2026-05-01')
    expect(withBreak.effectiveDaysElapsed(reference)).toBe(noBreaks.effectiveDaysElapsed(reference) - 7)
  })
})
