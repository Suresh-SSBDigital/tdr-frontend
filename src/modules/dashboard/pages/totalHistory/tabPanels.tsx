import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  findRootApp,
  flattenAllTransactions,
  flattenLedger,
  flattenTransfers,
  flattenUtilizations,
  type FlatAllTransactionRow,
  type FlatLedgerRow,
  type FlatTransferRow,
  type FlatUtilizationRow,
  type RidHistoryApplication,
  type RidHistoryResponse,
} from '../../helpers/ridHistoryTree'
import { d, n } from './format'
import {
  ActionPill,
  AppLink,
  ClickableRow,
  CopyBtn,
  DetailPanel,
  fieldsFromRecord,
  StatusPill,
  TableShell,
  tdClass,
  thClass,
} from './shared'

// ============================================
// HELPER FUNCTIONS FOR SEARCH & FILTER
// ============================================

function normalizeSearch(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeQuery(query: string): string[] {
  const q = normalizeSearch(query)
  return q.split(' ').filter((t) => t.length > 0)
}



function searchInObject(obj: Record<string, unknown>, query: string): boolean {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return true

  const searchStr = JSON.stringify(obj).toLowerCase()
  return tokens.every((token) => searchStr.includes(token))
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const dt = new Date(dateStr)
  return Number.isNaN(dt.getTime()) ? null : dt
}

type TabPanelsProps = {
  historyData: RidHistoryResponse
  rid: string
  currentApplicationId?: string
}

export function OverviewTab({
  historyData,
  rid,
  currentApplicationId,
}: TabPanelsProps) {
  const apps =
    historyData.applications ?? []

  const root = findRootApp(apps)

  const [selected, setSelected] =
    useState<RidHistoryApplication | null>(
      null,
    )

  return (
    <>
      <TableShell
        title="Applications in this RID"
        count={apps.length}
      >
        <table className="w-full min-w-[1250px]">
          <thead>
            <tr>
              <th className={thClass}>
                SR. No.
              </th>

              <th className={thClass}>
                TDR App ID
              </th>

              <th className={thClass}>
                Application ID
              </th>

              <th className={thClass}>
                Owner
              </th>

              <th className={thClass}>
                Status
              </th>

              <th className={thClass}>
                Total TDR
              </th>

              <th className={thClass}>
                Remaining
              </th>

              <th className={thClass}>
                Transferred
              </th>

              <th className={thClass}>
                Utilized
              </th>

              <th className={thClass}>
                Type
              </th>

              <th className={thClass}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  No applications found.
                </td>
              </tr>
            ) : (
              apps.map((app, index) => {
                const isRoot =
                  app.application_id ===
                  root?.application_id

                const isCurrent =
                  app.application_id ===
                  currentApplicationId

                return (
                  <ClickableRow
                    key={app.application_id}
                    active={
                      selected?.application_id ===
                      app.application_id
                    }
                    onClick={() =>
                      setSelected(app)
                    }
                  >
                    {/* SR NO */}
                    <td className={tdClass}>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </td>

                    {/* TDR APP ID */}
                    <td className={tdClass}>
                      <span className="font-mono text-[11px] font-semibold">
                        {app.tdrApplicationId ??
                          '—'}
                      </span>

                      {isCurrent ? (
                        <span className="ml-1 rounded bg-[#e6f7ff] px-1.5 py-0.5 text-[9px] font-bold text-[#1890ff]">
                          CURRENT
                        </span>
                      ) : null}
                    </td>

                    {/* APPLICATION ID */}
                    <td className={tdClass}>
                      <AppLink
                        applicationId={
                          app.application_id
                        }
                        samagraId={
                          app.samagra_id
                        }
                        rid={rid}
                        label={
                          app.application_id
                        }
                      />
                    </td>

                    {/* OWNER */}
                    <td className={tdClass}>
                      {app.owner_name ??
                        '—'}
                    </td>

                    {/* STATUS */}
                    <td className={tdClass}>
                      <StatusPill
                        status={app.status}
                      />
                    </td>

                    {/* TOTAL TDR */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.total_tdr_value,
                      )}
                    </td>

                    {/* REMAINING */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.remaining_tdr_value,
                      )}
                    </td>

                    {/* TRANSFERRED */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.transferred_tdr_value,
                      )}
                    </td>

                    {/* UTILIZED */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.utilized_tdr_value,
                      )}
                    </td>

                    {/* TYPE */}
                    <td className={tdClass}>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isRoot
                            ? 'bg-[#e6f7ff] text-[#1890ff]'
                            : 'bg-[#f9f0ff] text-[#722ed1]'
                        }`}
                      >
                        {isRoot
                          ? 'Root'
                          : 'Child'}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className={tdClass}>
                      <Link
                        to={`/dashboard/apply/${encodeURIComponent(
                          app.application_id,
                        )}/history?rid=${encodeURIComponent(
                          rid,
                        )}${
                          app.samagra_id
                            ? `&samagra_id=${encodeURIComponent(
                                app.samagra_id,
                              )}`
                            : ''
                        }`}
                        className="text-[11px] font-semibold text-[#1890ff] hover:underline"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        View history
                      </Link>
                    </td>
                  </ClickableRow>
                )
              })
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.tdrApplicationId ??
            selected.application_id
          }
          subtitle={`Owner: ${
            selected.owner_name ?? '—'
          }`}
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

export function AllTransactionsTab({ historyData, rid }: TabPanelsProps) {
  const rows = useMemo(
    () => flattenAllTransactions(historyData.applications ?? []),
    [historyData],
  )
  const [selected, setSelected] = useState<FlatAllTransactionRow | null>(null)

  // ============================================
  // SEARCH, SORT, FILTER STATES
  // ============================================
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<'type' | 'date' | 'status' | 'area'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // ============================================
  // EXTRACT FILTER OPTIONS
  // ============================================
  const uniqueTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.txType).filter(Boolean))).sort(),
    [rows],
  )
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status).filter(Boolean))).sort(),
    [rows],
  )

  // ============================================
  // APPLY SEARCH, FILTER, SORT
  // ============================================
  const processedRows = useMemo(() => {
    let filtered = rows.filter((row) => {
      // Search
      if (searchQuery.trim()) {
        if (!searchInObject(row as Record<string, unknown>, searchQuery)) return false
      }
      // Type filter
      if (typeFilter !== 'all' && row.txType !== typeFilter) return false
      // Status filter
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | Date = ''
      let bVal: string | number | Date = ''

      switch (sortKey) {
        case 'type':
          aVal = a.txType || ''
          bVal = b.txType || ''
          break
        case 'date':
          aVal = parseDate(a.date as string) || new Date(0)
          bVal = parseDate(b.date as string) || new Date(0)
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        case 'area':
          aVal = a.area || 0
          bVal = b.area || 0
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [rows, searchQuery, typeFilter, statusFilter, sortKey, sortDir])

  const totalCount = rows.length
  const filteredCount = processedRows.length

  return (
    <>
      <TableShell title="All Transactions" count={rows.length}>
        {/* FILTER CONTROLS ROW */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
          <div className="space-y-4">
            {/* Row 1: Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all fields..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Type Filter */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="all">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as 'type' | 'date' | 'status' | 'area')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="date">Date</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                  <option value="area">Area</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Order</label>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="desc">Descending ↓</option>
                  <option value="asc">Ascending ↑</option>
                </select>
              </div>

              {/* Statistics + Reset */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-blue-600">Showing</p>
                    <p className="text-lg font-bold text-blue-900">{filteredCount}</p>
                  </div>
                  {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-600">Total</p>
                      <p className="text-lg font-bold text-slate-700">{totalCount}</p>
                    </div>
                  )}
                </div>
                {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setTypeFilter('all')
                      setStatusFilter('all')
                      setSortKey('date')
                      setSortDir('desc')
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <TransactionsTable rows={processedRows} rid={rid} onSelect={setSelected} selectedKey={selected?.rowKey} />
      </TableShell>
      {selected ? (
        <DetailPanel
          title={`${selected.txType} — ${selected.referenceId ?? selected.txId ?? 'Transaction'}`}
          subtitle={selected.tdrApplicationId}
          fields={fieldsFromRecord(selected as unknown as Record<string, unknown>)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  )
}

export function UtilizationsTab({
  historyData,
  rid,
}: TabPanelsProps) {
  const rows = useMemo(
    () =>
      flattenUtilizations(
        historyData.applications ?? [],
      ),
    [historyData],
  )

  const [selected, setSelected] =
    useState<FlatUtilizationRow | null>(
      null,
    )

  // ============================================
  // SEARCH, SORT, FILTER STATES
  // ============================================
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<'utilization_date' | 'utilized_area' | 'status'>('utilization_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // ============================================
  // EXTRACT FILTER OPTIONS
  // ============================================
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status).filter(Boolean))).sort(),
    [rows],
  )

  // ============================================
  // APPLY SEARCH, FILTER, SORT
  // ============================================
  const processedRows = useMemo(() => {
    let filtered = rows.filter((row) => {
      // Search
      if (searchQuery.trim()) {
        if (!searchInObject(row as Record<string, unknown>, searchQuery)) return false
      }
      // Status filter
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | Date = ''
      let bVal: string | number | Date = ''

      switch (sortKey) {
        case 'utilization_date':
          aVal = parseDate(a.utilization_date as string) || new Date(0)
          bVal = parseDate(b.utilization_date as string) || new Date(0)
          break
        case 'utilized_area':
          aVal = a.utilized_area || 0
          bVal = b.utilized_area || 0
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [rows, searchQuery, statusFilter, sortKey, sortDir])

  const totalCount = rows.length
  const filteredCount = processedRows.length

  return (
    <>
      <TableShell
        title="Utilizations"
        count={rows.length}
      >
        {/* FILTER CONTROLS ROW */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
          <div className="space-y-4">
            {/* Row 1: Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all fields..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="all">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as 'utilization_date' | 'utilized_area' | 'status')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="utilization_date">Date</option>
                  <option value="utilized_area">Area</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Order</label>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="desc">Descending ↓</option>
                  <option value="asc">Ascending ↑</option>
                </select>
              </div>

              {/* Statistics + Reset */}
              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-blue-600">Showing</p>
                    <p className="text-lg font-bold text-blue-900">{filteredCount}</p>
                  </div>
                  {(searchQuery || statusFilter !== 'all') && (
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-600">Total</p>
                      <p className="text-lg font-bold text-slate-700">{totalCount}</p>
                    </div>
                  )}
                </div>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setSortKey('utilization_date')
                      setSortDir('desc')
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <table className="w-full min-w-[1300px]">
          <thead>
            <tr>
              <th className={thClass}>
                SR. No.
              </th>

              <th className={thClass}>
                Utilization ID
              </th>

              <th className={thClass}>
                Application
              </th>

              <th className={thClass}>
                Utilized By
              </th>

              <th className={thClass}>
                TDR Amount
              </th>

              <th className={thClass}>
                Area
              </th>

              <th className={thClass}>
                Purpose
              </th>

              <th className={thClass}>
                Date
              </th>

              <th className={thClass}>
                Status
              </th>

              <th className={thClass}>
                TxID
              </th>
            </tr>
          </thead>

          <tbody>
            {processedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  {searchQuery || statusFilter !== 'all'
                    ? 'No utilization records match your filters.'
                    : 'No utilization records.'}
                </td>
              </tr>
            ) : (
              processedRows.map((row, index) => (
                <ClickableRow
                  key={row.rowKey}
                  active={
                    selected?.rowKey ===
                    row.rowKey
                  }
                  onClick={() =>
                    setSelected(row)
                  }
                >
                  {/* SR NO */}
                  <td className={tdClass}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </td>

                  {/* UTILIZATION ID */}
                  <td className={tdClass}>
                    <span className="font-mono text-[11px]">
                      {row.utilization_id ??
                        '—'}
                    </span>
                  </td>

                  {/* APPLICATION */}
                  <td className={tdClass}>
                    <AppLink
                      applicationId={
                        row.application_id
                      }
                      samagraId={
                        row.samagra_id
                      }
                      rid={rid}
                    />
                  </td>

                  {/* UTILIZED BY */}
                  <td className={tdClass}>
                    {row.utilized_by ??
                      row.owner_name ??
                      '—'}
                  </td>

                  {/* TDR AMOUNT */}
                  <td className={tdClass}>
                    ₹{' '}
                    {n(
                      row.utilized_value_tdr,
                    )}
                  </td>

                  {/* AREA */}
                  <td className={tdClass}>
                    {n(row.utilized_area)}
                  </td>

                  {/* PURPOSE */}
                  <td className={tdClass}>
                    {row.utilization_purpose ??
                      '—'}
                  </td>

                  {/* DATE */}
                  <td className={tdClass}>
                    {d(
                      row.utilization_date,
                    )}
                  </td>

                  {/* STATUS */}
                  <td className={tdClass}>
                    <StatusPill
                      status={row.status}
                    />
                  </td>

                  {/* TX ID */}
                  <td className={tdClass}>
                    <CopyBtn
                      value={row.txId}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.utilization_id ??
            'Utilization'
          }
          subtitle={
            selected.utilization_purpose
          }
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

export function TransfersTab({ historyData, rid }: TabPanelsProps) {
  const rows = useMemo(
    () => flattenTransfers(historyData.applications ?? []),
    [historyData],
  )

  const [selected, setSelected] =
    useState<FlatTransferRow | null>(null)

  // ============================================
  // SEARCH, SORT, FILTER STATES
  // ============================================
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<'trn_date' | 'transferred_area' | 'status'>('trn_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // ============================================
  // EXTRACT FILTER OPTIONS
  // ============================================
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status).filter(Boolean))).sort(),
    [rows],
  )

  // ============================================
  // APPLY SEARCH, FILTER, SORT
  // ============================================
  const processedRows = useMemo(() => {
    let filtered = rows.filter((row) => {
      // Search
      if (searchQuery.trim()) {
        if (!searchInObject(row as Record<string, unknown>, searchQuery)) return false
      }
      // Status filter
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | Date = ''
      let bVal: string | number | Date = ''

      switch (sortKey) {
        case 'trn_date':
          aVal = parseDate(a.trn_date as string) || new Date(0)
          bVal = parseDate(b.trn_date as string) || new Date(0)
          break
        case 'transferred_area':
          aVal = a.transferred_area || 0
          bVal = b.transferred_area || 0
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [rows, searchQuery, statusFilter, sortKey, sortDir])

  const totalCount = rows.length
  const filteredCount = processedRows.length

  return (
    <>
      <TableShell
        title="Transfers"
        count={rows.length}
      >
        {/* FILTER CONTROLS ROW */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
          <div className="space-y-4">
            {/* Row 1: Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all fields..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="all">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as 'trn_date' | 'transferred_area' | 'status')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="trn_date">Date</option>
                  <option value="transferred_area">Area</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Order</label>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="desc">Descending ↓</option>
                  <option value="asc">Ascending ↑</option>
                </select>
              </div>

              {/* Statistics + Reset */}
              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-blue-600">Showing</p>
                    <p className="text-lg font-bold text-blue-900">{filteredCount}</p>
                  </div>
                  {(searchQuery || statusFilter !== 'all') && (
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-600">Total</p>
                      <p className="text-lg font-bold text-slate-700">{totalCount}</p>
                    </div>
                  )}
                </div>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setSortKey('trn_date')
                      setSortDir('desc')
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <table className="w-full min-w-[1350px]">
          <thead>
            <tr>
              <th className={thClass}>SR. No.</th>
              <th className={thClass}>TRN ID</th>
              <th className={thClass}>
                From Application
              </th>
              <th className={thClass}>
                Owner From
              </th>
              <th className={thClass}>
                Owner To
              </th>
              <th className={thClass}>
                TDR Amount
              </th>
              <th className={thClass}>Area</th>
              <th className={thClass}>
                Recipient App
              </th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>TxID</th>
            </tr>
          </thead>

          <tbody>
            {processedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  {searchQuery || statusFilter !== 'all'
                    ? 'No transfer records match your filters.'
                    : 'No transfer records.'}
                </td>
              </tr>
            ) : (
              processedRows.map((row, index) => (
                <ClickableRow
                  key={row.rowKey}
                  active={
                    selected?.rowKey ===
                    row.rowKey
                  }
                  onClick={() =>
                    setSelected(row)
                  }
                >
                  {/* SR NO */}
                  <td className={tdClass}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </td>

                  {/* TRN ID */}
                  <td className={tdClass}>
                    <span className="font-mono text-[11px]">
                      {row.trn_id ?? '—'}
                    </span>
                  </td>

                  {/* FROM APPLICATION */}
                  <td className={tdClass}>
                    <AppLink
                      applicationId={
                        row.application_id
                      }
                      samagraId={
                        row.samagra_id
                      }
                      rid={rid}
                    />
                  </td>

                  {/* OWNER FROM */}
                  <td className={tdClass}>
                    {row.owner_from ?? '—'}
                  </td>

                  {/* OWNER TO */}
                  <td className={tdClass}>
                    {row.owner_to ?? '—'}
                  </td>

                  {/* TDR AMOUNT */}
                  <td className={tdClass}>
                    ₹{' '}
                    {n(
                      row.transferred_tdr_value ??
                        row.trn_value_tdr,
                    )}
                  </td>

                  {/* AREA */}
                  <td className={tdClass}>
                    {n(row.transferred_area)}
                  </td>

                  {/* RECIPIENT APP */}
                  <td className={tdClass}>
                    {row.recipient_application_id ? (
                      <AppLink
                        applicationId={
                          row.recipient_application_id
                        }
                        rid={rid}
                        label={
                          row.recipient_tdrApplicationId ??
                          row.recipient_application_id
                        }
                      />
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* DATE */}
                  <td className={tdClass}>
                    {d(row.trn_date)}
                  </td>

                  {/* STATUS */}
                  <td className={tdClass}>
                    <StatusPill
                      status={row.status}
                    />
                  </td>

                  {/* TX ID */}
                  <td className={tdClass}>
                    <CopyBtn
                      value={row.txId}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.trn_id ??
            'Transfer'
          }
          subtitle={`${
            selected.owner_from ?? '—'
          } → ${
            selected.owner_to ?? '—'
          }`}
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

export function LedgerTab({
  historyData,
  rid,
}: TabPanelsProps) {
  const rows = useMemo(
    () =>
      flattenLedger(
        historyData.applications ?? [],
      ),
    [historyData],
  )

  const [selected, setSelected] =
    useState<FlatLedgerRow | null>(
      null,
    )

  // ============================================
  // SEARCH, SORT, FILTER STATES
  // ============================================
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<'createdAt' | 'action'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ============================================
  // APPLY SEARCH, SORT
  // ============================================
  const processedRows = useMemo(() => {
    let filtered = rows.filter((row) => {
      // Search
      if (searchQuery.trim()) {
        if (!searchInObject(row as Record<string, unknown>, searchQuery)) return false
      }
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | Date = ''
      let bVal: string | number | Date = ''

      switch (sortKey) {
        case 'createdAt':
          aVal = parseDate(a.createdAt as string) || new Date(0)
          bVal = parseDate(b.createdAt as string) || new Date(0)
          break
        case 'action':
          aVal = a.action || ''
          bVal = b.action || ''
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [rows, searchQuery, sortKey, sortDir])

  const totalCount = rows.length
  const filteredCount = processedRows.length

  return (
    <>
      <TableShell
        title="Ledger (MongoDB)"
        count={rows.length}
      >
        {/* FILTER CONTROLS ROW */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
          <div className="space-y-4">
            {/* Row 1: Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all fields..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>

            {/* Row 2: Sort Controls */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Sort By */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as 'createdAt' | 'action')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="createdAt">Date</option>
                  <option value="action">Action</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Order</label>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="desc">Descending ↓</option>
                  <option value="asc">Ascending ↑</option>
                </select>
              </div>

              {/* Statistics + Reset */}
              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-blue-600">Showing</p>
                    <p className="text-lg font-bold text-blue-900">{filteredCount}</p>
                  </div>
                  {searchQuery && (
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-600">Total</p>
                      <p className="text-lg font-bold text-slate-700">{totalCount}</p>
                    </div>
                  )}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSortKey('createdAt')
                      setSortDir('desc')
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <table className="w-full min-w-[1350px]">
          <thead>
            <tr>
              <th className={thClass}>
                SR. No.
              </th>

              <th className={thClass}>
                Action
              </th>

              <th className={thClass}>
                Application
              </th>

              <th className={thClass}>
                Performed By
              </th>

              <th className={thClass}>
                Document
              </th>

              <th className={thClass}>
                Previous → New Status
              </th>

              <th className={thClass}>
                Date
              </th>

              <th className={thClass}>
                TxID
              </th>

              <th className={thClass}>
                Hash
              </th>
            </tr>
          </thead>

          <tbody>
            {processedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  {searchQuery
                    ? 'No ledger entries match your search.'
                    : 'No ledger entries.'}
                </td>
              </tr>
            ) : (
              processedRows.map(
                (row, index) => (
                  <ClickableRow
                    key={row.rowKey}
                    active={
                      selected?.rowKey ===
                      row.rowKey
                    }
                    onClick={() =>
                      setSelected(row)
                    }
                  >
                    {/* SR NO */}
                    <td className={tdClass}>
                      <span className="font-bold text-[#1890ff]">
                        {index + 1}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className={tdClass}>
                      <ActionPill
                        action={row.action}
                      />
                    </td>

                    {/* APPLICATION */}
                    <td className={tdClass}>
                      <AppLink
                        applicationId={
                          row.application_id
                        }
                        samagraId={
                          row.samagra_id
                        }
                        rid={rid}
                      />
                    </td>

                    {/* PERFORMED BY */}
                    <td className={tdClass}>
                      {row.performed_by ??
                        row.owner_name ??
                        '—'}
                    </td>

                    {/* DOCUMENT */}
                    <td className={tdClass}>
                      {row.document_type ??
                        '—'}
                    </td>

                    {/* STATUS */}
                    <td className={tdClass}>
                      <span className="text-[11px]">
                        {row.previous_status ??
                          '—'}{' '}
                        →{' '}
                        {row.new_status ??
                          '—'}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className={tdClass}>
                      {d(row.createdAt)}
                    </td>

                    {/* TX ID */}
                    <td className={tdClass}>
                      <CopyBtn
                        value={row.txId}
                      />
                    </td>

                    {/* HASH */}
                    <td className={tdClass}>
                      <CopyBtn
                        value={row.hash}
                      />
                    </td>
                  </ClickableRow>
                ),
              )
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.action?.replace(
              /_/g,
              ' ',
            ) ?? 'Ledger Entry'
          }
          subtitle={selected.remarks}
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

function TransactionsTable({
  rows,
  rid,
  onSelect,
  selectedKey,
}: {
  rows: FlatAllTransactionRow[]
  rid: string
  onSelect: (row: FlatAllTransactionRow) => void
  selectedKey?: string
}) {
  return (
    <table className="w-full min-w-[1200px]">
      <thead>
        <tr>
          <th className={thClass}>Step</th>
          <th className={thClass}>Type</th>
          <th className={thClass}>Reference ID</th>
          <th className={thClass}>Application</th>
          <th className={thClass}>Area (sq.m)</th>
          <th className={thClass}>Counterparty / Purpose</th>
          <th className={thClass}>Date</th>
          <th className={thClass}>Status</th>
          <th className={thClass}>TxID</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={10} className={`${tdClass} text-center text-[#8c9ab5]`}>
              No transactions found.
            </td>
          </tr>
        ) : (
          rows.map((row, rowIdx) => (
            <ClickableRow
              key={row.rowKey}
              active={selectedKey === row.rowKey}
              onClick={() => onSelect(row)}
            >
              <td className={tdClass}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                  {rowIdx + 1}
                </span>
              </td>
              <td className={tdClass}>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    row.txType === 'TRANSFER'
                      ? 'bg-[#fff7e6] text-[#d46b08]'
                      : 'bg-[#f6ffed] text-[#237804]'
                  }`}
                >
                  {row.txType}
                </span>
              </td>
              <td className={tdClass}>
                <span className="font-mono text-[11px]">{row.referenceId ?? '—'}</span>
              </td>
              <td className={tdClass}>
                <AppLink applicationId={row.application_id} samagraId={row.samagra_id} rid={rid} />
              </td>
              <td className={tdClass}>{n(row.area)} sq.m </td>
              <td className={tdClass}>
                {row.txType === 'UTILIZATION' ? row.purpose : row.counterparty}
              </td>
              <td className={tdClass}>{d(row.date)}</td>
              <td className={tdClass}>
                <StatusPill status={row.status} />
              </td>
              <td className={tdClass}>
                <CopyBtn value={row.txId} />
              </td>
            </ClickableRow>
          ))
        )}
      </tbody>
    </table>
  )
}
