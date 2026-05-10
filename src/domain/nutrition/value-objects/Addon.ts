import type { MacroTargets } from '@/domain/planning/value-objects/MacroTargets'

export type AddonKind = 'WHEY_WATER' | 'WHEY_MILK_BANANA' | 'PROTEIN_BAR'

export const ADDON_LABEL: Record<AddonKind, string> = {
  WHEY_WATER: 'Whey + water',
  WHEY_MILK_BANANA: 'Whey + milk + banana',
  PROTEIN_BAR: 'Protein bar',
}

export const ADDON_EMOJI: Record<AddonKind, string> = {
  WHEY_WATER: '🥛',
  WHEY_MILK_BANANA: '🍌',
  PROTEIN_BAR: '🍫',
}

export const ADDON_ORDER: AddonKind[] = ['WHEY_WATER', 'WHEY_MILK_BANANA', 'PROTEIN_BAR']

export const ADDON_MACROS: Record<AddonKind, MacroTargets> = {
  WHEY_WATER: { protein: 24, carbs: 3, fats: 1.5, calories: 125 },
  WHEY_MILK_BANANA: { protein: 32, carbs: 38, fats: 6, calories: 330 },
  PROTEIN_BAR: { protein: 20, carbs: 22, fats: 7, calories: 220 },
}
