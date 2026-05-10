import { db } from '../db/database'
import type { IBreakPeriodRepository } from '@/domain/breaks/repositories/IBreakPeriodRepository'
import type { BreakPeriod } from '@/domain/breaks/entities/BreakPeriod'

export class BreakPeriodRepository implements IBreakPeriodRepository {
  save(b: BreakPeriod) { return db.breakPeriods.put(b).then(() => undefined) }
  update(b: BreakPeriod) { return db.breakPeriods.put(b).then(() => undefined) }

  async getActive() {
    return (await db.breakPeriods.where('status').equals('ACTIVE').first()) ?? null
  }
  getAll() { return db.breakPeriods.orderBy('startDate').reverse().toArray() }
  async getTotalBreakDays() {
    const all = await this.getAll()
    return all.reduce((sum, b) => sum + (b.durationDays ?? 0), 0)
  }
}
