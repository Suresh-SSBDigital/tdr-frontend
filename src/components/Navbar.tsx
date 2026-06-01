import { useCallback, useEffect, useState } from 'react'
import { FiBell, FiMaximize, FiMenu, FiSearch } from 'react-icons/fi'
import { dashboardTitleForRole, USER_ROLE_LABELS } from '../constants/userRoles'
import { useTdr } from '../context/useTdr'

interface NavbarProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

function formatHeaderDate(d: Date) {
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function Navbar({ onMenuClick, isSidebarOpen }: NavbarProps) {
  const { globalSearch, setGlobalSearch, role, userProfile } = useTdr()
  const [now, setNow] = useState(() => new Date())
  const [lastUpdated, setLastUpdated] = useState('Just now')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const refresh = useCallback(() => {
    setLastUpdated('Just now')
    setNow(new Date())
  }, [])

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }, [])

  const profileName = userProfile?.name?.trim() || USER_ROLE_LABELS[role]
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

  return (
    <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-40 transition-all">
      <header className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FiMenu className="text-xl" />
          </button>
          <div className="hidden md:block">
            <h1 className="truncate text-base font-bold text-slate-800 tracking-tight">{dashboardTitleForRole(role)}</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Enterprise Portal</p>
          </div>
        </div>

        <div className="mx-4 hidden min-w-0 flex-1 md:flex">
          <div className="relative mx-auto w-full max-w-2xl">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search across TDRs, Transactions, or RIDs..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
               <span className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm">⌘K</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:gap-4">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <FiBell className="text-xl" />
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <button
            type="button"
            onClick={toggleFs}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            aria-label="Full screen"
          >
            <FiMaximize className="text-xl" />
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1 hidden lg:block"></div>

          <div className="flex items-center gap-3 pl-1 lg:pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="hidden min-w-0 md:block text-right">
              <p className="truncate text-sm font-bold text-slate-800 leading-tight">{profileName}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{USER_ROLE_LABELS[role]}</p>
            </div>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-center text-sm font-bold flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-white/20">
              {profileInitials || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header status bar */}
      <div className="flex h-8 flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-4 text-[11px] font-semibold text-slate-500 lg:px-8">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
           <span>Blockchain Network Status: <strong className="text-emerald-600">Online & Synced</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <time dateTime={now.toISOString()} className="hidden sm:block">{formatHeaderDate(now)}</time>
          <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <span>Last Updated: {lastUpdated}</span>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-slate-200 hover:text-slate-900"
              aria-label="Refresh"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
