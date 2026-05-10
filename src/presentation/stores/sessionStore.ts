import { create } from 'zustand'
import {
  checkIn,
  logSetAsPlanned,
  logSetDeviation,
  skipExercise,
  checkOut,
  type SessionSummary,
} from '@/application/gym/sessionUseCases'
import { sessionRepo } from '@/application/repos'
import type { WorkoutSession } from '@/domain/training/entities/WorkoutSession'
import type { GymDeviationReason } from '@/constants/deviationReasons'

interface SessionState {
  active: WorkoutSession | null
  summary: SessionSummary | null
  busy: boolean
  loadActive: () => Promise<void>
  setActive: (s: WorkoutSession | null) => void
  startSession: () => Promise<WorkoutSession>
  asPlanned: (exerciseLogId: string, setNumber: number) => Promise<void>
  deviation: (exerciseLogId: string, setNumber: number, weight: number, reps: number, reason: GymDeviationReason) => Promise<void>
  skipExercise: (exerciseLogId: string, reason: GymDeviationReason) => Promise<void>
  finish: () => Promise<SessionSummary>
  clearSummary: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  active: null,
  summary: null,
  busy: false,

  async loadActive() {
    const active = await sessionRepo.findActiveSession()
    set({ active })
  },

  setActive: (s) => set({ active: s }),

  async startSession() {
    set({ busy: true })
    try {
      const { session } = await checkIn()
      set({ active: session })
      return session
    } finally {
      set({ busy: false })
    }
  },

  async asPlanned(exerciseLogId, setNumber) {
    const active = get().active
    if (!active) return
    const next = await logSetAsPlanned(active, exerciseLogId, setNumber)
    set({ active: next })
  },

  async deviation(exerciseLogId, setNumber, weight, reps, reason) {
    const active = get().active
    if (!active) return
    const next = await logSetDeviation(active, exerciseLogId, setNumber, weight, reps, reason)
    set({ active: next })
  },

  async skipExercise(exerciseLogId, reason) {
    const active = get().active
    if (!active) return
    const next = await skipExercise(active, exerciseLogId, reason)
    set({ active: next })
  },

  async finish() {
    const active = get().active
    if (!active) throw new Error('No active session')
    set({ busy: true })
    try {
      const { session, summary } = await checkOut(active)
      set({ active: session, summary })
      return summary
    } finally {
      set({ busy: false })
    }
  },

  clearSummary: () => set({ summary: null }),
}))
