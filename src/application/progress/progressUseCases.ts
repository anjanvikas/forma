import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { sessionRepo, nutritionRepo, healthRepo, breakRepo } from '../repos'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import type { GymDeviationReason } from '@/constants/deviationReasons'

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  sessionsCompleted: number
  sessionsPlanned: number
  setsAsPlannedPct: number
  topReason: GymDeviationReason | null
  mealsLoggedPct: number
  avgProtein: number
  avgCalories: number
  protocolCompliancePct: number
  avgSleepMinutes: number
  bodyWeight: number | null
  onBreak: boolean
}

export async function getWeekSummary(weekOf: Date = new Date()): Promise<WeekSummary> {
  const start = startOfWeek(weekOf, { weekStartsOn: 1 }) // Monday
  const end = addDays(start, 6)
  const startISO = format(start, 'yyyy-MM-dd')
  const endISO = format(end, 'yyyy-MM-dd')

  const breaks = await breakRepo.getAll()
  const calendar = new PhaseCalendar(breaks)
  const phase = calendar.currentPhase(weekOf)

  // Sessions
  const recent = await sessionRepo.findRecent(50)
  const inWeek = recent.filter(s => s.date >= startISO && s.date <= endISO)
  const completed = inWeek.filter(s => s.status === 'COMPLETED')
  const sessionsPlanned = phase === 'PHASE_1' ? 3 : 6

  const allSets = completed.flatMap(s => s.exerciseLogs.flatMap(e => e.setLogs))
  const totalSets = allSets.length
  const asPlanned = allSets.filter(s => s.status === 'AS_PLANNED' || s.status === 'POSITIVE').length
  const setsAsPlannedPct = totalSets === 0 ? 0 : Math.round((asPlanned / totalSets) * 100)

  const reasonCounts = new Map<GymDeviationReason, number>()
  for (const s of allSets) {
    if (s.deviationReason) reasonCounts.set(s.deviationReason, (reasonCounts.get(s.deviationReason) ?? 0) + 1)
  }
  const topReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // Nutrition
  const logs = await nutritionRepo.findRange(startISO, endISO)
  const totalMeals = logs.reduce((n, l) => n + l.mealLogs.length, 0)
  const loggedMeals = logs.reduce(
    (n, l) => n + l.mealLogs.filter(m => m.status !== 'PENDING').length,
    0,
  )
  const mealsLoggedPct = totalMeals === 0 ? 0 : Math.round((loggedMeals / totalMeals) * 100)
  const avgProtein = logs.length === 0 ? 0 : Math.round(
    logs.reduce((sum, l) => sum + l.targets.protein, 0) / logs.length,
  )
  const avgCalories = logs.length === 0 ? 0 : Math.round(
    logs.reduce((sum, l) => sum + l.targets.calories, 0) / logs.length,
  )

  // Health
  const sleeps = await healthRepo.findSleepRange(startISO, endISO)
  const avgSleepMinutes = sleeps.length === 0 ? 0 : Math.round(
    sleeps.reduce((s, x) => s + x.durationMinutes, 0) / sleeps.length,
  )

  const protocols = await healthRepo.findProtocolRange(startISO, endISO)
  const protocolDays = protocols.length
  const protocolDaysCompliant = protocols.filter(p => p.minoxidilApplied && p.supplementsTaken).length
  const protocolCompliancePct = protocolDays === 0 ? 0 : Math.round((protocolDaysCompliant / protocolDays) * 100)

  const bodyWeights = await healthRepo.findBodyWeights(50)
  const monday = bodyWeights.find(b => b.date >= startISO && b.date <= endISO)?.weightKg ?? null

  return {
    weekStart: startISO,
    weekEnd: endISO,
    sessionsCompleted: completed.length,
    sessionsPlanned,
    setsAsPlannedPct,
    topReason,
    mealsLoggedPct,
    avgProtein,
    avgCalories,
    protocolCompliancePct,
    avgSleepMinutes,
    bodyWeight: monday,
    onBreak: calendar.isOnBreak(weekOf),
  }
}

export interface CompoundLiftSeries {
  exerciseId: string
  exerciseName: string
  points: { date: string; weightKg: number }[]
}

export async function getCompoundProgression(): Promise<CompoundLiftSeries[]> {
  const sessions = await sessionRepo.findRecent(60)
  const map = new Map<string, CompoundLiftSeries>()
  for (const s of sessions) {
    if (s.status !== 'COMPLETED') continue
    for (const ex of s.exerciseLogs) {
      if (!ex.isCompound) continue
      const series = map.get(ex.exerciseId) ?? { exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, points: [] }
      const peak = ex.setLogs.reduce((max, set) => {
        const w = set.actual?.weight ?? set.planned.weight
        return Math.max(max, set.status === 'SKIPPED' ? 0 : w)
      }, 0)
      if (peak > 0) series.points.push({ date: s.date, weightKg: peak })
      map.set(ex.exerciseId, series)
    }
  }
  for (const series of map.values()) {
    series.points.sort((a, b) => a.date.localeCompare(b.date))
  }
  return [...map.values()]
}

export async function getBodyWeightSeries(): Promise<{ date: string; weightKg: number }[]> {
  const entries = await healthRepo.findBodyWeights(60)
  return entries
    .map(e => ({ date: e.date, weightKg: e.weightKg }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getDeviationBreakdown(): Promise<{ reason: GymDeviationReason; count: number; pct: number }[]> {
  const sessions = await sessionRepo.findRecent(60)
  const counts = new Map<GymDeviationReason, number>()
  let total = 0
  for (const s of sessions) {
    for (const ex of s.exerciseLogs) {
      for (const set of ex.setLogs) {
        if (set.deviationReason) {
          counts.set(set.deviationReason, (counts.get(set.deviationReason) ?? 0) + 1)
          total++
        }
      }
    }
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count, pct: total === 0 ? 0 : Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
}

export { format as fmtDate }
