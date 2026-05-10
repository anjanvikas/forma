interface Props {
  emoji: string
  label: string
  selected?: boolean
  positive?: boolean
  onClick?: () => void
}

export function ReasonChip({ emoji, label, selected, positive, onClick }: Props) {
  const base = 'chip'
  const active = selected
    ? positive
      ? 'bg-status-positive text-text-inverse'
      : 'chip-active'
    : ''
  return (
    <button type="button" onClick={onClick} className={`${base} ${active}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
