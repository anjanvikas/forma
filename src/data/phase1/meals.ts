import type { PlannedMeal } from '@/domain/nutrition/entities/PlannedMeal'
import type { MealSlot } from '@/domain/nutrition/value-objects/MealSlot'

const TRAINING: Partial<Record<MealSlot, PlannedMeal>> = {
  PRE_GYM: {
    slot: 'PRE_GYM', phase: 'PHASE_1', isRestDay: false,
    description: '1 banana · 10 almonds · black coffee',
    macros: { protein: 4, carbs: 32, fats: 10, calories: 220 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  POST_GYM: {
    slot: 'POST_GYM', phase: 'PHASE_1', isRestDay: false,
    description: 'Whey shake (30g) + 1 banana',
    macros: { protein: 30, carbs: 30, fats: 2, calories: 270 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  BREAKFAST: {
    slot: 'BREAKFAST', phase: 'PHASE_1', isRestDay: false,
    description: '4 egg whites + 2 whole eggs · 2 slices brown toast · ½ avocado',
    macros: { protein: 28, carbs: 38, fats: 18, calories: 420 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  LUNCH: {
    slot: 'LUNCH', phase: 'PHASE_1', isRestDay: false,
    description: 'Grilled chicken (150g) · 1 cup rice · mixed veg',
    macros: { protein: 38, carbs: 60, fats: 10, calories: 510 },
    hasProteinSwapOption: true, hasMilkSwapOption: false,
  },
  SNACK: {
    slot: 'SNACK', phase: 'PHASE_1', isRestDay: false,
    description: 'Greek yogurt (200g) · honey · walnuts',
    macros: { protein: 18, carbs: 24, fats: 12, calories: 280 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  DINNER: {
    slot: 'DINNER', phase: 'PHASE_1', isRestDay: false,
    description: 'Chicken breast (180g) · roti × 2 · sautéed greens',
    macros: { protein: 42, carbs: 40, fats: 14, calories: 470 },
    hasProteinSwapOption: true, hasMilkSwapOption: false,
  },
}

const REST: Partial<Record<MealSlot, PlannedMeal>> = {
  BREAKFAST: TRAINING.BREAKFAST!,
  LUNCH: TRAINING.LUNCH!,
  SNACK: TRAINING.SNACK!,
  DINNER: TRAINING.DINNER!,
}

export const PHASE_1_MEALS = { TRAINING, REST }
