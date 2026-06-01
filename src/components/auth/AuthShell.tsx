import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  title: string
  activeTab: 'login' | 'register' | 'forgot'
  children: ReactNode
}

export default function AuthShell({ title, activeTab, children }: AuthShellProps) {
  const tabClass = (isActive: boolean) =>
    `rounded-md px-3 py-2 text-xs font-semibold transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-gray-300 text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 p-4">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-xl border border-slate-200 bg-white/95 p-5 shadow-xl">
          <div className="mb-4 text-center">
            
            <h1 className="text-2xl font-bold text-slate-700">TDR BLOCKCHAIN</h1>
            <p className="text-xs text-slate-500">Single Sign-On Service</p>
          </div>

          <h2 className="mb-3 text-center text-sm font-semibold text-slate-700">{title}</h2>
          <div className="mb-4 grid grid-cols-2  gap-2">
            <Link to="/" className={tabClass(activeTab === 'login')}>
              Login
            </Link>
            <Link to="/signup" className={tabClass(activeTab === 'register')}>
              Register
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
