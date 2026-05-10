import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { PLAN_START_DATE } from '@/constants/plan'
import { SettingsStorage, type Settings as S } from '@/infrastructure/storage/SettingsStorage'
import { breakRepo } from '@/application/repos'
import { startBreak, resumeBreak } from '@/application/breaks/breakUseCases'
import { PhaseCalendar } from '@/domain/planning/PhaseCalendar'
import { PHASES } from '@/domain/planning/entities/FitnessPhase'
import { BREAK_REASONS, type BreakReason } from '@/constants/deviationReasons'
import { ReasonChip } from '../components/shared/ReasonChip'
import { BottomSheet } from '../components/shared/BottomSheet'
import { useTodayStore } from '../stores/todayStore'
import type { BreakPeriod } from '@/domain/breaks/entities/BreakPeriod'

const COMPOUND_IDS = ['p1_squat', 'p1_bench', 'p1_row', 'p1_ohp', 'p1_rdl']
const COMPOUND_LABELS: Record<string, string> = {
  p1_squat: 'Squat',
  p1_bench: 'Bench',
  p1_row: 'Row',
  p1_ohp: 'OHP',
  p1_rdl: 'RDL',
}

export function Settings() {
  const [settings, setSettings] = useState<S>(SettingsStorage.load())
  const [activeBreak, setActiveBreak] = useState<BreakPeriod | null>(null)
  const [allBreaks, setAllBreaks] = useState<BreakPeriod[]>([])
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseReason, setPauseReason] = useState<BreakReason | null>(null)
  const reload = useTodayStore(s => s.load)
  const nav = useNavigate()

  useEffect(() => {
    void breakRepo.getActive().then(setActiveBreak)
    void breakRepo.getAll().then(setAllBreaks)
  }, [])

  const calendar = new PhaseCalendar(allBreaks)
  const info = calendar.currentInfo()
  const phaseName = PHASES[info.phase].name

  const update = (patch: Partial<S>) => {
    const next = SettingsStorage.patch(patch)
    setSettings(next)
  }

  const onStartBreak = async () => {
    const period = await startBreak(pauseReason)
    setActiveBreak(period)
    setAllBreaks(await breakRepo.getAll())
    setPauseOpen(false)
    setPauseReason(null)
    void reload()
  }

  const onResume = async () => {
    await resumeBreak()
    setActiveBreak(null)
    setAllBreaks(await breakRepo.getAll())
    void reload()
  }

  return (
    <div className="screen px-md pt-md space-y-lg">
      <h1 className="font-display font-semibold text-display-lg uppercase">Settings</h1>

      <section className="space-y-md">
        <div className="label-caps">Plan</div>
        <div className="card space-y-1">
          <Row k="Plan started" v={format(PLAN_START_DATE, 'MMM d, yyyy')} />
          <Row k="Current status" v={`${phaseName} · Phase ${phaseNumber(info.phase)} · Week ${info.weekInPhase}`} />
          <Row k="Projected end" v={format(calendar.projectedEndDate(), 'MMM d, yyyy')} />
        </div>

        {activeBreak ? (
          <button onClick={onResume} className="btn-primary">Resume plan</button>
        ) : (
          <button onClick={() => setPauseOpen(true)} className="btn-secondary">Pause plan</button>
        )}

        <button onClick={() => nav('/settings/backfill')} className="btn-secondary">
          Backfill past sessions
        </button>
      </section>

      <section className="space-y-md">
        <div className="label-caps">Starting weights</div>
        <div className="card space-y-2">
          {COMPOUND_IDS.map(id => (
            <NumberInputRow
              key={id}
              label={COMPOUND_LABELS[id]}
              value={settings.startingWeights[id] ?? ''}
              onChange={(v) => {
                const next = { ...settings.startingWeights }
                if (v === '') delete next[id]
                else next[id] = v
                update({ startingWeights: next })
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <div className="label-caps">Preferences</div>
        <ToggleRow
          label="Vegetarian mode"
          value={settings.vegetarianMode}
          onChange={(v) => update({ vegetarianMode: v })}
        />
        <ToggleRow
          label="Finasteride logging"
          value={settings.finasterideEnabled}
          onChange={(v) => update({ finasterideEnabled: v })}
        />
      </section>

      <section className="space-y-md">
        <div className="label-caps">Breaks history</div>
        <div className="card">
          {allBreaks.length === 0 ? (
            <div className="text-text-secondary text-body-sm">No breaks yet.</div>
          ) : (
            allBreaks.map(b => (
              <div key={b.id} className="text-body-sm py-1">
                {b.startDate} → {b.endDate ?? 'ongoing'}{b.durationDays ? ` · ${b.durationDays}d` : ''}{b.reason ? ` · ${BREAK_REASONS[b.reason].emoji}` : ''}
              </div>
            ))
          )}
        </div>
      </section>

      <BottomSheet open={pauseOpen} onClose={() => setPauseOpen(false)} title="Pause plan?">
        <div className="text-body-md text-text-secondary mb-md">
          Your timeline pauses today and resumes exactly where you left off.
        </div>
        <div className="label-caps mb-2">Reason (optional)</div>
        <div className="flex flex-wrap gap-2 mb-lg">
          {(Object.entries(BREAK_REASONS) as [BreakReason, typeof BREAK_REASONS[BreakReason]][]).map(([k, info]) => (
            <ReasonChip
              key={k}
              emoji={info.emoji}
              label={info.label}
              selected={pauseReason === k}
              onClick={() => setPauseReason(k)}
            />
          ))}
        </div>
        <button onClick={onStartBreak} className="btn-primary">Start break</button>
      </BottomSheet>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-body-md">
      <span className="text-text-secondary">{k}</span>
      <span>{v}</span>
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="card w-full flex items-center justify-between active:scale-[0.99] transition-transform"
    >
      <span className="text-body-md">{label}</span>
      <span className={`w-12 h-7 rounded-full p-0.5 transition-colors ${value ? 'bg-accent' : 'bg-bg-input'}`}>
        <span className={`block w-6 h-6 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}

function NumberInputRow({ label, value, onChange }: { label: string; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <div className="flex items-center justify-between gap-md">
      <span className="text-body-md">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step="2.5"
        value={value === '' ? '' : value}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? '' : parseFloat(v))
        }}
        placeholder="—"
        className="w-28 h-10 rounded-card bg-bg-input px-3 font-mono text-mono-md text-text-primary text-right"
      />
    </div>
  )
}

function phaseNumber(p: string) {
  return p === 'PHASE_1' ? 1 : p === 'PHASE_2' ? 2 : 3
}
