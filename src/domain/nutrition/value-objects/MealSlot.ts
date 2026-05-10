export type MealSlot =
  | 'PRE_GYM'
  | 'POST_GYM'
  | 'BREAKFAST'
  | 'LUNCH'
  | 'SNACK'
  | 'DINNER'

export type MealStatus =
  | 'PENDING'
  | 'EATEN_AS_PLANNED'
  | 'EATEN_WITH_SWAP'
  | 'SKIPPED'

export type ProteinSwap = 'CHICKEN' | 'PANEER'
export type MilkSwap = 'FULL_FAT' | 'WATER'

export const MEAL_SLOT_TIME: Record<MealSlot, string> = {
  PRE_GYM: '5:00 AM',
  POST_GYM: '7:15 AM',
  BREAKFAST: '9:30 AM',
  LUNCH: '1:00 PM',
  SNACK: '5:00 PM',
  DINNER: '8:30 PM',
}

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  PRE_GYM: 'PRE-GYM',
  POST_GYM: 'POST-GYM',
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  SNACK: 'SNACK',
  DINNER: 'DINNER',
}

export const MEAL_SLOT_ORDER: MealSlot[] = [
  'PRE_GYM',
  'POST_GYM',
  'BREAKFAST',
  'LUNCH',
  'SNACK',
  'DINNER',
]
