export interface MacroTargets {
  protein: number
  carbs: number
  fats: number
  calories: number
}

export const ZERO_MACROS: MacroTargets = { protein: 0, carbs: 0, fats: 0, calories: 0 }

export function addMacros(a: MacroTargets, b: MacroTargets): MacroTargets {
  return {
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fats: a.fats + b.fats,
    calories: a.calories + b.calories,
  }
}
