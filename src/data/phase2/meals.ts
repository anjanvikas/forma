import type { PlannedMeal } from '@/domain/nutrition/entities/PlannedMeal'
import type { MealSlot } from '@/domain/nutrition/value-objects/MealSlot'

const TRAINING: Partial<Record<MealSlot, PlannedMeal>> = {
  PRE_GYM: {
    slot: 'PRE_GYM', phase: 'PHASE_2', isRestDay: false,
    description: '1 banana · 15 almonds · black coffee',
    macros: { protein: 6, carbs: 38, fats: 14, calories: 290 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  POST_GYM: {
    slot: 'POST_GYM', phase: 'PHASE_2', isRestDay: false,
    description: 'Whey shake (40g) + oats (40g) + banana',
    macros: { protein: 38, carbs: 60, fats: 5, calories: 440 },
    hasProteinSwapOption: false, hasMilkSwapOption: true,
  },
  BREAKFAST: {
    slot: 'BREAKFAST', phase: 'PHASE_2', isRestDay: false,
    description: '4 egg whites + 3 whole eggs · 3 slices brown toast · 1 avocado',
    macros: { protein: 34, carbs: 50, fats: 22, calories: 540 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  LUNCH: {
    slot: 'LUNCH', phase: 'PHASE_2', isRestDay: false,
    description: 'Grilled chicken (180g) · 1.5 cups rice · veg curry',
    macros: { protein: 46, carbs: 80, fats: 14, calories: 660 },
    hasProteinSwapOption: true, hasMilkSwapOption: false,
  },
  SNACK: {
    slot: 'SNACK', phase: 'PHASE_2', isRestDay: false,
    description: 'Greek yogurt (200g) · granola · berries',
    macros: { protein: 20, carbs: 36, fats: 10, calories: 320 },
    hasProteinSwapOption: false, hasMilkSwapOption: false,
  },
  DINNER: {
    slot: 'DINNER', phase: 'PHASE_2', isRestDay: false,
    description: 'Chicken breast (200g) · roti × 3 · dal · greens',
    macros: { protein: 50, carbs: 56, fats: 16, calories: 580 },
    hasProteinSwapOption: true, hasMilkSwapOption: false,
  },
}

const REST: Partial<Record<MealSlot, PlannedMeal>> = {
  BREAKFAST: TRAINING.BREAKFAST!,
  LUNCH: TRAINING.LUNCH!,
  SNACK: TRAINING.SNACK!,
  DINNER: TRAINING.DINNER!,
}

export const PHASE_2_MEALS = { TRAINING, REST }
