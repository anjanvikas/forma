import { Navigate, Route, Routes } from 'react-router-dom'
import { TabBar } from './presentation/components/layout/TabBar'
import { Today } from './presentation/pages/Today'
import { ActiveSession } from './presentation/pages/ActiveSession'
import { SessionSummary } from './presentation/pages/SessionSummary'
import { Progress } from './presentation/pages/Progress'
import { History } from './presentation/pages/History'
import { Settings } from './presentation/pages/Settings'
import { Backfill } from './presentation/pages/Backfill'

export default function App() {
  return (
    <div className="relative h-full max-w-[440px] mx-auto bg-bg-base">
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/backfill" element={<Backfill />} />
        <Route path="/session/active" element={<ActiveSession />} />
        <Route path="/session/summary" element={<SessionSummary />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
    </div>
  )
}
