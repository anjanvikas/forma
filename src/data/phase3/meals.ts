import type { PlannedMeal } from '@/domain/nutrition/entities/PlannedMeal'
import type { MealSlot } from '@/domain/nutrition/value-objects/MealSlot'

const TRAINING: Partial<Record<MealSlot, PlannedMeal>> = {
  PRE_GYM: {
    slot: 'PRE_GYM', phase: 'PHASE_3', isRestDay: false,
    description: '½ banana · black coffee',
    macros: { protein: 1, carbs: 14, fats: 0, calories: 60 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  POST_GYM: {
    slot: 'POST_GYM', phase: 'PHASE_3', isRestDay: false,
    description: 'Whey shake (40g) in water',
    macros: { protein: 38, carbs: 5, fats: 1, calories: 190 },
    hasProteinSwapOption: false, hasMilkSwapOption: true,
  },
  BREAKFAST: {
    slot: 'BREAKFAST', phase: 'PHASE_3', isRestDay: false,
    description: '5 egg whites + 1 whole egg · 1 slice brown toast',
    macros: { protein: 30, carbs: 14, fats: 8, calories: 270 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  LUNCH: {
    slot: 'LUNCH', phase: 'PHASE_3', isRestDay: false,
    description: 'Grilled chicken (180g) · 1 cup rice · big salad',
    macros: { protein: 44, carbs: 50, fats: 8, calories: 470 },
    hasProteinSwapOption: true, hasMilkSwapOption: false,
  },
  SNACK: {
    slot: 'SNACK', phase: 'PHASE_3', isRestDay: false,
    description: 'Cottage cheese (150g) · cucumber',
    macros: { protein: 22, carbs: 6, fats: 6, calories: 170 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  DINNER: {
    slot: 'DINNER', phase: 'PHASE_3', isRestDay: false,
    description: 'Chicken breast (200g) · roti × 1 · steamed greens',
    macros: { protein: 50, carbs: 22, fats: 10, calories: 380 },
    hasProteinSwapOption: true, hasMilkSwapOption: false,
  },
}

const REST: Partial<Record<MealSlot, PlannedMeal>> = {
  BREAKFAST: TRAINING.BREAKFAST!,
  LUNCH: TRAINING.LUNCH!,
  SNACK: TRAINING.SNACK!,
  DINNER: TRAINING.DINNER!,
}

export const PHASE_3_MEALS = { TRAINING, REST }
