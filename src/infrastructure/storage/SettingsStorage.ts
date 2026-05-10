export interface Settings {
  vegetarianMode: boolean
  finasterideEnabled: boolean
  weightUnit: 'kg' | 'lbs'
  startingWeights: Record<string, number> // exerciseId → kg
  installBannerDismissed: boolean
}

const KEY = 'forma:settings:v1'

const DEFAULTS: Settings = {
  vegetarianMode: false,
  finasterideEnabled: false,
  weightUnit: 'kg',
  startingWeights: {},
  installBannerDismissed: false,
}

export const SettingsStorage = {
  load(): Settings {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { ...DEFAULTS }
      return { ...DEFAULTS, ...JSON.parse(raw) as Partial<Settings> }
    } catch {
      return { ...DEFAULTS }
    }
  },
  save(s: Settings) {
    localStorage.setItem(KEY, JSON.stringify(s))
  },
  patch(patch: Partial<Settings>) {
    const next = { ...this.load(), ...patch }
    this.save(next)
    return next
  },
}
