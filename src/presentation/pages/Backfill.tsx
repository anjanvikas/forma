import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, differenceInCalendarDays, startOfWeek } from 'date-fns'
import { PLAN_START_DATE } from '@/constants/plan'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import { breakRepo, sessionRepo } from '@/application/repos'
import { backfillSessionAsPlanned } from '@/application/gym/backfillUseCases'

interface DayCell {
  date: Date
  iso: string
  inPlan: boolean
  isRest: boolean
  hasSession: boolean
  isFuture: boolean
}

export function Backfill() {
  const nav = useNavigate()
  const [calendar, setCalendar] = useState<PhaseCalendar | null>(null)
  const [sessionDates, setSessionDates] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  useEffect(() => {
    void (async () => {
      const breaks = await breakRepo.getAll()
      setCalendar(new PhaseCalendar(breaks))
      // Load existing sessions in window to mark them.
      const fromIso = PhaseCalendar.toISODate(PLAN_START_DATE)
      const toIso = PhaseCalendar.toISODate(today)
      const recent = await sessionRepo.findRecent(200)
      const inWindow = recent.filter(s => s.date >= fromIso && s.date <= toIso)
      setSessionDates(new Set(inWindow.map(s => s.date)))
    })()
  }, [today])

  const cells = useMemo<DayCell[][]>(() => {
    if (!calendar) return []
    // Start grid on the Sunday on/before PLAN_START_DATE; end on the Saturday on/after today.
    const gridStart = startOfWeek(PLAN_START_DATE, { weekStartsOn: 0 })
    const gridEnd = addDays(today, 6 - today.getDay())
    const totalDays = differenceInCalendarDays(gridEnd, gridStart) + 1
    const rows: DayCell[][] = []
    let row: DayCell[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(gridStart, i)
      const iso = PhaseCalendar.toISODate(d)
      const inPlan = d >= PLAN_START_DATE && d <= today
      const isRest = inPlan ? calendar.isRestDay(d) : true
      row.push({
        date: d,
        iso,
        inPlan,
        isRest,
        hasSession: sessionDates.has(iso),
        isFuture: d.getTime() === today.getTime() || d > today,
      })
      if (row.length === 7) {
        rows.push(row)
        row = []
      }
    }
    if (row.length > 0) rows.push(row)
    return rows
  }, [calendar, sessionDates, today])

  const toggle = (cell: DayCell) => {
    if (!cell.inPlan || cell.isFuture || cell.hasSession || cell.isRest) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(cell.iso)) next.delete(cell.iso)
      else next.add(cell.iso)
      return next
    })
  }

  const onSubmit = async () => {
    if (selected.size === 0) return
    setBusy(true)
    let created = 0
    let skipped = 0
    try {
      for (const iso of Array.from(selected).sort()) {
        const [y, m, d] = iso.split('-').map(Number)
        const r = await backfillSessionAsPlanned(new Date(y, m - 1, d))
        if (r.status === 'created') created++
        else skipped++
      }
      // Refresh markers
      const recent = await sessionRepo.findRecent(200)
      const fromIso = PhaseCalendar.toISODate(PLAN_START_DATE)
      const toIso = PhaseCalendar.toISODate(today)
      setSessionDates(new Set(recent.filter(s => s.date >= fromIso && s.date <= toIso).map(s => s.date)))
      setSelected(new Set())
      setResult({ created, skipped })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen px-md pt-md space-y-md">
      <header className="space-y-1">
        <button onClick={() => nav('/settings')} className="text-text-secondary text-body-sm">← Settings</button>
        <h1 className="font-display font-semibold text-display-lg uppercase">Backfill</h1>
        <div className="text-body-sm text-text-secondary">
          Tap past training days you completed but didn't log. Each marks a session as planned.
        </div>
      </header>

      <div className="card">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center font-mono text-mono-sm text-text-tertiary">{d}</div>
          ))}
        </div>
        <div className="space-y-1">
          {cells.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-1">
              {row.map(cell => (
                <DayButton key={cell.iso} cell={cell} selected={selected.has(cell.iso)} onTap={() => toggle(cell)} />
              ))}
            </div>
          ))}
        </div>
        <Legend />
      </div>

      <button
        disabled={busy || selected.size === 0}
        onClick={onSubmit}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? 'Saving…' : selected.size === 0 ? 'Select training days' : `Mark ${selected.size} day${selected.size === 1 ? '' : 's'} as trained`}
      </button>

      {result && (
        <div className="card">
          <div className="text-body-md">
            ✓ Backfilled {result.created} session{result.created === 1 ? '' : 's'}.
            {result.skipped > 0 && ` Skipped ${result.skipped} (already had a session).`}
          </div>
        </div>
      )}
    </div>
  )
}

function DayButton({ cell, selected, onTap }: { cell: DayCell; selected: boolean; onTap: () => void }) {
  if (!cell.inPlan) {
    return <div className="aspect-square rounded-md bg-bg-base/50" />
  }
  const base = 'aspect-square rounded-md flex flex-col items-center justify-center font-mono text-mono-sm relative'
  if (cell.hasSession) {
    return (
      <div className={`${base} bg-status-success/20 text-status-success border border-status-success/40`}>
        <div>{cell.date.getDate()}</div>
        <div className="text-[8px] leading-none">✓</div>
      </div>
    )
  }
  if (cell.isRest) {
    return (
      <div className={`${base} bg-bg-base text-text-tertiary border border-border-subtle/30`}>
        {cell.date.getDate()}
      </div>
    )
  }
  if (cell.isFuture) {
    return (
      <div className={`${base} bg-bg-surface text-text-tertiary border border-border-subtle`}>
        {cell.date.getDate()}
      </div>
    )
  }
  return (
    <button
      onClick={onTap}
      className={`${base} border active:scale-95 transition-transform ${
        selected
          ? 'bg-accent text-bg-base border-accent'
          : 'bg-bg-surface text-text-primary border-border-subtle'
      }`}
    >
      {cell.date.getDate()}
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 mt-3 text-body-sm text-text-tertiary">
      <Item color="bg-bg-surface border border-border-subtle" label="Tap to select" />
      <Item color="bg-accent" label="Selected" />
      <Item color="bg-status-success/20 border border-status-success/40" label="Logged" />
      <Item color="bg-bg-base border border-border-subtle/30" label="Rest" />
    </div>
  )
}

function Item({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}

