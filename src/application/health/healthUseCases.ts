import { healthRepo, breakRepo } from '../repos'
import { newId } from '@/lib/id'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import { evalSleep } from '@/domain/health/entities/health'
import type { BodyWeightEntry, SleepLog, HairProtocolLog } from '@/domain/health/entities/health'

export async function logBodyWeight(weightKg: number, now: Date = new Date()): Promise<BodyWeightEntry> {
  if (now.getDay() !== 1) {
    throw new Error('Body weight is only logged on Mondays.')
  }
  const breaks = await breakRepo.getAll()
  const cal = new PhaseCalendar(breaks)
  const info = cal.currentInfo(now)
  const entry: BodyWeightEntry = {
    id: newId(),
    date: PhaseCalendar.toISODate(now),
    weightKg,
    phase: info.phase,
    weekNumber: info.weekInPhase,
    createdAt: Date.now(),
  }
  await healthRepo.saveBodyWeight(entry)
  return entry
}

export async function logSleep(bedtime: string, wakeTime: string, now: Date = new Date()): Promise<SleepLog> {
  const evaluation = evalSleep({ bedtime, wakeTime })
  const log: SleepLog = {
    id: newId(),
    date: PhaseCalendar.toISODate(now),
    bedtime,
    wakeTime,
    durationMinutes: evaluation.durationMinutes,
    ruleMetBedtime: evaluation.ruleMetBedtime,
    ruleMetDuration: evaluation.ruleMetDuration,
    createdAt: Date.now(),
  }
  await healthRepo.saveSleepLog(log)
  return log
}

export async function ensureProtocolLog(now: Date = new Date()): Promise<HairProtocolLog> {
  const date = PhaseCalendar.toISODate(now)
  const existing = await healthRepo.findProtocolByDate(date)
  if (existing) return existing
  const dow = now.getDay() // 0 Sun .. 6 Sat
  const isShampooDay = dow === 1 || dow === 3 || dow === 5
  const isSunday = dow === 0
  const log: HairProtocolLog = {
    id: newId(),
    date,
    minoxidilApplied: false,
    supplementsTaken: false,
    ketoShampooUsed: isShampooDay ? false : null,
    dermaRollerUsed: isSunday ? false : null,
    finasterideTaken: null,
    createdAt: Date.now(),
  }
  await healthRepo.saveHairProtocolLog(log)
  return log
}

export async function toggleProtocolItem(log: HairProtocolLog, key: keyof HairProtocolLog): Promise<HairProtocolLog> {
  if (typeof log[key] !== 'boolean') return log
  const next = { ...log, [key]: !log[key] } as HairProtocolLog
  await healthRepo.saveHairProtocolLog(next)
  return next
}
