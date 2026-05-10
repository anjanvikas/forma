interface Props {
  label: string
  actual: number
  target: number
  unit?: string
}

export function MacroBar({ label, actual, target, unit = 'g' }: Props) {
  const pct = target === 0 ? 0 : Math.min(100, Math.round((actual / target) * 100))
  const over = actual > target
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-body-sm">
        <span className="label-caps">{label}</span>
        <span className="font-mono text-mono-sm">
          {Math.round(actual)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-input overflow-hidden">
        <div
          className={`h-full ${over ? 'bg-status-warning' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
