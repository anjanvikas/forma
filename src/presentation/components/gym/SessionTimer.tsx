import { useEffect, useState } from 'react'

export function SessionTimer({ start }: { start: string | null }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  if (!start) return <span className="font-mono text-mono-md">--:--</span>
  const elapsedMs = Date.now() - new Date(start).getTime()
  const total = Math.max(0, Math.floor(elapsedMs / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return (
    <span className="font-mono text-mono-md">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      <span className="ml-1 text-status-success">●</span>
    </span>
  )
}
