import { db, type WorkoutSessionRecord } from '../db/database'
import type { IWorkoutSessionRepository } from '@/domain/training/repositories/IWorkoutSessionRepository'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import type { ExerciseHistoryRow } from '@/domain/training/services/ProgressionCalculator'

export class WorkoutSessionRepository implements IWorkoutSessionRepository {
  async save(session: WorkoutSession): Promise<void> {
    await db.transaction(
      'rw',
      [db.workoutSessions, db.exerciseLogs, db.setLogs],
      async () => {
        const { exerciseLogs, ...sessionRecord } = session
        await db.workoutSessions.put(sessionRecord)

        const existingExerciseLogs = await db.exerciseLogs.where('sessionId').equals(session.id).toArray()
        const existingIds = new Set(exerciseLogs.map(e => e.id))
        const toDelete = existingExerciseLogs.filter(e => !existingIds.has(e.id)).map(e => e.id)
        if (toDelete.length > 0) {
          await db.exerciseLogs.bulkDelete(toDelete)
          await db.setLogs.where('exerciseLogId').anyOf(toDelete).delete()
        }

        for (const ex of exerciseLogs) {
          const { setLogs, ...exRecord } = ex
          await db.exerciseLogs.put(exRecord)
          const existing = await db.setLogs.where('exerciseLogId').equals(ex.id).toArray()
          const setIds = new Set(setLogs.map(s => s.id))
          const stale = existing.filter(s => !setIds.has(s.id)).map(s => s.id)
          if (stale.length > 0) await db.setLogs.bulkDelete(stale)
          await db.setLogs.bulkPut(setLogs)
        }
      },
    )
  }

  async findById(id: string): Promise<WorkoutSession | null> {
    const record = await db.workoutSessions.get(id)
    if (!record) return null
    return this.hydrate(record)
  }

  async findByDate(date: string): Promise<WorkoutSession | null> {
    const record = await db.workoutSessions.where('date').equals(date).first()
    if (!record) return null
    return this.hydrate(record)
  }

  async findRecent(limit: number): Promise<WorkoutSession[]> {
    const records = await db.workoutSessions.orderBy('date').reverse().limit(limit).toArray()
    return Promise.all(records.map(r => this.hydrate(r)))
  }

  async findActiveSession(): Promise<WorkoutSession | null> {
    const record = await db.workoutSessions.where('status').equals('IN_PROGRESS').first()
    if (!record) return null
    return this.hydrate(record)
  }

  async findHistoryForExercise(exerciseId: string, limit = 20): Promise<ExerciseHistoryRow[]> {
    const exerciseLogs = await db.exerciseLogs.where('exerciseId').equals(exerciseId).toArray()
    const sessionIds = Array.from(new Set(exerciseLogs.map(e => e.sessionId)))
    const sessions = await db.workoutSessions.where('id').anyOf(sessionIds).toArray()
    const sessionById = new Map(sessions.map(s => [s.id, s]))

    const rows: ExerciseHistoryRow[] = []
    for (const ex of exerciseLogs) {
      const session = sessionById.get(ex.sessionId)
      if (!session || session.status !== 'COMPLETED') continue
      const sets = await db.setLogs.where('exerciseLogId').equals(ex.id).toArray()
      rows.push({ sessionDate: session.date, sets })
    }
    return rows.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)).slice(0, limit)
  }

  private async hydrate(record: WorkoutSessionRecord): Promise<WorkoutSession> {
    const exerciseLogs = await db.exerciseLogs
      .where('sessionId').equals(record.id)
      .sortBy('displayOrder')
    const setLogsByExercise: Record<string, SetLog[]> = {}
    const allSetLogs = await db.setLogs.where('exerciseLogId').anyOf(exerciseLogs.map(e => e.id)).toArray()
    for (const s of allSetLogs) {
      ;(setLogsByExercise[s.exerciseLogId] ??= []).push(s)
    }
    return {
      ...record,
      exerciseLogs: exerciseLogs.map(e => ({
        ...e,
        setLogs: (setLogsByExercise[e.id] ?? []).sort((a, b) => a.setNumber - b.setNumber),
      })),
    }
  }
}

import type { SetLog } from '@/domain/training/entities/SetLog'
