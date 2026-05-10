import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Today', icon: '🏠' },
  { to: '/progress', label: 'Progress', icon: '📊' },
  { to: '/history', label: 'History', icon: '🗓️' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export function TabBar() {
  const { pathname } = useLocation()
  // Hide tab bar in active session/summary screens.
  if (pathname.startsWith('/session/')) return null
  return (
    <nav className="tab-bar fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto bg-bg-surface border-t border-border-subtle">
      <div className="grid grid-cols-4 h-[60px]">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-accent' : 'text-text-secondary'
              }`
            }
          >
            <span className="text-[20px] leading-none">{tab.icon}</span>
            <span className="text-[10px] uppercase font-medium tracking-wider">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
