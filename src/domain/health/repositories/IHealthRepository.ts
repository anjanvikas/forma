import type { BodyWeightEntry, SleepLog, HairProtocolLog } from '../entities/health'

export interface IHealthRepository {
  saveBodyWeight(entry: BodyWeightEntry): Promise<void>
  findBodyWeights(limit?: number): Promise<BodyWeightEntry[]>
  findLatestBodyWeight(): Promise<BodyWeightEntry | null>

  saveSleepLog(log: SleepLog): Promise<void>
  findSleepByDate(date: string): Promise<SleepLog | null>
  findSleepRange(from: string, to: string): Promise<SleepLog[]>

  saveHairProtocolLog(log: HairProtocolLog): Promise<void>
  findProtocolByDate(date: string): Promise<HairProtocolLog | null>
  findProtocolRange(from: string, to: string): Promise<HairProtocolLog[]>
}
