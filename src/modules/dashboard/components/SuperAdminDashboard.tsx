import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiFolder,
  FiLayers,
  FiMoreHorizontal,
  FiRefreshCw,
  FiXCircle,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTdrApplications } from '../../../context/TdrApplicationsContext'
import { getWorkflowStageById, resolveWorkflowStageId } from '../data/tdrWorkflowStages'

const CARD = 'rounded-lg border border-[#e8e8e8] bg-white shadow-sm'

const summaryCards = [
  {
    label: 'Total TDR Applications',
    to: '/dashboard/metrics/total-tdr-applications',
    value: '12,458',
    trend: '12.5%',
    trendDir: 'up' as const,
    trendTone: 'green' as const,
    icon: FiFolder,
    iconWrap: 'bg-[#e6f7ff] text-[#1890ff]',
  },
  {
    label: 'Approved TDRs',
    to: '/dashboard/metrics/approved-tdrs',
    value: '8,742',
    trend: '15.3%',
    trendDir: 'up' as const,
    trendTone: 'green' as const,
    icon: FiCheckCircle,
    iconWrap: 'bg-[#f6ffed] text-[#52c41a]',
  },
  {
    label: 'Pending Applications',
    to: '/dashboard/metrics/pending-applications',
    value: '2,153',
    trend: '5.7%',
    trendDir: 'up' as const,
    trendTone: 'orange' as const,
    icon: FiClock,
    iconWrap: 'bg-[#fff7e6] text-[#fa8c16]',
  },
  {
    label: 'Rejected Applications',
    to: '/dashboard/metrics/rejected-applications',
    value: '1,563',
    trend: '3.2%',
    trendDir: 'down' as const,
    trendTone: 'red' as const,
    icon: FiXCircle,
    iconWrap: 'bg-[#f9f0ff] text-[#722ed1]',
  },
  {
    label: 'TDR Value Transferred',
    to: '/dashboard/metrics/tdr-value-transferred',
    value: '₹ 1,245.75 Cr',
    trend: '18.6%',
    trendDir: 'up' as const,
    trendTone: 'green' as const,
    icon: FiDatabase,
    iconWrap: 'bg-[#e6fffb] text-[#13c2c2]',
  },
  {
    label: 'On-Chain Records',
    to: '/dashboard/metrics/on-chain-records',
    value: '24,856',
    trend: '20.4%',
    trendDir: 'up' as const,
    trendTone: 'green' as const,
    icon: FiLayers,
    iconWrap: 'bg-[#f9f0ff] text-[#722ed1]',
  },
]

const applicationStatusDonut = [
  { name: 'Approved', value: 70.15, color: '#52c41a' },
  { name: 'Pending', value: 17.28, color: '#fa8c16' },
  { name: 'Rejected', value: 12.57, color: '#ff4d4f' },
]

const tdrValueLine = [
  { day: 'May 01', total: 42, transferred: 38, remaining: 12 },
  { day: 'May 05', total: 48, transferred: 44, remaining: 14 },
  { day: 'May 10', total: 55, transferred: 50, remaining: 15 },
  { day: 'May 15', total: 62, transferred: 58, remaining: 16 },
  { day: 'May 20', total: 71, transferred: 66, remaining: 18 },
]

const networkStatus = [
  { label: 'Channel Name', value: 'tdr-channel', ok: true },
  { label: 'Orderer Status', value: 'Running', ok: true },
  { label: 'Peer Nodes', value: '6 Active', ok: true },
  { label: 'Network Height', value: '1,24,580', ok: true },
  { label: 'Average Block Time', value: '2.35 sec', ok: true },
  { label: 'Last Block Created', value: '20 May 2025, 11:28:42 AM', ok: true },
]

const recentTx = [
  {
    txId: 'TX-9f2a...c81',
    tdrId: 'TDR-2025-08821',
    type: 'Transfer',
    value: '12.45',
    status: 'Success',
    time: '11:24 AM',
  },
  {
    txId: 'TX-3b71...9ee',
    tdrId: 'TDR-2025-08807',
    type: 'Issue',
    value: '8.20',
    status: 'Success',
    time: '11:18 AM',
  },
  {
    txId: 'TX-5cd0...2aa',
    tdrId: 'TDR-2025-08792',
    type: 'Transfer',
    value: '25.00',
    status: 'Success',
    time: '11:02 AM',
  },
  {
    txId: 'TX-8aa1...45f',
    tdrId: 'TDR-2025-08765',
    type: 'Utilization',
    value: '5.75',
    status: 'Success',
    time: '10:48 AM',
  },
]

const districtBars = [
  { name: 'Indore', value: 320.45, fill: '#1890ff' },
  { name: 'Bhopal', value: 285.2, fill: '#52c41a' },
  { name: 'Jabalpur', value: 242.8, fill: '#fa8c16' },
  { name: 'Gwalior', value: 198.5, fill: '#722ed1' },
  { name: 'Ujjain', value: 165.3, fill: '#13c2c2' },
]

const smartContractCalls = [
  { name: 'createTDRTransaction()', calls: 4256 },
  { name: 'transferTDR()', calls: 3182 },
  { name: 'verifyCertificate()', calls: 2755 },
  { name: 'recordUtilization()', calls: 1940 },
  { name: 'updateMetadata()', calls: 1288 },
]

const onChainDonut = [
  { name: 'On-Chain Value', value: 79.32, color: '#1890ff' },
  { name: 'Off-Chain Value', value: 20.68, color: '#fa8c16' },
]

function statusBadge(status: string) {
  if (status === 'Approved') return 'bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]'
  if (status === 'Pending') return 'bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]'
  if (status === 'Rejected') return 'bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]'
  if (status === 'Under Review') return 'bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]'
  if (status === 'DRC Issued') return 'bg-[#f9f0ff] text-[#722ed1] border border-[#d3adf7]'
  if (status === 'Draft') return 'bg-slate-100 text-slate-600 border border-[#e8e8e8]'
  return 'bg-slate-100 text-slate-700'
}

function formatAppliedShort(iso: string) {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function trendColor(tone: 'green' | 'orange' | 'red') {
  if (tone === 'green') return 'text-[#52c41a]'
  if (tone === 'orange') return 'text-[#fa8c16]'
  return 'text-[#ff4d4f]'
}

export default function SuperAdminDashboard() {
  const { applications } = useTdrApplications()
  const recentRows = useMemo(() => applications.slice(0, 6), [applications])
  const totalCalls = smartContractCalls.reduce((s, c) => s + c.calls, 0)

  return (
    <div className="space-y-4">
      {/* Row 1 — Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`${CARD} block p-4 text-left no-underline outline-none transition hover:-translate-y-0.5 hover:border-[#1890ff]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1890ff] focus-visible:ring-offset-2`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.iconWrap}`}>
                <card.icon className="text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-tight text-[#595959]">{card.label}</p>
                <p className="mt-1 text-lg font-bold leading-tight text-[#262626]">{card.value}</p>
                <p className={`mt-1 text-xs font-medium ${trendColor(card.trendTone)}`}>
                  {card.trendDir === 'up' ? '▲' : '▼'} {card.trend} vs last period
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Row 2 — Donut, Line, Network */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`${CARD} p-4 xl:col-span-1`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#262626]">TDR Application Status</h3>
            <select className="rounded border border-[#d9d9d9] bg-white px-2 py-1 text-xs text-[#595959]">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex flex-col items-stretch gap-2 lg:flex-row">
            <div className="relative h-[220px] flex-1 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {applicationStatusDonut.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value ?? ''}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center pr-0 lg:pr-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#262626]">12,458</p>
                  <p className="text-xs text-[#8c8c8c]">Total</p>
                </div>
              </div>
            </div>
            <ul className="flex shrink-0 flex-col justify-center gap-2 text-xs lg:w-[140px]">
              {applicationStatusDonut.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[#595959]">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-semibold text-[#262626]">{s.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`${CARD} p-4 xl:col-span-1`}>
          <div className="mb-2 text-xs text-[#595959]">
            <span className="font-semibold text-[#262626]">Total TDR Value</span>
            {' · '}
            <span>Transferred Value (On-Chain)</span>
            {' · '}
            <span>Remaining Value (Off-Chain)</span>
          </div>
          <h3 className="mb-2 text-sm font-semibold text-[#262626]">TDR Value Overview</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tdrValueLine} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <YAxis tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <Tooltip />
                <Line type="monotone" dataKey="total" name="Total TDR Value" stroke="#1890ff" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="transferred"
                  name="Transferred (On-Chain)"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="remaining"
                  name="Remaining (Off-Chain)"
                  stroke="#fa8c16"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${CARD} p-4 xl:col-span-1`}>
          <h3 className="mb-3 text-sm font-semibold text-[#262626]">Blockchain Network Status</h3>
          <ul className="space-y-2.5 text-sm">
            {networkStatus.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between border-b border-[#f0f0f0] pb-2 last:border-0 last:pb-0"
              >
                <span className="text-[#595959]">{row.label}</span>
                <span className={row.ok ? 'font-medium text-[#52c41a]' : 'text-[#262626]'}>{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Row 3 — Transactions, Districts, Smart contracts */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className={`${CARD} p-4 xl:col-span-5`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#262626]">Recent TDR Transactions</h3>
            <button type="button" className="text-xs font-medium text-[#1890ff] hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-left text-[#8c8c8c]">
                  <th className="pb-2 pr-2 font-medium">TX ID</th>
                  <th className="pb-2 pr-2 font-medium">TDR ID</th>
                  <th className="pb-2 pr-2 font-medium">Type</th>
                  <th className="pb-2 pr-2 text-right font-medium">Value (₹ Cr)</th>
                  <th className="pb-2 pr-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((row) => (
                  <tr key={row.txId} className="border-b border-[#fafafa]">
                    <td className="py-2 pr-2">
                      <span className="cursor-pointer font-medium text-[#1890ff]">{row.txId}</span>
                    </td>
                    <td className="py-2 pr-2 text-[#262626]">{row.tdrId}</td>
                    <td className="py-2 pr-2 text-[#595959]">{row.type}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[#262626]">{row.value}</td>
                    <td className="py-2 pr-2">
                      <span className="inline-flex items-center gap-1 font-medium text-[#52c41a]">
                        <FiCheckCircle className="text-sm" /> {row.status}
                      </span>
                    </td>
                    <td className="py-2 text-[#8c8c8c]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${CARD} p-4 xl:col-span-4`}>
          <h3 className="mb-3 text-sm font-semibold text-[#262626]">Top 5 Districts by TDR Value</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtBars} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <YAxis tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <Tooltip formatter={(value) => [`${value ?? ''} Cr`, 'Value']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#595959' }}>
                  {districtBars.map((e) => (
                    <Cell key={e.name} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${CARD} p-4 xl:col-span-3`}>
          <h3 className="mb-3 text-sm font-semibold text-[#262626]">Smart Contract Calls</h3>
          <ul className="space-y-2 text-xs">
            {smartContractCalls.map((row) => (
              <li
                key={row.name}
                className="flex items-center justify-between gap-2 border-b border-[#f5f5f5] py-1.5 last:border-0"
              >
                <code className="truncate text-[11px] text-[#595959]">{row.name}</code>
                <span className="shrink-0 font-semibold tabular-nums text-[#262626]">
                  {row.calls.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-3 text-xs">
            <span className="text-[#8c8c8c]">Total Calls</span>
            <span className="font-bold text-[#1890ff]">{totalCalls.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Row 4 — Applications table + On-chain donut */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className={`${CARD} p-4 xl:col-span-8`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#262626]">Recent TDR Applications</h3>
            <Link to="/dashboard/apply" className="text-xs font-medium text-[#1890ff] hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#d9d9d9]">
            <table className="min-w-[920px] w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#fafafa] text-left text-[#595959]">
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Application ID</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Applicant</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">District</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Land use</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">TDR value</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Status</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Workflow gate</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Officer at gate</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold">Applied</th>
                  <th className="border border-[#d9d9d9] px-2 py-2 font-semibold w-10" />
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => {
                  const wfId = resolveWorkflowStageId(row)
                  const wf = getWorkflowStageById(wfId)
                  return (
                    <tr key={row.id} className="hover:bg-[#fafafa]">
                      <td className="border border-[#d9d9d9] px-2 py-2">
                        <Link to={`/dashboard/apply/${encodeURIComponent(row.id)}`} className="font-mono font-medium text-[#1890ff] hover:underline">
                          {row.id}
                        </Link>
                      </td>
                      <td className="border border-[#d9d9d9] px-2 py-2 font-medium text-[#262626]">{row.applicantName}</td>
                      <td className="border border-[#d9d9d9] px-2 py-2 text-[#595959]">{row.district}</td>
                      <td className="border border-[#d9d9d9] px-2 py-2 text-[#595959]">{row.landUse}</td>
                      <td className="border border-[#d9d9d9] px-2 py-2 tabular-nums text-[#262626]">₹ {row.tdrValueCr.toFixed(2)} Cr</td>
                      <td className="border border-[#d9d9d9] px-2 py-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="border border-[#d9d9d9] px-2 py-2 max-w-[140px]">
                        <span className="font-medium text-[#262626]">{wf?.shortLabel ?? wfId}</span>
                        <p className="mt-0.5 text-[10px] leading-snug text-[#8c8c8c] line-clamp-2">{wf?.label}</p>
                      </td>
                      <td className="border border-[#d9d9d9] px-2 py-2 max-w-[160px] text-[#595959] leading-snug">{wf?.officerAtGate ?? '—'}</td>
                      <td className="border border-[#d9d9d9] px-2 py-2 whitespace-nowrap text-[#8c8c8c]">{formatAppliedShort(row.appliedOn)}</td>
                      <td className="border border-[#d9d9d9] px-2 py-2 text-center">
                        <button type="button" className="text-[#8c8c8c] hover:text-[#262626]" aria-label="Actions">
                          <FiMoreHorizontal className="inline" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${CARD} p-4 xl:col-span-4`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#262626]">On-Chain vs Off-Chain</h3>
            <FiRefreshCw className="text-[#8c8c8c]" aria-hidden />
          </div>
          <div className="relative mx-auto h-[220px] max-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={onChainDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {onChainDonut.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value ?? ''}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-bold text-[#1890ff]">79.3%</p>
                <p className="text-xs text-[#8c8c8c]">On-Chain</p>
              </div>
            </div>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {onChainDonut.map((s) => (
              <li key={s.name} className="flex justify-between text-[#595959]">
                <span>{s.name}</span>
                <span className="font-semibold text-[#262626]">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
