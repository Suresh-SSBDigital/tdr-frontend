import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiCopy, FiDownload, FiFileText, FiSend, FiUsers } from 'react-icons/fi'
import { HiOutlineCurrencyRupee } from 'react-icons/hi2'
import { TbTopologyStar3 } from 'react-icons/tb'
import type { ReactFlowInstance } from '@xyflow/react'
import { apiUrl } from '../../../api/http'
import {
  computeRidStats,
  RID_HISTORY_TABS,
  type RidHistoryResponse,
  type RidHistoryTabId,
} from '../helpers/ridHistoryTree'
import { copyText, n } from './totalHistory/format'
import {
  AllTransactionsTab,
  LedgerTab,
  OverviewTab,
  TransfersTab,
  UtilizationsTab,
} from './totalHistory/tabPanels'
import TreeTab from './totalHistory/TreeTab'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

function formatDateTime(v?: string) {
  if (!v) return '—'
  const dt = new Date(v)
  if (Number.isNaN(dt.getTime())) return v
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TabBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-[#f0f5ff] px-1.5 py-0.5 text-[10px] font-bold text-[#1890ff]">
      {count}
    </span>
  )
}

function MetaChip({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#eef2f7] bg-white px-3 py-1.5 shadow-sm">
      <span className="text-lg text-[#1890ff]">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase text-[#8c9ab5]">{label}</p>
        <p className="font-mono text-xs font-bold text-[#1c2b4a]">{value}</p>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#eef2f7] bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className={`rounded-lg p-2.5 text-xl ${iconBg} ${iconColor}`}>{icon}</div>
      <div>
        <p className="mb-1 text-xs font-bold text-[#8c9ab5]">{label}</p>
        <p className="text-xl font-bold text-[#1c2b4a]">{value}</p>
        <p className="mt-1 text-[11px] text-[#8c9ab5]">{sub}</p>
      </div>
    </div>
  )
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'danger' | 'muted'
}) {
  const toneClasses = {
    success: 'border-[#b7eb8f] bg-[#f6ffed] text-[#389e0d]',
    warning: 'border-[#ffe7ba] bg-[#fff7e6] text-[#d46b08]',
    danger: 'border-[#ffa39e] bg-[#fff1f0] text-[#cf1322]',
    muted: 'border-[#d6e4ff] bg-[#f5f7ff] text-[#1c2b4a]',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#475569]">{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  )
}

function parseTab(value: string | null): RidHistoryTabId {
  const valid: RidHistoryTabId[] = ['overview', 'tree', 'all', 'utilizations', 'transfers', 'ledger']
  if (value && valid.includes(value as RidHistoryTabId)) return value as RidHistoryTabId
  return 'tree'
}

export default function TotalHistoryTreePage() {
  const { applicationId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const rid = searchParams.get('rid')?.trim() ?? ''
  const activeTab = parseTab(searchParams.get('tab'))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<RidHistoryResponse | null>(null)
  const [hideUtilizations, setHideUtilizations] = useState(false)
  const [rfApi, setRfApi] = useState<Pick<ReactFlowInstance, 'fitView' | 'zoomIn' | 'zoomOut'> | null>(
    null,
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'transfer' | 'utilization'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'created' | 'pending' | 'verified' | 'tampered'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const normalizeSearch = (value?: string | number) => String(value ?? '').trim().toLowerCase()

  const filteredHistoryData = useMemo(() => {
    if (!historyData?.applications) return historyData

    const query = searchTerm.trim().toLowerCase()
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo) : null

    const applications = historyData.applications.filter((app) => {
      if (query) {
        const matchesCore =
          normalizeSearch(app.application_id).includes(query) ||
          normalizeSearch(app.samagra_id).includes(query) ||
          normalizeSearch(app.owner_name).includes(query) ||
          normalizeSearch(app.tdrApplicationId).includes(query)

        const matchesTx =
          (app.transfers ?? []).some((t) => normalizeSearch(t.txId).includes(query)) ||
          (app.utilizations ?? []).some((u) => normalizeSearch(u.txId).includes(query))

        if (!matchesCore && !matchesTx) return false
      }

      if (ownerFilter && !normalizeSearch(app.owner_name).includes(ownerFilter.trim().toLowerCase())) {
        return false
      }

      if (transactionFilter !== 'all') {
        const hasTransfer = (app.transfers?.length ?? 0) > 0
        const hasUtilization = (app.utilizations?.length ?? 0) > 0
        if (transactionFilter === 'transfer' && !hasTransfer) return false
        if (transactionFilter === 'utilization' && !hasUtilization) return false
      }

      if (statusFilter !== 'all' && app.status) {
        if (!normalizeSearch(app.status).includes(statusFilter)) return false
      }

      if (fromDate || toDate) {
        const eventDates = [
          ...(app.transfers ?? []).map((t) => new Date(String(t.trn_date ?? ''))),
          ...(app.utilizations ?? []).map((u) => new Date(String(u.utilization_date ?? ''))),
        ].filter((date) => !Number.isNaN(date.getTime()))

        if (eventDates.length === 0) return false

        const minDate = new Date(Math.min(...eventDates.map((date) => date.getTime())))
        const maxDate = new Date(Math.max(...eventDates.map((date) => date.getTime())))

        if (fromDate && maxDate < fromDate) return false
        if (toDate && minDate > toDate) return false
      }

      return true
    })

    return {
      ...historyData,
      applications,
    }
  }, [historyData, searchTerm, ownerFilter, transactionFilter, statusFilter, dateFrom, dateTo])

  const anchorPendingCount =
    filteredHistoryData?.applications?.filter((app) => (app.mongo_ledger?.length ?? 0) === 0).length ?? 0

  const syncStatus = historyData ? 'Live' : 'Pending'
  const syncTone = historyData ? 'success' : 'warning'

  const setTab = useCallback(
    (tab: RidHistoryTabId) => {
      const next = new URLSearchParams(searchParams)
      next.set('tab', tab)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!rid) {
        setError('RID is required to view total history.')
        setHistoryData(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const headers: Record<string, string> = {}
        if (API_KEY) headers['x-api-key'] = API_KEY

        const res = await fetch(apiUrl(`/api/tdr/rid/${encodeURIComponent(rid)}/history`), { headers })
        if (!active) return

        if (!res.ok) {
          setError(`Could not load history (HTTP ${res.status}).`)
          setHistoryData(null)
          return
        }

        const json = (await res.json()) as RidHistoryResponse
        setHistoryData(json)
      } catch {
        if (active) {
          setError('Network error while loading total history.')
          setHistoryData(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [rid])

  const stats = useMemo(() => {
    if (!filteredHistoryData?.applications?.length) return null
    return computeRidStats(filteredHistoryData.applications)
  }, [filteredHistoryData])

  const displayApp = useMemo(() => {
    const apps = filteredHistoryData?.applications ?? []
    return apps.find((a) => a.application_id === applicationId) ?? stats?.root ?? apps[0]
  }, [filteredHistoryData, applicationId, stats])

  const titleId = displayApp?.tdrApplicationId ?? applicationId
  const displaySamagraId =
    displayApp?.samagra_id?.trim() || searchParams.get('samagra_id')?.trim() || '—'
  const displayOwner = displayApp?.owner_name ?? '—'
  const displayStatus = displayApp?.status ?? '—'
  const displayTotalTdr =
    displayApp?.total_tdr_value != null ? `₹ ${n(displayApp.total_tdr_value)}` : '—'
  const displayRemainingTdr =
    displayApp?.remaining_tdr_value != null ? `₹ ${n(displayApp.remaining_tdr_value)}` : '—'
  const displayArea = displayApp?.total_area != null ? n(displayApp.total_area) : '—'

  const handleFit = useCallback(() => {
    rfApi?.fitView({ padding: 0.25, duration: 400 })
  }, [rfApi])

  const tabCount = (key?: keyof NonNullable<typeof stats>) => {
    if (!stats || !key) return undefined
    return stats[key] as number
  }

  return (
    <div className="space-y-0 pb-4">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)]">
        {/* HEADER */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-[#0f172a] via-[#1e40af] to-[#312e81] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-blue-100">TDR Total History</p>
              <h1 className="mt-1 text-xl font-bold tracking-wide text-white">Application Overview</h1>
              <p className="mt-1 text-sm text-blue-100">Manage RID history & related transaction timeline</p>
            </div>

            <Link
              to="/dashboard/apply"
              className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur-md shadow-lg transition hover:bg-white/20"
            >
              <FiArrowLeft /> Back to Applications
            </Link>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#8c9ab5]">
              Application Overview
            </p>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-xl font-bold text-[#1c2b4a]">{titleId}</h1>
                <button
                  type="button"
                  onClick={() => void copyText(titleId)}
                  className="text-[#8c9ab5] hover:text-[#1890ff]"
                  aria-label="Copy application ID"
                >
                  <FiCopy />
                </button>
              </div>

              <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-[#eef2f7] bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-[#8c9ab5]">Owner</p>
                  <p className="mt-2 text-sm font-semibold text-[#1c2b4a]">{displayOwner}</p>
                </div>

                <div className="rounded-xl border border-[#eef2f7] bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-[#8c9ab5]">Samagra ID</p>
                  <p className="mt-2 font-mono text-sm font-semibold text-[#1c2b4a]">
                    {displaySamagraId}
                  </p>
                </div>

                <div className="rounded-xl border border-[#eef2f7] bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-[#8c9ab5]">Status</p>
                  <p className="mt-2 text-sm font-semibold text-[#1c2b4a]">{displayStatus}</p>
                </div>

                <div className="rounded-xl border border-[#eef2f7] bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-[#8c9ab5]">Value / Area</p>
                  <p className="mt-2 text-sm font-semibold text-[#1c2b4a]">
                    {displayTotalTdr} total
                    <br />
                    {displayRemainingTdr} remaining
                    <br />
                    Area: {displayArea}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stats ? (
              <>
                <MetaChip label="RID" value={rid} icon={<TbTopologyStar3 />} />
                <MetaChip label="Total Applications" value={String(stats.totalApps)} icon={<FiUsers />} />
                <MetaChip
                  label="Total TDR Value"
                  value={`₹ ${n(stats.totalValue)}`}
                  icon={<HiOutlineCurrencyRupee />}
                />
                <MetaChip
                  label="Last Updated"
                  value={formatDateTime(stats.lastUpdated)}
                  icon={<FiCalendar />}
                />
              </>
            ) : null}

            <button
              type="button"
              className="ml-1 inline-flex items-center gap-2 rounded-lg border border-[#d6e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#1c2b4a] shadow-sm transition hover:bg-[#f5f9ff]"
            >
              <FiDownload /> Export Report
            </button>
          </div>
        </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-[#dbeafe] bg-[#f8fbff] p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm text-[#475569]">
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="RID, Application ID, Samagra ID, Tx hash"
                className="w-full rounded-2xl border border-[#dbe3f7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#1890ff] focus:ring-2 focus:ring-[#91caff]/40"
              />
            </label>

            <label className="space-y-2 text-sm text-[#475569]">
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Owner</span>
              <input
                type="text"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                placeholder="Owner name"
                className="w-full rounded-2xl border border-[#dbe3f7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#1890ff] focus:ring-2 focus:ring-[#91caff]/40"
              />
            </label>

            <label className="space-y-2 text-sm text-[#475569]">
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Transaction Type</span>
              <select
                value={transactionFilter}
                onChange={(event) => setTransactionFilter(event.target.value as 'all' | 'transfer' | 'utilization')}
                className="w-full rounded-2xl border border-[#dbe3f7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#1890ff] focus:ring-2 focus:ring-[#91caff]/40"
              >
                <option value="all">All</option>
                <option value="transfer">Transfer</option>
                <option value="utilization">Utilization</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-[#475569]">
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | 'created' | 'pending' | 'verified' | 'tampered')}
                className="w-full rounded-2xl border border-[#dbe3f7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#1890ff] focus:ring-2 focus:ring-[#91caff]/40"
              >
                <option value="all">All</option>
                <option value="created">Created</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="tampered">Tampered</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <label className="space-y-2 text-sm text-[#475569]">
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Date from</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-2xl border border-[#dbe3f7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#1890ff] focus:ring-2 focus:ring-[#91caff]/40"
              />
            </label>

            <label className="space-y-2 text-sm text-[#475569]">
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Date to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full rounded-2xl border border-[#dbe3f7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#1890ff] focus:ring-2 focus:ring-[#91caff]/40"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatusTile
              label="Blockchain Sync"
              value={syncStatus}
              tone={syncTone}
            />
            <StatusTile
              label="Pending Anchoring"
              value={`${anchorPendingCount}`}
              tone={anchorPendingCount > 0 ? 'warning' : 'success'}
            />
            <StatusTile
              label="Ledger Records"
              value={`${stats?.ledgerCount ?? 0}`}
              tone="muted"
            />
          </div>
        </div>
      </section>

      {stats ? (
        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Applications"
            value={String(stats.totalApps)}
            sub="All applications in this RID"
            icon={<FiFileText />}
            iconBg="bg-[#e6f7ff]"
            iconColor="text-[#1890ff]"
          />

          <KpiCard
            label="Total TDR Value"
            value={`₹ ${n(stats.totalValue)}`}
            sub="Sum of all applications"
            icon={<HiOutlineCurrencyRupee />}
            iconBg="bg-[#f6ffed]"
            iconColor="text-[#52c41a]"
          />

          <KpiCard
            label="Transferred TDR Value"
            value={`₹ ${n(stats.transferred)}`}
            sub="Total transferred value"
            icon={<FiSend />}
            iconBg="bg-[#fff7e6]"
            iconColor="text-[#fa8c16]"
          />

          <KpiCard
            label="Utilized TDR Value"
            value={`₹ ${n(stats.utilized)}`}
            sub="Total utilized value"
            icon={<FiCheckCircle />}
            iconBg="bg-[#f9f0ff]"
            iconColor="text-[#722ed1]"
          />
        </section>
      ) : null}

      <nav className="mt-5 flex flex-wrap gap-5 border-b border-[#eef2f7] text-sm font-semibold">
        {RID_HISTORY_TABS.map((tab) => {
          const count = tabCount(tab.countKey)
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 pb-3 transition ${
                isActive
                  ? 'border-[#1890ff] text-[#1890ff]'
                  : 'border-transparent text-[#8c9ab5] hover:text-[#1c2b4a]'
              }`}
            >
              {tab.label}
              {count != null && count > 0 ? <TabBadge count={count} /> : null}
            </button>
          )
        })}
      </nav>

      <div className="mt-4">
        {error ? (
          <div className="rounded-xl border border-[#ffccc7] bg-[#fff1f0] px-4 py-6 text-center text-sm font-semibold text-[#cf1322]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#eef2f7] bg-white">
            <div className="inline-flex items-center gap-3 text-sm font-semibold text-[#1890ff]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#91caff] border-t-transparent" />
              Loading RID history...
            </div>
          </div>
        ) : null}

        {!loading && filteredHistoryData && !error ? (
          <>
            {activeTab === 'overview' ? (
              <OverviewTab historyData={filteredHistoryData} rid={rid} currentApplicationId={applicationId} />
            ) : null}

            {activeTab === 'tree' ? (
              <TreeTab
                historyData={filteredHistoryData}
                hideUtilizations={hideUtilizations}
                onHideUtilizationsChange={setHideUtilizations}
                rid={rid}
                rfApi={rfApi}
                onFit={handleFit}
                onReady={setRfApi}
              />
            ) : null}

            {activeTab === 'all' ? <AllTransactionsTab historyData={filteredHistoryData} rid={rid} /> : null}

            {activeTab === 'utilizations' ? (
              <UtilizationsTab historyData={filteredHistoryData} rid={rid} />
            ) : null}

            {activeTab === 'transfers' ? <TransfersTab historyData={filteredHistoryData} rid={rid} /> : null}

            {activeTab === 'ledger' ? <LedgerTab historyData={filteredHistoryData} rid={rid} /> : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

