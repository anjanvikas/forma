export type GymDeviationReason =
  | 'POOR_SLEEP'
  | 'LOW_ENERGY'
  | 'PAIN_DISCOMFORT'
  | 'LOW_MOTIVATION'
  | 'MISSED_PRE_WORKOUT_MEAL'
  | 'SHORT_ON_TIME'
  | 'FEELING_SICK'
  | 'EQUIPMENT_BUSY'
  | 'FORM_BREAKDOWN'
  | 'WENT_HEAVIER'

export type MealDeviationReason =
  | 'NOT_HUNGRY'
  | 'RAN_OUT_OF_TIME'
  | 'FORGOT'
  | 'FELT_SICK'
  | 'INGREDIENT_UNAVAILABLE'

export type DeviationReason = GymDeviationReason | MealDeviationReason

interface ReasonInfo {
  emoji: string
  label: string
  positive?: boolean
}

export const GYM_REASONS: Record<GymDeviationReason, ReasonInfo> = {
  POOR_SLEEP: { emoji: '😴', label: 'Poor sleep' },
  LOW_ENERGY: { emoji: '⚡', label: 'Low energy' },
  PAIN_DISCOMFORT: { emoji: '🤕', label: 'Pain' },
  LOW_MOTIVATION: { emoji: '😤', label: 'Motivation' },
  MISSED_PRE_WORKOUT_MEAL: { emoji: '🍽️', label: 'Missed meal' },
  SHORT_ON_TIME: { emoji: '⏰', label: 'Short on time' },
  FEELING_SICK: { emoji: '🤒', label: 'Sick' },
  EQUIPMENT_BUSY: { emoji: '🏋️', label: 'Equipment busy' },
  FORM_BREAKDOWN: { emoji: '🔄', label: 'Form breakdown' },
  WENT_HEAVIER: { emoji: '📈', label: 'Went heavier', positive: true },
}

export const MEAL_REASONS: Record<MealDeviationReason, ReasonInfo> = {
  NOT_HUNGRY: { emoji: '😶', label: 'Wasn\'t hungry' },
  RAN_OUT_OF_TIME: { emoji: '⏰', label: 'Ran out of time' },
  FORGOT: { emoji: '🧠', label: 'Forgot' },
  FELT_SICK: { emoji: '🤒', label: 'Felt sick' },
  INGREDIENT_UNAVAILABLE: { emoji: '🛒', label: 'Not available' },
}

export const ALL_REASONS: Record<DeviationReason, ReasonInfo> = {
  ...GYM_REASONS,
  ...MEAL_REASONS,
}

export type BreakReason =
  | 'TRAVEL'
  | 'ILLNESS'
  | 'HOLIDAY'
  | 'WORK_CRUNCH'
  | 'MENTAL_ENERGY'
  | 'INJURY'
  | 'OTHER'

export const BREAK_REASONS: Record<BreakReason, ReasonInfo> = {
  TRAVEL: { emoji: '🌍', label: 'Travel' },
  ILLNESS: { emoji: '🤒', label: 'Illness' },
  HOLIDAY: { emoji: '🏖️', label: 'Holiday' },
  WORK_CRUNCH: { emoji: '💼', label: 'Work' },
  MENTAL_ENERGY: { emoji: '😔', label: 'Mental energy' },
  INJURY: { emoji: '🔧', label: 'Injury' },
  OTHER: { emoji: '📦', label: 'Other' },
}
