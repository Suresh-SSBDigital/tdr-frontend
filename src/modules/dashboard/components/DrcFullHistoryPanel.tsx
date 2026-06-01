import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
        header: 'Action',
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
        header: 'Total Area',
        cell: (info) => (
          <span className="font-semibold text-sky-700">
            {info.getValue() ?? '—'}
          </span>
        ),
      }),

      columnHelper.accessor('proposedArea', {
        header: 'Proposed Area',
        cell: (info) => (
          <span className="font-semibold text-orange-600">
            {info.getValue() ?? '—'}
          </span>
        ),
      }),

      columnHelper.accessor('remainingTdrValue', {
        header: 'Remaining TDR',
        cell: (info) => (
          <span className="font-bold text-emerald-700">
            {info.getValue()?.toLocaleString('en-IN') ??
              '—'}
          </span>
        ),
      }),

      columnHelper.accessor('timestamp', {
        header: 'Date',
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
    data: rows,
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
      <div
        className="
          flex items-center justify-between
          border-b border-slate-200
          bg-gradient-to-r
          from-[#0f172a]
          via-[#1d4ed8]
          to-[#312e81]
          px-6 py-5
        "
      >
        <div>
          <h2 className="text-xl font-bold text-white">
            DRC Certificate Ledger
          </h2>

          <p className="mt-1 text-xs text-blue-100">
            Complete blockchain transaction history &
            tracking
          </p>
        </div>

        <button
          onClick={() =>
            downloadDrcHistoryCsv(
              table
                .getSortedRowModel()
                .rows.map((r) => r.original),
            )
          }
          className="
            rounded-xl
            border border-white/20
            bg-white/10
            px-4 py-2
            text-xs font-semibold text-white
            backdrop-blur-md
            transition-all
            hover:bg-white/20
          "
        >
          Export CSV
        </button>
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
                    ${
                      rowIndex % 2 === 0
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
          flex items-center justify-between
          border-t border-slate-200
          bg-slate-50
          px-6 py-4
        "
      >
        <div className="text-xs text-slate-500">
          Showing{' '}
          <span className="font-bold text-slate-700">
            {countTotal}
          </span>{' '}
          records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="
              rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2
              text-xs font-semibold
              disabled:opacity-40
            "
          >
            Previous
          </button>

          <div
            className="
              rounded-xl
              bg-gradient-to-r
              from-[#1d4ed8]
              to-[#4338ca]
              px-4 py-2
              text-xs font-bold text-white
            "
          >
            Page{' '}
            {table.getState().pagination.pageIndex +
              1}{' '}
            of {table.getPageCount()}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="
              rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2
              text-xs font-semibold
              disabled:opacity-40
            "
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}