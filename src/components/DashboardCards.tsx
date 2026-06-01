import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiRepeat,
  FiTool,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

const stats: StatCard[] = [
  { label: 'Total Issued', value: 1245, trend: '+8.2%', icon: FiPackage },
  { label: 'Active', value: 980, trend: '+5.4%', icon: FiCheckCircle },
  { label: 'Transferred', value: 210, trend: '+2.1%', icon: FiRepeat },
  { label: 'Utilized', value: 55, trend: '+1.2%', icon: FiTool },
  { label: 'Pending', value: 34, trend: '-0.7%', icon: FiClock },
  { label: 'Revoked', value: 12, trend: '-0.3%', icon: FiAlertCircle },
]

interface StatCard {
  label: string
  value: number
  trend: string
  icon: IconType
}

export default function DashboardCards() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-2 flex items-center justify-between">
            <card.icon className="text-2xl text-indigo-600 dark:text-indigo-300" />
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Verified on Blockchain
            </span>
          </div>
          <p className="text-sm text-slate-500">{card.label}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-300">Trend {card.trend}</p>
        </article>
      ))}
    </section>
  )
}
