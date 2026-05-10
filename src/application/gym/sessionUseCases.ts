import { sessionRepo } from '../repos'
import { newId } from '@/lib/id'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import { exercisesFor, lookupExercise } from '@/data'
import { ProgressionCalculator } from '@/domain/training/services/ProgressionCalculator'
import { SettingsStorage } from '@/infrastructure/storage/SettingsStorage'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import type { ExerciseLog } from '@/domain/training/entities/ExerciseLog'
import type { SetLog } from '@/domain/training/entities/SetLog'
import type { GymDeviationReason } from '@/constants/deviationReasons'
import type { SessionType } from '@/domain/planning/value-objects/SessionType'
import { breakRepo } from '../repos'

export interface CheckInResult {
  session: WorkoutSession
  alreadyExisted: boolean
}

export interface CheckInOptions {
  sessionTypeOverride?: Exclude<SessionType, 'REST'>
}

export async function checkIn(now: Date = new Date(), opts: CheckInOptions = {}): Promise<CheckInResult> {
  const date = PhaseCalendar.toISODate(now)
  const breaks = await breakRepo.getAll()
  const calendar = new PhaseCalendar(breaks)

  if (calendar.isOnBreak(now)) {
    throw new Error('Cannot check in during a break — resume the plan first.')
  }
  if (calendar.isRestDay(now) && !opts.sessionTypeOverride) {
    throw new Error('Today is a rest day. Pick a session type to train anyway.')
  }

  const existingByDate = await sessionRepo.findByDate(date)
  if (existingByDate) {
    if (existingByDate.status === 'IN_PROGRESS' || existingByDate.status === 'NOT_STARTED') {
      // Resume existing session
      if (!existingByDate.checkInTime) {
        existingByDate.checkInTime = now.toISOString()
        existingByDate.status = 'IN_PROGRESS'
        await sessionRepo.save(existingByDate)
      }
      return { session: existingByDate, alreadyExisted: true }
    }
    // Already completed today — return as is
    return { session: existingByDate, alreadyExisted: true }
  }

  const info = calendar.currentInfo(now)
  const sessionType = opts.sessionTypeOverride ?? calendar.sessionType(now)
  const exercises = exercisesFor(info.phase, sessionType)
  const settings = SettingsStorage.load()

  const sessionId = newId()
  const exerciseLogs: ExerciseLog[] = []
  let displayOrder = 0

  for (const ex of exercises) {
    const exerciseLogId = newId()
    const history = await sessionRepo.findHistoryForExercise(ex.id, 12)
    const plannedWeight = ProgressionCalculator.computeNextWeight(
      ex,
      history,
      now,
      settings.startingWeights[ex.id],
    )
    const plannedReps = ex.reps.max // optimistic target

    const setLogs: SetLog[] = []
    for (let i = 1; i <= ex.sets; i++) {
      setLogs.push({
        id: newId(),
        exerciseLogId,
        setNumber: i,
        planned: { weight: plannedWeight, reps: plannedReps },
        actual: null,
        status: 'PENDING',
        deviationReason: null,
        isPositiveDeviation: false,
        createdAt: Date.now(),
      })
    }

    exerciseLogs.push({
      id: exerciseLogId,
      sessionId,
      exerciseId: ex.id,
      exerciseName: ex.name,
      isCompound: ex.isCompound,
      displayOrder: displayOrder++,
      setLogs,
      isSkipped: false,
      skipReason: null,
    })
  }

  const session: WorkoutSession = {
    id: sessionId,
    date,
    phase: info.phase,
    weekNumber: info.weekInPhase,
    sessionType,
    checkInTime: now.toISOString(),
    checkOutTime: null,
    durationMinutes: null,
    status: 'IN_PROGRESS',
    exerciseLogs,
    createdAt: Date.now(),
  }
  await sessionRepo.save(session)
  return { session, alreadyExisted: false }
}

export async function logSetAsPlanned(session: WorkoutSession, exerciseLogId: string, setNumber: number): Promise<WorkoutSession> {
  const next = mutateSet(session, exerciseLogId, setNumber, set => ({
    ...set,
    actual: { ...set.planned },
    status: 'AS_PLANNED',
    deviationReason: null,
    isPositiveDeviation: false,
  }))
  await sessionRepo.save(next)
  return next
}

export async function logSetDeviation(
  session: WorkoutSession,
  exerciseLogId: string,
  setNumber: number,
  actualWeight: number,
  actualReps: number,
  reason: GymDeviationReason,
): Promise<WorkoutSession> {
  const next = mutateSet(session, exerciseLogId, setNumber, set => {
    const classification = ProgressionCalculator.classifyActual(set.planned, { weight: actualWeight, reps: actualReps })
    const positive = reason === 'WENT_HEAVIER' || classification === 'POSITIVE'
    return {
      ...set,
      actual: { weight: actualWeight, reps: actualReps },
      status: positive ? 'POSITIVE' : classification === 'AS_PLANNED' ? 'AS_PLANNED' : 'DEVIATION',
      deviationReason: reason,
      isPositiveDeviation: positive,
    }
  })
  await sessionRepo.save(next)
  return next
}

export async function skipExercise(
  session: WorkoutSession,
  exerciseLogId: string,
  reason: GymDeviationReason,
): Promise<WorkoutSession> {
  const next: WorkoutSession = {
    ...session,
    exerciseLogs: session.exerciseLogs.map(ex => {
      if (ex.id !== exerciseLogId) return ex
      return {
        ...ex,
        isSkipped: true,
        skipReason: reason,
        setLogs: ex.setLogs.map(s => ({
          ...s,
          status: 'SKIPPED',
          actual: null,
          deviationReason: reason,
        })),
      }
    }),
  }
  await sessionRepo.save(next)
  return next
}

export interface SessionSummary {
  durationMinutes: number
  asPlannedCount: number
  deviationCount: number
  positiveCount: number
  skippedCount: number
  topReason: GymDeviationReason | null
  nextTargets: { exerciseId: string; exerciseName: string; previous: number; next: number }[]
}

export async function checkOut(session: WorkoutSession, now: Date = new Date()): Promise<{ session: WorkoutSession; summary: SessionSummary }> {
  const checkIn = session.checkInTime ? new Date(session.checkInTime) : now
  const duration = Math.max(1, Math.round((now.getTime() - checkIn.getTime()) / 60000))

  const completed: WorkoutSession = {
    ...session,
    checkOutTime: now.toISOString(),
    durationMinutes: duration,
    status: 'COMPLETED',
    exerciseLogs: session.exerciseLogs.map(ex => ({
      ...ex,
      // Any pending sets at checkout become skipped (no reason recorded automatically).
      setLogs: ex.setLogs.map(s => s.status === 'PENDING' ? ({ ...s, status: 'SKIPPED' }) : s),
    })),
  }

  await sessionRepo.save(completed)

  const allSets = completed.exerciseLogs.flatMap(e => e.setLogs)
  const reasonCounts = new Map<GymDeviationReason, number>()
  for (const s of allSets) {
    if (s.deviationReason) reasonCounts.set(s.deviationReason, (reasonCounts.get(s.deviationReason) ?? 0) + 1)
  }
  const topReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const settings = SettingsStorage.load()
  const nextTargets: SessionSummary['nextTargets'] = []
  for (const ex of completed.exerciseLogs) {
    if (!ex.isCompound) continue
    const history = await sessionRepo.findHistoryForExercise(ex.exerciseId, 12)
    const lookup = lookupExercise(ex.exerciseId)
    if (!lookup) continue
    const previous = ex.setLogs[0]?.planned.weight ?? 0
    const next = ProgressionCalculator.computeNextWeight(lookup, history, now, settings.startingWeights[ex.exerciseId])
    nextTargets.push({ exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, previous, next })
  }

  const summary: SessionSummary = {
    durationMinutes: duration,
    asPlannedCount: allSets.filter(s => s.status === 'AS_PLANNED').length,
    deviationCount: allSets.filter(s => s.status === 'DEVIATION').length,
    positiveCount: allSets.filter(s => s.status === 'POSITIVE').length,
    skippedCount: allSets.filter(s => s.status === 'SKIPPED').length,
    topReason,
    nextTargets,
  }
  return { session: completed, summary }
}

function mutateSet(
  session: WorkoutSession,
  exerciseLogId: string,
  setNumber: number,
  fn: (set: SetLog) => SetLog,
): WorkoutSession {
  return {
    ...session,
    exerciseLogs: session.exerciseLogs.map(ex => {
      if (ex.id !== exerciseLogId) return ex
      return {
        ...ex,
        setLogs: ex.setLogs.map(s => (s.setNumber === setNumber ? fn(s) : s)),
      }
    }),
  }
}
