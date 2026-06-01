import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Navbar, Sidebar } from '../components'
import { useTdr } from '../../../context/useTdr'

export default function DashboardLayout() {
  const { toasts, dismissToast } = useTdr()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHoverOpen, setSidebarHoverOpen] = useState(false)
  const isSidebarExpanded = sidebarOpen || sidebarHoverOpen

  return (
    <div>
      <div className="min-h-screen bg-[#f0f2f5] text-[#262626]">
        {sidebarOpen ? (
          <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        ) : null}

        <aside
          onMouseEnter={() => {
            if (!sidebarOpen) setSidebarHoverOpen(true)
          }}
          onMouseLeave={() => {
            if (!sidebarOpen) setSidebarHoverOpen(false)
          }}
          className={`fixed left-0 top-0 z-30 h-screen transition-all duration-200 ${isSidebarExpanded ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}`}
        >
          <Sidebar collapsed={!isSidebarExpanded} />
        </aside>

        <div className={isSidebarExpanded ? 'lg:pl-72' : 'lg:pl-20'}>
          <div className={`fixed left-0 right-0 top-0 z-20 ${isSidebarExpanded ? 'lg:left-72' : 'lg:left-20'}`}>
            <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} isSidebarOpen={sidebarOpen} />
          </div>
          <div className="px-4 pb-8 pt-[7rem] lg:px-6">
            <main className="mx-auto max-w-[1600px]">
              <Outlet />
            </main>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 z-30 space-y-2">
          {toasts.map((toast) => (
            <button
              key={toast.id}
              onClick={() => dismissToast(toast.id)}
              className="block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow hover:bg-slate-700"
            >
              {toast.message}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
