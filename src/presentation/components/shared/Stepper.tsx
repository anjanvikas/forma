interface StepperProps {
  value: number
  step: number
  onChange: (next: number) => void
  min?: number
  unit?: string
  decimals?: number
}

export function Stepper({ value, step, onChange, min = 0, unit, decimals = 1 }: StepperProps) {
  const fmt = (n: number) => (Number.isInteger(n) || decimals === 0) ? String(n) : n.toFixed(decimals)
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
        className="w-11 h-11 rounded-card bg-bg-input text-text-primary text-2xl active:scale-95 transition-transform"
      >−</button>
      <div className="flex-1 h-12 rounded-card bg-bg-input flex items-center justify-center font-mono text-mono-lg">
        {fmt(value)}{unit ? ` ${unit}` : ''}
      </div>
      <button
        type="button"
        onClick={() => onChange(+(value + step).toFixed(2))}
        className="w-11 h-11 rounded-card bg-bg-input text-text-primary text-2xl active:scale-95 transition-transform"
      >+</button>
    </div>
  )
}
