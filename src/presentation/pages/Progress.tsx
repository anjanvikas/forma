import { useEffect, useState } from 'react'
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar,
} from 'recharts'
import {
  getWeekSummary,
  getCompoundProgression,
  getBodyWeightSeries,
  getDeviationBreakdown,
  type WeekSummary,
  type CompoundLiftSeries,
} from '@/application/progress/progressUseCases'
import { GYM_REASONS } from '@/constants/deviationReasons'

export function Progress() {
  const [tab, setTab] = useState<'week' | 'month'>('week')
  const [week, setWeek] = useState<WeekSummary | null>(null)
  const [compounds, setCompounds] = useState<CompoundLiftSeries[]>([])
  const [bodyWeights, setBodyWeights] = useState<{ date: string; weightKg: number }[]>([])
  const [deviations, setDeviations] = useState<{ reason: string; count: number; pct: number }[]>([])

  useEffect(() => {
    void getWeekSummary().then(setWeek)
    void getCompoundProgression().then(setCompounds)
    void getBodyWeightSeries().then(setBodyWeights)
    void getDeviationBreakdown().then(d => setDeviations(d.map(x => ({ ...x, reason: x.reason }))))
  }, [])

  return (
    <div className="screen px-md pt-md space-y-md">
      <h1 className="font-display font-semibold text-display-lg uppercase">Progress</h1>
      <div className="flex bg-bg-surface rounded-card p-1 border border-border-subtle">
        {(['week', 'month'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-card font-display uppercase tracking-wider text-body-sm ${
              tab === t ? 'bg-accent text-text-inverse' : 'text-text-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'week' && week && <WeeklyView w={week} />}
      {tab === 'month' && (
        <MonthlyView compounds={compounds} bodyWeights={bodyWeights} deviations={deviations} />
      )}
    </div>
  )
}

function WeeklyView({ w }: { w: WeekSummary }) {
  return (
    <div className="space-y-md">
      <div className="text-body-sm text-text-secondary">Week of {w.weekStart} – {w.weekEnd}</div>

      <div className="card">
        <div className="label-caps">Gym</div>
        <div className="mt-2 text-body-md">
          Sessions: <span className="font-mono">{w.sessionsCompleted}/{w.sessionsPlanned}</span>
        </div>
        <div className="text-body-md">
          Sets as planned: <span className="font-mono">{w.setsAsPlannedPct}%</span>
        </div>
        {w.topReason && (
          <div className="text-body-md text-text-secondary">
            Top reason: {GYM_REASONS[w.topReason as keyof typeof GYM_REASONS].emoji} {GYM_REASONS[w.topReason as keyof typeof GYM_REASONS].label}
          </div>
        )}
      </div>

      <div className="card">
        <div className="label-caps">Food</div>
        <div className="mt-2 text-body-md">
          Meals logged: <span className="font-mono">{w.mealsLoggedPct}%</span>
        </div>
        <div className="text-body-md">
          Avg target protein: <span className="font-mono">{w.avgProtein}g</span>
        </div>
        <div className="text-body-md">
          Avg target calories: <span className="font-mono">{w.avgCalories}</span>
        </div>
      </div>

      <div className="card">
        <div className="label-caps">Sleep & protocol</div>
        <div className="mt-2 text-body-md">
          Avg sleep: <span className="font-mono">{Math.floor(w.avgSleepMinutes / 60)}h {w.avgSleepMinutes % 60}m</span>
        </div>
        <div className="text-body-md">
          Hair protocol: <span className="font-mono">{w.protocolCompliancePct}%</span>
        </div>
        {w.bodyWeight && (
          <div className="text-body-md">
            Mon weight: <span className="font-mono">{w.bodyWeight.toFixed(1)} kg</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MonthlyView({
  compounds, bodyWeights, deviations,
}: {
  compounds: CompoundLiftSeries[]
  bodyWeights: { date: string; weightKg: number }[]
  deviations: { reason: string; count: number; pct: number }[]
}) {
  return (
    <div className="space-y-md">
      <div className="card">
        <div className="label-caps mb-md">Compound progression</div>
        {compounds.length === 0 ? (
          <div className="text-text-secondary text-body-sm">No completed sessions yet.</div>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergeSeries(compounds)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
                <XAxis dataKey="date" stroke="#8A8A8A" fontSize={10} />
                <YAxis stroke="#8A8A8A" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1F1F1F', border: '1px solid #2E2E2E' }} />
                {compounds.map((c, i) => (
                  <Line key={c.exerciseId} type="monotone" dataKey={c.exerciseId} name={c.exerciseName} stroke={LIFT_COLORS[i % LIFT_COLORS.length]} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        <div className="label-caps mb-md">Body weight</div>
        {bodyWeights.length === 0 ? (
          <div className="text-text-secondary text-body-sm">No weigh-ins yet.</div>
        ) : (
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyWeights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
                <XAxis dataKey="date" stroke="#8A8A8A" fontSize={10} />
                <YAxis stroke="#8A8A8A" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ background: '#1F1F1F', border: '1px solid #2E2E2E' }} />
                <Line type="monotone" dataKey="weightKg" stroke="#C8FF00" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        <div className="label-caps mb-md">Deviation breakdown</div>
        {deviations.length === 0 ? (
          <div className="text-text-secondary text-body-sm">No deviations logged.</div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviations} layout="vertical">
                <XAxis type="number" stroke="#8A8A8A" fontSize={10} />
                <YAxis
                  dataKey="reason"
                  type="category"
                  tickFormatter={r => GYM_REASONS[r as keyof typeof GYM_REASONS]?.emoji ?? r}
                  stroke="#8A8A8A"
                  fontSize={12}
                  width={28}
                />
                <Tooltip contentStyle={{ background: '#1F1F1F', border: '1px solid #2E2E2E' }} />
                <Bar dataKey="count" fill="#FF6B35" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

const LIFT_COLORS = ['#C8FF00', '#00C853', '#FFB300', '#FF6B35', '#00E676', '#3D7CFF']

function mergeSeries(series: CompoundLiftSeries[]): Array<Record<string, string | number>> {
  const map = new Map<string, Record<string, string | number>>()
  for (const s of series) {
    for (const p of s.points) {
      const row = map.get(p.date) ?? { date: p.date }
      row[s.exerciseId] = p.weightKg
      map.set(p.date, row)
    }
  }
  return [...map.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)))
}
