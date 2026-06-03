import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiX } from 'react-icons/fi'
import TableActionMenu from './TableActionMenu'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'

import {
  drcHistoryActionTypeLabels,
  type DrcHistoryFlatRow,
} from '../data/certificateLedgerData'

import { downloadDrcHistoryCsv } from '../helpers/csvHelpers'
import { useCertificatesSetDataLoading } from '../layout/certificatesDataLoadingContext'
import { apiUrl } from '../../../api/http'

import type {
  ApiStatus,
  DrcApiTableRow,
} from './drcFullHistoryPanel.types'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

// ======================================================
// STYLES
// ======================================================

const cardClass = `
  overflow-hidden
  rounded-[28px]
  border border-slate-200
  bg-white
  shadow-[0_12px_40px_-14px_rgba(15,23,42,0.16)]
`

const tableHeaderClass = `
  sticky top-0 z-20
  px-4 py-3.5
  text-left
  text-[11px]
  font-bold
  uppercase
  tracking-[0.08em]
  whitespace-nowrap
  text-white
  border-b border-white/10
  bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#312e81]
`

const tableCellClass = `
  px-4 py-3.5
  text-[12px]
  text-slate-700
  border-b border-slate-100
  whitespace-nowrap
`

const actionTypePresentation: Record<
  DrcHistoryFlatRow['actionType'],
  { label: string; className: string }
> = {
  CREATE: {
    label: drcHistoryActionTypeLabels.CREATE,
    className:
      'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  },
  UPDATE: {
    label: drcHistoryActionTypeLabels.UPDATE,
    className:
      'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  },
  TRANSFER: {
    label: drcHistoryActionTypeLabels.TRANSFER,
    className:
      'bg-sky-50 text-sky-900 ring-1 ring-sky-200',
  },
  UTILIZATION: {
    label: drcHistoryActionTypeLabels.UTILIZATION,
    className:
      'bg-violet-50 text-violet-900 ring-1 ring-violet-200',
  },
  DELETE: {
    label: drcHistoryActionTypeLabels.DELETE,
    className:
      'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
  },
}

const statusStyles: Record<
  DrcHistoryFlatRow['status'],
  string
> = {
  VALID:
    'bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]',
  TRANSFERRED:
    'bg-[#e6f7ff] text-[#1890ff] border border-[#91d5ff]',
  UTILIZED:
    'bg-[#f9f0ff] text-[#722ed1] border border-[#d3adf7]',
  EDITED:
    'bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]',
  DELETED:
    'bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]',
}

const columnHelper = createColumnHelper<DrcApiTableRow>()

// ======================================================
// COMPONENT
// ======================================================

export default function DrcFullHistoryPanel() {
  const [rows, setRows] = useState<DrcApiTableRow[]>([])
  const [countTotal, setCountTotal] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const setCertificatesDataLoading =
    useCertificatesSetDataLoading()

  // ======================================================
  // NEW: FILTER STATES
  // ======================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApiStatus | 'all'>('all')
  const [actionTypeFilter, setActionTypeFilter] = useState<DrcHistoryFlatRow['actionType'] | 'all'>('all')

  useLayoutEffect(() => {
    setCertificatesDataLoading(true)

    return () => setCertificatesDataLoading(false)
  }, [setCertificatesDataLoading])

  // ======================================================
  // STATES
  // ======================================================

  const [sorting, setSorting] =
    useState<SortingState>([
      {
        id: 'timestampEpoch',
        desc: true,
      },
    ])

  const [pagination, setPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

  // ======================================================
  // API LOAD (Server-side pagination)
  // ======================================================

  useEffect(() => {
    let active = true

    const loadDrcCertificatesPage = async () => {
      setIsLoading(true)

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (API_KEY) {
          headers['x-api-key'] = API_KEY
        }

        const limit = pagination.pageSize
        const offset = pagination.pageIndex * pagination.pageSize

        const qs = new URLSearchParams()
        qs.set('limit', String(limit))
        qs.set('offset', String(offset))
        qs.set('sortDir', 'desc')

        const res = await fetch(apiUrl(`/api/tdr/drc-certificates?${qs.toString()}`), {
          headers,
        })

        if (!res.ok) return

        const jsonData = await res.json()

        const data = jsonData as {
          success?: boolean
          countTotal?: number
          certificates?: Array<{
            application_id?: string
            tdrApplicationId?: string
            owner_name?: string
            rid?: string
            drc_id?: string
            drc_certificate_no?: string
            drc_generation_dt?: string
            drc_date?: string
            status?: string
            drc_status?: string
            updatedAt?: string
            total_area?: number
            proposed_area?: number
            remaining_tdr_value?: number
            drc_certificate?: string | { hash?: string }
          }>
        }
        const certs = data.certificates ?? []
        const total = Number(data.countTotal ?? 0)
        if (!active) return

        setCountTotal(total)

        const mappedRows: DrcApiTableRow[] = certs.map((item, pageIndex) => {
          const absoluteIndex = offset + pageIndex

          const appId = item.application_id?.trim() || `app-${absoluteIndex + 1}`
          const ownerName = item.owner_name?.trim() || 'N/A'
          const certNo = item.drc_certificate_no?.trim() || 'N/A'

          const parsed = item.updatedAt ? new Date(item.updatedAt) : null
          const timestampEpoch =
            parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0
          const ts = timestampEpoch ? parsed?.toLocaleString('en-IN') ?? '—' : '—'

          const drcStatus =
            item.drc_status?.trim() || item.status?.trim() || 'UNKNOWN'

          const statusMap: Record<string, ApiStatus> = {
            DRC_GENERATED: 'VALID',
            CREATED: 'EDITED',
            APPROVED: 'VALID',
            REJECTED: 'DELETED',
          }

          const mappedStatus = statusMap[drcStatus.toUpperCase()] ?? 'VALID'

          return {
            rowId: `api-${absoluteIndex}`,
            certificateSno: absoluteIndex + 1,
            certificateNo: certNo,
            holderName: ownerName,
            city: 'N/A',
            treePath: certNo,
            label: 'DRC certificate issued',
            timestamp: ts,
            status: mappedStatus,
            actionType: 'CREATE',
            actor: 'TDR API',
            txHash: item.drc_id ?? '—',
            blockNumber: absoluteIndex + 1,
            notes: `Project status: ${item.status ?? 'UNKNOWN'}`,
            applicationId: appId,
            tdrApplicationId: item.tdrApplicationId ?? '—',
            rid: item.rid ?? '—',
            drcId: item.drc_id ?? '—',
            drcStatus,
            timestampEpoch,
            totalArea: item.total_area,
            proposedArea: item.proposed_area,
            remainingTdrValue: item.remaining_tdr_value,
          }
        })

        setRows(mappedRows)
      } catch {
        if (!active) return
        setRows([])
        setCountTotal(0)
      } finally {
        if (!active) return
        setIsLoading(false)
        setCertificatesDataLoading(false)
      }
    }

    void loadDrcCertificatesPage()

    return () => {
      active = false
    }
  }, [pagination.pageIndex, pagination.pageSize, setCertificatesDataLoading])

  // ======================================================
  // UTILITY: Search across all row values
  // ======================================================
  const searchInObject = (obj: Record<string, any>, query: string): boolean => {
    return Object.values(obj).some((value) => {
      if (value == null) return false
      if (typeof value === 'string') return value.toLowerCase().includes(query)
      if (typeof value === 'number') return String(value).includes(query)
      if (typeof value === 'boolean') return String(value).includes(query)
      return false
    })
  }

  // ======================================================
  // FILTERED ROWS - Client-side filtering
  // ======================================================

  const filteredRows = useMemo(() => {
    let filtered = [...rows]

    // Apply search query - searches across ALL fields/keys
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((row) => searchInObject(row, query))
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((row) => row.status === statusFilter)
    }

    // Apply action type filter
    if (actionTypeFilter !== 'all') {
      filtered = filtered.filter((row) => row.actionType === actionTypeFilter)
    }

    return filtered
  }, [rows, searchQuery, statusFilter, actionTypeFilter])
  console.log(filteredRows, "filteredRows")
  const filteredCount = filteredRows.length
  // ======================================================
  // COLUMNS
  // ======================================================

  const columns = useMemo(
    () => [
      columnHelper.accessor('certificateSno', {
        header: '#',
        cell: (info) => (
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full
              bg-blue-100
              text-xs font-bold text-blue-700
            "
          >
            {info.getValue()}
          </div>
        ),
      }),

      columnHelper.accessor('certificateNo', {
        header: 'DRC Number',
        cell: (info) => {
          const row = info.row.original

          return (
            <Link
              to={`/dashboard/certificates/drc/${encodeURIComponent(
                row.drcId,
              )}`}
              className="
                font-mono text-xs font-bold
                text-[#1677ff]
                hover:underline
              "
            >
              {row.certificateNo}
            </Link>
          )
        },
      }),

      columnHelper.accessor('holderName', {
        header: 'Holder',
        cell: (info) => (
          <span className="font-semibold text-slate-700">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor('applicationId', {
        header: 'Application ID',
        cell: (info) => (
          <span className="font-mono text-xs">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor('drcId', {
        header: 'DRC ID',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-600">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor('actionType', {
        header: 'Action Type',
        cell: (info) => {
          const ap =
            actionTypePresentation[info.getValue()]

          return (
            <span
              className={`
                inline-flex rounded-full
                px-3 py-1
                text-[10px]
                font-bold uppercase
                ${ap.className}
              `}
            >
              {ap.label}
            </span>
          )
        },
      }),

      columnHelper.accessor('totalArea', {
        header: 'Total Area (sq.m)',
        cell: (info) => (
          <span className="font-semibold text-sky-700">
            {info.getValue() ?? '—'}
          </span>
        ),
      }),

      columnHelper.accessor('proposedArea', {
        header: 'Proposed Area (sq.m)',
        cell: (info) => (
          <span className="font-semibold text-orange-600">
            {info.getValue() ?? '—'}
          </span>
        ),
      }),

      columnHelper.accessor('timestamp', {
        header: 'Created Date',
        cell: (info) => (
          <span className="text-slate-600">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`
              inline-flex rounded-full
              px-3 py-1
              text-[10px]
              font-bold uppercase
              ${statusStyles[info.getValue()]}
            `}
          >
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const row = info.row.original

          return (
            <TableActionMenu
              drcId={row.drcId}
              certificateNo={row.certificateNo}
            />
          )
        },
      }),
    ],
    [],
  )

  // ======================================================
  // TABLE
  // ======================================================

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel:
      getPaginationRowModel(),
  })

  // ======================================================
  // LOADING
  // ======================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-lg">
          Loading DRC Ledger...
        </div>
      </div>
    )
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <section className={cardClass}>
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white">
        {/* Header */}
        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              DRC Certificate Ledger
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete transaction history and certificate tracking
            </p>
          </div>
          <div className="flex  items-center gap-6 border-t border-slate-100 px-6 py-3">
            <div className="flex items-center gap-2 bg-red-200 px-3 py-1 rounded-md">
              <span className="text-sm font-medium text-slate-500">
                Total Records:
              </span>
              <span className="text-lg font-bold text-slate-900">
                {countTotal.toLocaleString()}
              </span>
            </div>

            <div className="h-5 w-px bg-slate-300" />

            <div className="flex items-center gap-2 bg-green-200 px-3 py-1 rounded-md">
              <span className="text-sm font-medium text-slate-500">
                Active Filters:
              </span>
              <span className="text-lg font-bold text-blue-600">
                {
                  [
                    searchQuery,
                    statusFilter !== 'all',
                    actionTypeFilter !== 'all',
                  ].filter(Boolean).length
                }
              </span>
            </div>
          </div>
          <button
            onClick={() => downloadDrcHistoryCsv(filteredRows)}
            className="
        inline-flex items-center gap-2
        rounded-lg
        border border-slate-300
        bg-white
        px-4 py-2
        text-sm font-medium
        text-slate-700
        hover:bg-slate-50
      "
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
              />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-12">

            {/* Search */}
            <div className="relative lg:col-span-6">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificate no, holder, application ID..."
                className="
            w-full rounded-lg border border-slate-300
            py-2.5 pl-10 pr-10 text-sm
            focus:border-blue-500
            focus:ring-2 focus:ring-blue-100
            outline-none
          "
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <FiX className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as ApiStatus | 'all'
                  )
                }
                className="
            w-full rounded-lg border border-slate-300
            px-3 py-2.5 text-sm
          "
              >
                <option value="all">All Status</option>
                <option value="VALID">Valid</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="UTILIZED">Utilized</option>
                <option value="EDITED">Edited</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>

            {/* Action */}
            <div className="lg:col-span-2">
              <select
                value={actionTypeFilter}
                onChange={(e) =>
                  setActionTypeFilter(
                    e.target.value as DrcHistoryFlatRow['actionType'] | 'all'
                  )
                }
                className="
            w-full rounded-lg border border-slate-300
            px-3 py-2.5 text-sm
          "
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Issued</option>
                <option value="UPDATE">Updated</option>
                <option value="TRANSFER">Transferred</option>
                <option value="UTILIZATION">Utilized</option>
                <option value="DELETE">Deleted</option>
              </select>
            </div>

            {/* Reset */}
            <div className="lg:col-span-2">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setActionTypeFilter('all')
                }}
                className="
            w-full rounded-lg
            border border-slate-300
            bg-slate-50
            px-4 py-2.5
            text-sm font-medium
            hover:bg-slate-100
          "
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[1700px] w-full">
          <thead>
            {table.getHeaderGroups().map(
              (headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header) => (
                      <th
                        key={header.id}
                        className={tableHeaderClass}
                      >
                        {flexRender(
                          header.column.columnDef
                            .header,
                          header.getContext(),
                        )}
                      </th>
                    ),
                  )}
                </tr>
              ),
            )}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(
              (row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`
                    transition-all duration-200
                    hover:bg-blue-50/60
                    ${rowIndex % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50/40'
                    }
                  `}
                >
                  {row.getVisibleCells().map(
                    (cell) => (
                      <td
                        key={cell.id}
                        className={tableCellClass}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div
        className="
          flex flex-col items-center justify-between gap-4
          border-t border-slate-200
          bg-gradient-to-r from-slate-50 to-slate-100
          px-6 py-4
          sm:flex-row
        "
      >
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + table.getRowModel().rows.length}
          </span>
          {' '} of {' '}
          <span className="font-semibold text-slate-900">
            {filteredCount.toLocaleString()}
          </span>
          {' '}
          {searchQuery || statusFilter !== 'all' || actionTypeFilter !== 'all' ? (
            <>
              <span className="text-slate-500">filtered</span> {' '}
              <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                Total: {countTotal.toLocaleString()}
              </span>
            </>
          ) : (
            'records'
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="
              inline-flex items-center gap-1
              rounded-lg
              border border-slate-300
              bg-white
              px-3 py-2
              text-sm font-semibold
              text-slate-700
              hover:bg-slate-50 hover:border-slate-400
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div
            className="
              inline-flex items-center gap-1
              rounded-lg
              bg-gradient-to-r from-blue-600 to-indigo-600
              px-4 py-2
              text-sm font-bold text-white
              shadow-md
            "
          >
            <span>
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-blue-200">/</span>
            <span>
              {table.getPageCount()}
            </span>
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="
              inline-flex items-center gap-1
              rounded-lg
              border border-slate-300
              bg-white
              px-3 py-2
              text-sm font-semibold
              text-slate-700
              hover:bg-slate-50 hover:border-slate-400
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}