import { useTodayStore } from '@/presentation/stores/todayStore'
import { toggleProtocolItem } from '@/application/health/healthUseCases'
import type { HairProtocolLog } from '@/domain/health/entities/health'
import { SettingsStorage } from '@/infrastructure/storage/SettingsStorage'

interface Item {
  key: keyof HairProtocolLog
  label: string
  emoji: string
}

export function ProtocolChecklist() {
  const protocol = useTodayStore(s => s.protocol)
  const setProtocol = useTodayStore(s => s.setProtocol)
  const settings = SettingsStorage.load()

  if (!protocol) return null

  const items: Item[] = [
    { key: 'minoxidilApplied', label: 'Minoxidil', emoji: '💧' },
    { key: 'supplementsTaken', label: 'Supplements', emoji: '💊' },
  ]
  if (protocol.ketoShampooUsed !== null) items.push({ key: 'ketoShampooUsed', label: 'Keto shampoo', emoji: '🧴' })
  if (protocol.dermaRollerUsed !== null) items.push({ key: 'dermaRollerUsed', label: 'Derma roller', emoji: '🪡' })
  if (settings.finasterideEnabled) items.push({ key: 'finasterideTaken', label: 'Finasteride', emoji: '💊' })

  const onToggle = async (key: keyof HairProtocolLog) => {
    const next = await toggleProtocolItem(protocol, key)
    setProtocol(next)
  }

  return (
    <div className="card">
      <div className="label-caps mb-md">🌙 Tonight's protocol</div>
      <ul className="space-y-2">
        {items.map(item => {
          const value = protocol[item.key] as boolean | null
          const checked = value === true
          return (
            <li key={item.key}>
              <button
                onClick={() => onToggle(item.key)}
                className="w-full flex items-center gap-3 py-2 active:scale-[0.99] transition-transform"
              >
                <span
                  className={`w-6 h-6 rounded border ${
                    checked ? 'bg-accent border-accent text-text-inverse' : 'border-border-default'
                  } flex items-center justify-center text-[14px]`}
                >
                  {checked ? '✓' : ''}
                </span>
                <span className={`text-body-md ${checked ? 'line-through text-text-secondary' : ''}`}>
                  {item.emoji} {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
