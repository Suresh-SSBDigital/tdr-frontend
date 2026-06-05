import { useCallback,useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiCopy, FiDownload, FiFileText, FiMap, FiCheckCircle } from 'react-icons/fi'
import { TbTopologyStar3 } from 'react-icons/tb'
import type { ReactFlowInstance } from '@xyflow/react'
import {
  computeRidStats,
  RID_HISTORY_TABS,
  type RidHistoryResponse,
  type RidHistoryTabId,
} from '../helpers/ridHistoryTree'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../api/api'
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

function TabBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-[#f0f5ff] px-1.5 py-0.5 text-[10px] font-bold text-[#1890ff]">
      {count}
    </span>
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

  const {
    data: historyData = null,
    isLoading: loading,
    error: queryError,
  } = useQuery<RidHistoryResponse | null>({
    queryKey: ['rid-history', rid],
    queryFn: ({ signal }) => {
      if (!rid) return Promise.resolve(null)
      const headers: Record<string, string> = {}
      if (API_KEY) headers['x-api-key'] = API_KEY
      return apiRequest<RidHistoryResponse>({
        method: 'GET',
        url: `/api/tdr/rid/${encodeURIComponent(rid)}/history`,
        headers,
        signal,
      })
    },
    enabled: !!rid,
  })

  const error = !rid
    ? 'RID is required to view total history.'
    : queryError
    ? (queryError instanceof Error ? queryError.message : 'Error loading RID history')
    : null

  const [hideUtilizations, setHideUtilizations] = useState(false)
  const [rfApi, setRfApi] = useState<Pick<ReactFlowInstance, 'fitView' | 'zoomIn' | 'zoomOut'> | null>(
    null,
  )
  const [searchTerm] = useState('')
  const [ownerFilter] = useState('')
  const [transactionFilter] = useState<'all' | 'transfer' | 'utilization'>('all')
  const [statusFilter] = useState<'all' | 'created' | 'pending' | 'verified' | 'tampered'>('all')
  const [dateFrom] = useState('')
  const [dateTo] = useState('')

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
  const setTab = useCallback(
    (tab: RidHistoryTabId) => {
      const next = new URLSearchParams(searchParams)
      next.set('tab', tab)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )



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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[2px] text-slate-500">
                TDR History
              </p>

              <div className="mt-1 flex items-center gap-2">
                <h1 className="font-mono text-2xl font-bold text-slate-900">
                  {titleId}
                </h1>

                <button
                  onClick={() => void copyText(titleId)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                >
                  <FiCopy />
                </button>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Application Overview & Transaction History
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                className="
            inline-flex items-center gap-2
            rounded-lg border border-slate-300
            bg-white px-4 py-2
            text-sm font-medium text-slate-700
            hover:bg-slate-50
          "
              >
                <FiDownload />
                Export
              </button>

              <Link
                to="/dashboard/apply"
                className="
            inline-flex items-center gap-2
            rounded-lg bg-slate-900
            px-4 py-2
            text-sm font-medium text-white
            hover:bg-slate-800
          "
              >
                <FiArrowLeft />
                Back
              </Link>

            </div>
          </div>
        </div>

        {/* APPLICATION INFO */}
        <div className="grid gap-5 border-b border-slate-100 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Owner
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {displayOwner}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Samagra ID
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
              {displaySamagraId}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              RID
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
              {rid}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>

            <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {displayStatus}
            </span>
          </div>

        </div>



        {/* KPI CARDS */}
        <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">

          <KpiCard
            label="Applications"
            value={String(stats?.totalApps ?? 0)}
            sub="Transfer Applications in RID"
            icon={<FiFileText />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <KpiCard
            label="Area"
            value={displayArea}
            sub="Total available area"
            icon={<FiMap />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />

          <KpiCard
            label="Ledger Records"
            value={String(stats?.ledgerCount ?? 0)}
            sub="Blockchain entries"
            icon={<TbTopologyStar3 />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <KpiCard
            label="Blockchain Sync"
            value={syncStatus}
            sub={`Pending: ${anchorPendingCount}`}
            icon={<FiCheckCircle />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>
      </section>

      <nav className="mt-5 flex flex-wrap gap-5 border-b border-[#eef2f7] text-sm font-semibold">
        {RID_HISTORY_TABS.map((tab) => {
          const count = tabCount(tab.countKey)
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 pb-3 transition ${isActive
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

