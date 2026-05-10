import { create } from 'zustand'
import { PhaseCalendar, type PhaseInfo } from '@/domain/planning/PhaseCalendar'
import { breakRepo, sessionRepo, healthRepo } from '@/application/repos'
import { ensureNutritionLog } from '@/application/nutrition/mealUseCases'
import { ensureProtocolLog } from '@/application/health/healthUseCases'
import type { DailyNutritionLog } from '@/domain/nutrition/entities/DailyNutritionLog'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import type { SleepLog, HairProtocolLog } from '@/domain/health/entities/health'
import type { BreakPeriod } from '@/domain/breaks/entities/BreakPeriod'

interface TodayState {
  loaded: boolean
  now: Date
  info: PhaseInfo | null
  isRestDay: boolean
  activeBreak: BreakPeriod | null
  todaySession: WorkoutSession | null
  nutrition: DailyNutritionLog | null
  sleep: SleepLog | null
  protocol: HairProtocolLog | null
  load: () => Promise<void>
  setSession: (s: WorkoutSession | null) => void
  setNutrition: (n: DailyNutritionLog) => void
  setSleep: (s: SleepLog) => void
  setProtocol: (p: HairProtocolLog) => void
  setActiveBreak: (b: BreakPeriod | null) => void
}

export const useTodayStore = create<TodayState>((set) => ({
  loaded: false,
  now: new Date(),
  info: null,
  isRestDay: false,
  activeBreak: null,
  todaySession: null,
  nutrition: null,
  sleep: null,
  protocol: null,

  async load() {
    const now = new Date()
    const date = PhaseCalendar.toISODate(now)
    const breaks = await breakRepo.getAll()
    const calendar = new PhaseCalendar(breaks)
    const info = calendar.currentInfo(now)
    const isRestDay = calendar.isRestDay(now)
    const activeBreak = await breakRepo.getActive()

    const todaySession = await sessionRepo.findByDate(date)

    let nutrition: DailyNutritionLog | null = null
    if (!activeBreak) {
      nutrition = await ensureNutritionLog(now)
    }

    const sleep = await healthRepo.findSleepByDate(date)
    const protocol = await ensureProtocolLog(now)

    set({
      loaded: true,
      now,
      info,
      isRestDay,
      activeBreak,
      todaySession,
      nutrition,
      sleep,
      protocol,
    })
  },

  setSession: (s) => set({ todaySession: s }),
  setNutrition: (n) => set({ nutrition: n }),
  setSleep: (s) => set({ sleep: s }),
  setProtocol: (p) => set({ protocol: p }),
  setActiveBreak: (b) => set({ activeBreak: b }),
}))
