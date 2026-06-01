import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { FiAlertTriangle, FiAward, FiChevronRight, FiFileText, FiLogOut } from 'react-icons/fi'
import { portalSubtitleForRole } from '../constants/userRoles'
import { useTdr } from '../context/useTdr'

const navGroups: { id: string; label: string; items: { to: string; label: string; icon: IconType }[] }[] = [
  {
    id: 'tdr',
    label: 'TDR Management',
    items: [
      { to: '/dashboard/apply', label: 'TDR Applications', icon: FiFileText },
      // { to: '/dashboard/transfer', label: 'TDR Transfer', icon: FiRepeat },
      { to: '/dashboard/certificates', label: 'DRC Certificates', icon: FiAward },
      // { to: '/dashboard/blockchain-api-reference', label: 'REST ↔ chain mapping', icon: FiBookOpen },
      { to: '/dashboard/tampered-data', label: 'Tampered Data', icon: FiAlertTriangle },
      // { to: '/dashboard/land-property', label: 'Land & Property', icon: FiMap },
      // { to: '/dashboard/owners', label: 'Owners', icon: FiUsers },
    ],
  },
  // {
  //   id: 'chain',
  //   label: 'Blockchain',
  //   items: [
  //     { to: '/dashboard/blockchain-records', label: 'Blockchain Records', icon: FiLayers },
  //     { to: '/dashboard/transactions', label: 'Transactions', icon: FiActivity },
  //     { to: '/dashboard/smart-contracts', label: 'Smart Contracts', icon: FiCode },
  //     { to: '/dashboard/channels', label: 'Channels', icon: FiGitBranch },
  //     { to: '/dashboard/peers', label: 'Peers', icon: FiCpu },
  //   ],
  // },
  // {
  //   id: 'reports',
  //   label: 'Reports & Analytics',
  //   items: [
  //     { to: '/dashboard/analytics', label: 'Analytics', icon: FiPieChart },
  //     { to: '/dashboard/reports', label: 'Reports', icon: FiBarChart2 },
  //     { to: '/dashboard/audit-logs', label: 'Audit Logs', icon: FiShield },
  //   ],
  // },
  // {
  //   id: 'system',
  //   label: 'System Settings',
  //   items: [
  //     { to: '/dashboard/users-roles', label: 'Users & Roles', icon: FiUserCheck },
  //     { to: '/dashboard/departments', label: 'Departments', icon: FiGrid },
  //     { to: '/dashboard/site-settings', label: 'System Settings', icon: FiSettings },
  //   ],
  // },1
]

function defaultOpenState() {
  const s: Record<string, boolean> = { tdr: true, chain: true, reports: true, system: true }
  return s
}

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate()
  const { role, signOut } = useTdr()
  const [open, setOpen] = useState(defaultOpenState)

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  const linkClass = (isActive: boolean, inset: boolean) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${collapsed ? 'justify-center px-2' : ''} ${isActive
      ? 'bg-[#1890ff] font-medium text-white shadow-sm'
      : `text-white/85 hover:bg-white/10 hover:text-white ${inset ? 'pl-4' : ''}`
    }`

  return (
    <aside className="flex h-full w-full flex-col bg-[#001529] text-white">
      <div
        className={`flex items-center gap-3 border-b border-white/10 px-4 py-5 ${collapsed ? 'flex-col gap-2 px-2' : ''}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-[#002140] text-sm font-bold tracking-tight">
          TDR
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase leading-tight text-white/90">TDR BLOCKCHAIN</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/45">
              {portalSubtitleForRole(role)}
            </p>
          </div>
        ) : null}
      </div>

      <nav className="no-scrollbar flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {/* <NavLink
          to={DASH.to}
          end
          title={collapsed ? DASH.label : undefined}
          className={({ isActive }) => linkClass(isActive, false)}
        >
          <DASH.icon className="shrink-0 text-lg text-inherit" />
          {!collapsed ? <span>{DASH.label}</span> : null}
        </NavLink> */}

        {navGroups.map((group) => (
          <div key={group.id} className="pt-1">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggle(group.id)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/55 hover:text-white/80"
              >
                {group.label}
                <FiChevronRight
                  className={`text-sm transition ${open[group.id] ? 'rotate-90' : ''} text-white/40`}
                />
              </button>
            ) : (
              <div className="my-1 h-px bg-white/10" aria-hidden />
            )}

            {(collapsed || open[group.id]) &&
              group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => linkClass(isActive, !collapsed)}
                >
                  <item.icon className="shrink-0 text-base text-inherit" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/')
          }}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent px-3 py-2.5 text-sm font-medium text-white/90 transition hover:border-white/40 hover:bg-white/5 ${collapsed ? 'px-2' : ''}`}
        >
          <FiLogOut className="shrink-0" />
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </aside>
  )
}
