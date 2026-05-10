import type { PhaseId, TrainingSplit, DayOfWeek } from '../value-objects/SessionType'
import type { MacroTargets } from '../value-objects/MacroTargets'

export interface FitnessPhase {
  id: PhaseId
  name: string
  durationMonths: number
  trainingDays: DayOfWeek[]
  split: TrainingSplit
  trainingDayMacros: MacroTargets
  restDayMacros: MacroTargets
}

export const PHASES: Record<PhaseId, FitnessPhase> = {
  PHASE_1: {
    id: 'PHASE_1',
    name: 'Foundation',
    durationMonths: 2,
    trainingDays: ['MON', 'WED', 'FRI'],
    split: 'FULL_BODY',
    trainingDayMacros: { protein: 140, carbs: 280, fats: 70, calories: 2400 },
    restDayMacros:    { protein: 140, carbs: 200, fats: 65, calories: 2050 },
  },
  PHASE_2: {
    id: 'PHASE_2',
    name: 'Lean Bulk',
    durationMonths: 8,
    trainingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    split: 'PPL',
    trainingDayMacros: { protein: 160, carbs: 320, fats: 85, calories: 2750 },
    restDayMacros:    { protein: 160, carbs: 250, fats: 75, calories: 2400 },
  },
  PHASE_3: {
    id: 'PHASE_3',
    name: 'Sculpt',
    durationMonths: 5,
    trainingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    split: 'PPL',
    trainingDayMacros: { protein: 170, carbs: 220, fats: 65, calories: 2200 },
    restDayMacros:    { protein: 170, carbs: 180, fats: 60, calories: 2000 },
  },
}
