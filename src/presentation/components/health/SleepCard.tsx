import { useState } from 'react'
import { BottomSheet } from '../shared/BottomSheet'
import { logSleep } from '@/application/health/healthUseCases'
import { useTodayStore } from '@/presentation/stores/todayStore'
import type { SleepLog } from '@/domain/health/entities/health'

export function SleepCard() {
  const [open, setOpen] = useState(false)
  const [bedtime, setBedtime] = useState('21:30')
  const [wakeTime, setWakeTime] = useState('05:00')
  const sleep = useTodayStore(s => s.sleep)
  const setSleep = useTodayStore(s => s.setSleep)

  const onSave = async () => {
    const log = await logSleep(bedtime, wakeTime)
    setSleep(log)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left card relative overflow-hidden active:scale-[0.99] transition-transform"
      >
        {sleep && (
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${sleep.ruleMetBedtime && sleep.ruleMetDuration ? 'bg-status-success' : 'bg-status-warning'}`} />
        )}
        <div className={sleep ? 'pl-2' : ''}>
          <div className="label-caps">😴 Sleep</div>
          {!sleep ? (
            <div className="text-body-md mt-1">Log last night's sleep →</div>
          ) : (
            <SleepDetails sleep={sleep} />
          )}
        </div>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Log sleep">
        <div className="grid grid-cols-2 gap-md">
          <TimeField label="Bedtime" value={bedtime} onChange={setBedtime} />
          <TimeField label="Wake time" value={wakeTime} onChange={setWakeTime} />
        </div>
        <button onClick={onSave} className="btn-primary mt-lg">Save</button>
      </BottomSheet>
    </>
  )
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label-caps">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-card bg-bg-input px-3 font-mono text-mono-md text-text-primary"
      />
    </label>
  )
}

function SleepDetails({ sleep }: { sleep: SleepLog }) {
  const h = Math.floor(sleep.durationMinutes / 60)
  const m = sleep.durationMinutes % 60
  const ok = sleep.ruleMetBedtime && sleep.ruleMetDuration
  return (
    <div className="mt-1">
      <div className="font-mono text-mono-md">
        {sleep.bedtime} → {sleep.wakeTime} · {h}h {m}m
      </div>
      <div className={`text-body-sm mt-1 ${ok ? 'text-status-success' : 'text-status-warning'}`}>
        {ok ? '✅ Rule met' : '⚠️ Below target'}
      </div>
    </div>
  )
}
