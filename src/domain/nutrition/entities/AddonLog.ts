import type { AddonKind } from '../value-objects/Addon'

export interface AddonLog {
  id: string
  nutritionLogId: string
  kind: AddonKind
  count: number
  createdAt: number
  updatedAt: number
}
