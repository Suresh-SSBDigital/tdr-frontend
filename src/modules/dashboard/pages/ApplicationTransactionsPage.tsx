import { useEffect, useState } from 'react'


import { Link, useLocation, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import {
  buildTimelineRows,
  fetchTdrFullSnapshot,
  type TdrFullSnapshot,
  type TimelineRow,
} from '../../../api/tdrFullTimeline'


// ============================================
// PREMIUM TABLE STYLES
// ============================================

const th = `
  sticky top-0 z-10
  border-b border-white/10
  bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900
  px-3 py-3
  text-left text-[11px]
  font-bold uppercase tracking-wider
  text-white whitespace-nowrap
`

const td = `
  border-b border-slate-100
  px-3 py-3
  text-[12px]
  text-slate-700
  whitespace-nowrap
`

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

// ============================================
// HELPERS
// ============================================

function d(v?: string) {
  if (!v) return '-'

  const dt = new Date(v)

  if (Number.isNaN(dt.getTime())) return v

  return dt.toLocaleString('en-IN')
}

function statusBadge(status?: string) {
  const normalized = (status ?? '').toUpperCase()

  if (normalized === 'APPROVED')
    return 'bg-emerald-100 text-emerald-700 ring-emerald-200'

  if (normalized === 'REJECTED')
    return 'bg-red-100 text-red-700 ring-red-200'

  if (normalized === 'PENDING')
    return 'bg-amber-100 text-amber-700 ring-amber-200'

  if (normalized === 'COMPLETED')
    return 'bg-blue-100 text-blue-700 ring-blue-200'

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function normalizeSearch(s: string) {
  return (s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeQuery(query: string): string[] {
  const q = normalizeSearch(query)
  if (!q) return []
  return q.split(' ').filter(Boolean)
}

function fuzzyRowMatches(query: string, row: TimelineRow): boolean {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return true

  // Search across ALL columns
  const haystack = [
    row.stepType,
    row.refId,
    row.from,
    row.to,
    row.fromName,
    row.toName,
    row.beforeArea,
    row.amountArea,
    row.afterArea,
    row.at,
    row.notes,
    row.status,
  ]
    .map((v) =>
      typeof v === 'number' ? String(v) : v == null ? '' : String(v),
    )
    .join(' ')
    .toLowerCase()

  // Subsequence-ish / fuzzy: each token must be a substring somewhere
  return tokens.every((t) => haystack.includes(t))
}


function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null
  const dt = new Date(dateStr)
  return Number.isNaN(dt.getTime()) ? null : dt
}

export default function ApplicationTransactionsPage() {
  const { applicationId } = useParams()

  const location = useLocation()

  const id = decodeURIComponent(applicationId ?? '')

  const rid =
    new URLSearchParams(location.search)
      .get('rid')
      ?.trim() ?? ''

  const samagraId =
    new URLSearchParams(location.search)
      .get('samagra_id')
      ?.trim() ?? ''

  const [data, setData] =
    useState<TdrFullSnapshot | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  // ============================================
  // SEARCH + FILTER STATES
  // ============================================
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  // ============================================
  // API CALL
  // ============================================

  useEffect(() => {
    let active = true

    if (!id) return

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const snap = await fetchTdrFullSnapshot(
          id,
          rid,
          samagraId,
          API_KEY,
        )
        if (!active) return

        if (snap.ok === false) {
          setError(snap.error)
          setData(null)
          return
        }

        setData(snap.data)
      } catch {
        if (active)
          setError('Unable to load transactions.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id, rid, samagraId])

  const baseRows = buildTimelineRows(data)

  // ============================================
  // EXTRACT FILTER OPTIONS FROM DATA
  // ============================================
  const uniqueTypes = Array.from(
    new Set(baseRows.map((row) => row.stepType).filter(Boolean))
  ).sort()

  const uniqueStatuses = Array.from(
    new Set(baseRows.map((row) => row.status).filter(Boolean))
  ).sort()

  // ============================================
  // APPLY FILTERS (SEARCH, TYPE, STATUS, DATE)
  // ============================================
  const processedRows = baseRows.filter((row) => {
    // 1. Apply search - search across all fields
    if (searchQuery.trim()) {
      if (!fuzzyRowMatches(searchQuery, row)) return false
    }

    // 2. Apply type filter
    if (typeFilter !== 'all' && row.stepType !== typeFilter) return false

    // 3. Apply status filter
    if (statusFilter !== 'all' && row.status !== statusFilter) return false

    // 4. Apply date range filter
    if (fromDate || toDate) {
      const rowDate = parseDate(row.at)
      if (rowDate) {
        if (fromDate) {
          const from = parseDate(fromDate)
          if (from && rowDate < from) return false
        }
        if (toDate) {
          const to = parseDate(toDate)
          // Add 1 day to toDate to include the entire day
          if (to) {
            to.setDate(to.getDate() + 1)
            if (rowDate >= to) return false
          }
        }
      }
    }

    return true
  })

  const totalCount = baseRows.length
  const filteredCount = processedRows.length

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-blue-200 bg-white px-6 py-4 text-sm font-semibold text-blue-700 shadow-lg">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          Loading transaction history...
        </div>
      </div>
    )
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-5">
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-3xl font-bold text-transparent">
            Transfer & Utilization Tree
          </h1>

          <p className="mt-1 font-mono text-sm text-slate-500">
            {id}
          </p>
        </div>

        <Link
          to={(() => {
            const q = new URLSearchParams()

            if (rid) q.set('rid', rid)

            if (samagraId)
              q.set('samagra_id', samagraId)

            const qs = q.toString()

            return `/dashboard/apply/${encodeURIComponent(
              id,
            )}/history${qs ? `?${qs}` : ''}`
          })()}
          className="
            inline-flex items-center gap-2
            rounded-xl
            border border-blue-200
            bg-white
            px-4 py-2
            text-sm font-semibold text-blue-700
            shadow-sm
            transition-all duration-300
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
      </div>

      {/* ===================================== */}
      {/* ERROR */}
      {/* ===================================== */}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      {/* ===================================== */}
      {/* TABLE CARD */}
      {/* ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* CARD HEADER */}

        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Transaction Timeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Transfer and utilization history
          </p>
        </div>

        {/* FILTER CONTROLS ROW */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
          <div className="space-y-4">
            {/* Row 1: Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">Global Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Reference ID, Type, Status, Description, Transfer Path, Date, or Area..."
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

              {/* From Date */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              {/* Statistics + Reset */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase text-blue-600">Showing</p>
                    <p className="text-lg font-bold text-blue-900">{filteredCount}</p>
                  </div>
                  {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) && (
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-600">Total</p>
                      <p className="text-lg font-bold text-slate-700">{totalCount}</p>
                    </div>
                  )}
                </div>
                {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setTypeFilter('all')
                      setStatusFilter('all')
                      setFromDate('')
                      setToDate('')
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
        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="min-w-[1700px] w-full">
            <thead>
              <tr>
                <th className={th}>Step</th>

                <th className={th}>Type</th>

                <th className={th}>Reference ID</th>

                <th className={th}>Transfer Path</th>


                {/* <th className={th}>
                  Before TDR Value
                </th> */}

                <th className={th}>
                  Before Area (sq.m)
                </th>

                {/* <th
                  className={`${th} bg-gradient-to-r from-amber-500 to-orange-500`}
                >
                  Transfer / Utilization Value
                </th> */}

                <th
                  className={`${th} bg-gradient-to-r from-amber-500 to-orange-500`}
                >
                  Transfer / Utilization Area (sq.m)
                </th>

                {/* <th className={th}>
                  Current TDR Value
                </th> */}

                <th className={th}>
                  Remaining Area (sq.m)
                </th>
                <th className={th}>Transaction Date</th>

                <th className={th}>
                  Description
                </th>

                <th
                  className={`${th} bg-gradient-to-r from-emerald-600 to-green-600`}
                >
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {processedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="
                      px-4 py-12
                      text-center
                      text-sm font-medium
                      text-slate-400
                    "
                  >
                    {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate
                      ? 'No transactions match your filters.'
                      : 'No transactions found.'}
                  </td>
                </tr>
              ) : (
                processedRows.map((row, i) => (
                  <tr
                    key={`${row.stepType}-${row.refId}-${i}`}
                    className={`
                      transition-all duration-200
                      hover:bg-blue-50/60
                      ${i % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/40'
                      }
                    `}
                  >
                    {/* STEP */}

                    <td className={`${td} text-center`}>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {i + 1}
                      </span>
                    </td>

                    {/* TYPE */}

                    <td className={td}>
                      <span
                        className={`
                          rounded-full px-3 py-1
                          text-[11px] font-bold
                          shadow-sm
                          ${row.stepType === 'TRANSFER'
                            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-violet-100 text-violet-700 ring-1 ring-violet-200'
                          }
                        `}
                      >
                        {row.stepType}
                      </span>
                    </td>

                    {/* REF */}

                    <td
                      className={`${td} font-mono text-[11px] font-semibold text-violet-700`}
                    >
                      {row.refId}
                    </td>

                    {/* PATH */}

                    <td className={`${td} font-mono text-[11px]`}>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">
                          root
                        </span>

                        <span className="text-slate-300">
                          /
                        </span>

                        <span className="font-semibold text-slate-700">
                          {row.from}
                        </span>

                        <span className="text-blue-400">
                          →
                        </span>

                        <span className="font-semibold text-emerald-700">
                          {row.to}
                        </span>
                      </div>
                    </td>



                    {/* BEFORE */}

                    {/* <td
                      className={`${td} text-center font-semibold text-blue-700`}
                    >
                      {n(row.before)}
                    </td> */}

                    {/* BEFORE AREA */}

                    <td
                      className={`${td} text-center font-semibold text-sky-700`}
                    >
                      {row.beforeArea == null
                        ? '-'
                        : (
                          <span className="font-semibold text-sky-700">
                            {`${row.beforeArea.toLocaleString(
                              'en-IN',
                            )} sq.m`}
                          </span>
                        )}
                    </td>

                    {/* TRANSFER VALUE */}

                    {/* <td
                      className={`${td} text-center font-bold text-orange-600`}
                    >
                      {n(row.amount)}
                    </td> */}

                    {/* TRANSFER AREA */}

                    <td
                      className={`${td} text-center font-bold text-amber-600`}
                    >
                      {row.amountArea == null
                        ? '-'
                        : (
                          <span className="font-bold text-amber-600">
                            {`${row.amountArea.toLocaleString(
                              'en-IN',
                            )} sq.m`}
                          </span>
                        )}
                    </td>

                    {/* AFTER */}

                    {/* <td
                      className={`${td} text-center font-semibold text-emerald-700`}
                    >
                      {n(row.after)}
                    </td> */}

                    {/* REMAINING */}

                    <td
                      className={`${td} text-center font-semibold text-indigo-700`}
                    >
                      {row.afterArea == null
                        ? '-'
                        : (
                          <span className="font-semibold text-indigo-700">
                            {`${row.afterArea.toLocaleString(
                              'en-IN',
                            )} sq.m`}
                          </span>
                        )}
                    </td>
                    {/* DATE */}

                    <td className={td}>
                      <span className="font-medium text-slate-600">
                        {d(row.at)}
                      </span>
                    </td>
                    {/* NOTES */}

                    <td
                      className={`${td} max-w-[300px] truncate`}
                      title={row.notes}
                    >
                      <span className="text-slate-600">
                        {row.notes}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className={td}>
                      <span
                        className={`
                          inline-flex items-center justify-center
                          rounded-full px-3 py-1
                          text-[11px] font-bold
                          ring-1
                          ${statusBadge(row.status)}
                        `}
                      >
                        {row.status ?? '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}