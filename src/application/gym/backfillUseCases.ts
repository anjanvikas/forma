import { sessionRepo, breakRepo } from '../repos'
import { newId } from '@/lib/id'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import { exercisesFor } from '@/data'
import { ProgressionCalculator } from '@/domain/training/services/ProgressionCalculator'
import { SettingsStorage } from '@/infrastructure/storage/SettingsStorage'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import type { ExerciseLog } from '@/domain/training/entities/ExerciseLog'
import type { SetLog } from '@/domain/training/entities/SetLog'
import type { SessionType } from '@/domain/planning/value-objects/SessionType'

export interface BackfillResult {
  date: string
  status: 'created' | 'skipped-existing' | 'skipped-rest'
  sessionId?: string
}

/**
 * Marks a past date as trained: builds a COMPLETED session with all sets AS_PLANNED
 * at the planned weight (computed via ProgressionCalculator from history available
 * up to that date). Idempotent — skips if a session already exists for that date.
 */
export async function backfillSessionAsPlanned(
  date: Date,
  sessionTypeOverride?: Exclude<SessionType, 'REST'>,
): Promise<BackfillResult> {
  const isoDate = PhaseCalendar.toISODate(date)
  const existing = await sessionRepo.findByDate(isoDate)
  if (existing) return { date: isoDate, status: 'skipped-existing', sessionId: existing.id }

  const breaks = await breakRepo.getAll()
  const calendar = new PhaseCalendar(breaks)
  const planned = calendar.sessionType(date)

  let sessionType: SessionType
  if (sessionTypeOverride) {
    sessionType = sessionTypeOverride
  } else if (planned === 'REST') {
    return { date: isoDate, status: 'skipped-rest' }
  } else {
    sessionType = planned
  }

  const info = calendar.currentInfo(date)
  const exercises = exercisesFor(info.phase, sessionType)
  const settings = SettingsStorage.load()

  const sessionId = newId()
  const exerciseLogs: ExerciseLog[] = []
  let displayOrder = 0

  for (const ex of exercises) {
    const exerciseLogId = newId()
    const history = await sessionRepo.findHistoryForExercise(ex.id, 12)
    const historyBefore = history.filter(h => h.sessionDate < isoDate)
    const plannedWeight = ProgressionCalculator.computeNextWeight(
      ex,
      historyBefore,
      date,
      settings.startingWeights[ex.id],
    )
    const plannedReps = ex.reps.max

    const setLogs: SetLog[] = []
    for (let i = 1; i <= ex.sets; i++) {
      setLogs.push({
        id: newId(),
        exerciseLogId,
        setNumber: i,
        planned: { weight: plannedWeight, reps: plannedReps },
        actual: { weight: plannedWeight, reps: plannedReps },
        status: 'AS_PLANNED',
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

  // Use noon of that date for check-in/out to avoid TZ edge cases.
  const noon = new Date(date)
  noon.setHours(12, 0, 0, 0)
  const checkOut = new Date(noon)
  checkOut.setHours(13, 0, 0, 0)

  const session: WorkoutSession = {
    id: sessionId,
    date: isoDate,
    phase: info.phase,
    weekNumber: info.weekInPhase,
    sessionType,
    checkInTime: noon.toISOString(),
    checkOutTime: checkOut.toISOString(),
    durationMinutes: 60,
    status: 'COMPLETED',
    exerciseLogs,
    createdAt: Date.now(),
  }
  await sessionRepo.save(session)
  return { date: isoDate, status: 'created', sessionId }
}
