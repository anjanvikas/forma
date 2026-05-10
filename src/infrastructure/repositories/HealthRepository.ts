import { db } from '../db/database'
import type { IHealthRepository } from '@/domain/health/repositories/IHealthRepository'
import type { BodyWeightEntry, SleepLog, HairProtocolLog } from '@/domain/health/entities/health'

export class HealthRepository implements IHealthRepository {
  saveBodyWeight(entry: BodyWeightEntry) { return db.bodyWeightEntries.put(entry).then(() => undefined) }
  findBodyWeights(limit = 50) { return db.bodyWeightEntries.orderBy('date').reverse().limit(limit).toArray() }
  async findLatestBodyWeight() {
    return (await db.bodyWeightEntries.orderBy('date').reverse().first()) ?? null
  }

  saveSleepLog(log: SleepLog) { return db.sleepLogs.put(log).then(() => undefined) }
  async findSleepByDate(date: string) {
    return (await db.sleepLogs.where('date').equals(date).first()) ?? null
  }
  findSleepRange(from: string, to: string) {
    return db.sleepLogs.where('date').between(from, to, true, true).toArray()
  }

  saveHairProtocolLog(log: HairProtocolLog) { return db.hairProtocolLogs.put(log).then(() => undefined) }
  async findProtocolByDate(date: string) {
    return (await db.hairProtocolLogs.where('date').equals(date).first()) ?? null
  }
  findProtocolRange(from: string, to: string) {
    return db.hairProtocolLogs.where('date').between(from, to, true, true).toArray()
  }
}
