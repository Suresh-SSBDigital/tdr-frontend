import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
} from 'react-icons/fi'

import type {
  ApplicationStatus,
  TdrApplicationRecord,
} from '../data/tdrApplicationsData'

import { formatAreaSqM } from '../helpers/applyTableAreas'
import type { ApplySortKey } from './ApplyTdrFilters'

/* =========================================================
   COLUMN WIDTHS
========================================================= */

const COLUMN_WIDTHS_PX = [
  90, // SR No.
  180, 140, 180, 120, 120, 150, 150, 150,
  150, 150, 150, 150, 130, 160, 100,
] as const


const TABLE_MIN_WIDTH_PX =
  COLUMN_WIDTHS_PX.reduce((a, b) => a + b, 0)

/* =========================================================
   PREMIUM TABLE STYLES
========================================================= */

const thClass = `
  sticky top-0 z-20
  border-b border-white/10
  bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#312e81]
  px-4 py-3
  text-left text-[11px]
  font-bold uppercase tracking-[0.08em]
  text-white
  whitespace-nowrap
  shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]
`

const tdClass = `
border-b border-slate-200
px-5 py-5
text-sm text-slate-700
whitespace-normal break-words
align-top
`

/* =========================================================
   STATUS PILLS
========================================================= */

const statusPill: Record<ApplicationStatus, string> = {
  Draft:
    'bg-slate-100 text-slate-700 ring-1 ring-slate-200',

  Pending:
    'bg-blue-100 text-blue-700 ring-1 ring-blue-200',

  'Under Review':
    'bg-amber-100 text-amber-700 ring-1 ring-amber-200',

  Approved:
    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',

  Rejected:
    'bg-red-100 text-red-700 ring-1 ring-red-200',

  'DRC Issued':
    'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
}

const columnHelper =
  createColumnHelper<TdrApplicationRecord>()

function buildTxQuery(a: TdrApplicationRecord) {
  const txQ = new URLSearchParams()

  if (a.rid) txQ.set('rid', a.rid)

  if (a.samagraId && a.samagraId !== '-') {
    txQ.set('samagra_id', a.samagraId)
  }

  return txQ.toString()
}

interface ApplyTdrTableProps {
  rows: TdrApplicationRecord[]
  sortKey: ApplySortKey
  sortDir: 'asc' | 'desc'
  onToggleSort: (key: ApplySortKey) => void
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ApplyTdrTable({
  rows,
  sortKey,
  sortDir,
  onToggleSort,
}: ApplyTdrTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'srNo',
        header: 'SR No.',
        cell: ({ row }) => {
          // row.index comes from the current table row ordering (after sorting/filtering)
          return (
            <span className="tabular-nums font-medium text-slate-700">
              {row.index + 1}
            </span>
          )
        },
      }),

      columnHelper.accessor('id', {

        header: 'Application ID',

        cell: ({ getValue }) => {
          const id = getValue()

          return (
            <Link
              to={`/dashboard/apply/${encodeURIComponent(
                id,
              )}`}
              className="
                font-mono text-xs font-semibold
                text-blue-700 hover:text-blue-900
                hover:underline
              "
            >
              {id}
            </Link>
          )
        },
      }),

      columnHelper.accessor('samagraId', {
        header: 'TDR App ID',

        cell: ({ getValue }) => (
          <div className="whitespace-normal break-all font-mono text-xs text-slate-700">
            {getValue()}
          </div>
        ),
      }),

      columnHelper.accessor('applicantName', {
        header: () => (
          <button
            type="button"
            onClick={() =>
              onToggleSort('applicantName')
            }
            className="flex items-center gap-1 font-semibold"
          >
            Applicant Name

            <SortIcon
              active={
                sortKey === 'applicantName'
              }
              dir={sortDir}
            />
          </button>
        ),

        cell: ({ getValue }) => (
          <div className="max-w-[160px] whitespace-normal break-words font-semibold leading-5 text-slate-800">
            {getValue()}
          </div>
        ),
      }),

      columnHelper.accessor('district', {
        header: () => (
          <button
            type="button"
            onClick={() =>
              onToggleSort('district')
            }
            className="flex items-center gap-1 font-semibold"
          >
            District

            <SortIcon
              active={sortKey === 'district'}
              dir={sortDir}
            />
          </button>
        ),
      }),

      columnHelper.accessor('tehsil', {
        header: 'Tehsil',
      }),

      columnHelper.display({
        id: 'totalArea',

        header: 'Total area (sq.m)',

        cell: ({ row }) => (
          <span className="tabular-nums font-medium">
            {formatAreaSqM(
              row.original.totalAreaSqM ??
              row.original.landAreaSqM,
            )}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'proposedArea',

        header: 'Proposed area (sq.m)',

        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatAreaSqM(
              row.original.proposedAreaSqM,
            )}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'remainingArea',

        header: 'Remaining area (sq.m)',

        cell: ({ row }) => (
          <span className="tabular-nums font-semibold text-indigo-700">
            {formatAreaSqM(
              row.original.remainingAreaSqM,
            )}
          </span>
        ),
      }),

      columnHelper.accessor('tdrValueCr', {
        header: () => (
          <button
            type="button"
            onClick={() =>
              onToggleSort('tdrValueCr')
            }
            className="flex items-center gap-1 font-semibold"
          >
            Total TDR value

            <SortIcon
              active={
                sortKey === 'tdrValueCr'
              }
              dir={sortDir}
            />
          </button>
        ),

        cell: ({ getValue }) => (
          <span className="tabular-nums font-semibold text-blue-700">
            ₹{' '}
            {getValue().toLocaleString('en-IN')}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'transferredTdr',

        header: 'Transferred TDR',

        cell: ({ row }) => (
          <span className="tabular-nums text-orange-600">
            {(
              row.original.transferredTdrValue ??
              0
            ).toLocaleString('en-IN')}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'utilizedTdr',

        header: 'Utilized TDR',

        cell: ({ row }) => (
          <span className="tabular-nums text-violet-700">
            {(
              row.original.utilizedTdrValue ??
              0
            ).toLocaleString('en-IN')}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'remainingTdr',

        header: 'Remaining TDR',

        cell: ({ row }) => (
          <span className="tabular-nums font-bold text-emerald-700">
            {(
              row.original.remainingTdrValue ??
              0
            ).toLocaleString('en-IN')}
          </span>
        ),
      }),

      columnHelper.accessor('status', {
        header: () => (
          <button
            type="button"
            onClick={() =>
              onToggleSort('status')
            }
            className="flex items-center gap-1 font-semibold"
          >
            Status

            <SortIcon
              active={sortKey === 'status'}
              dir={sortDir}
            />
          </button>
        ),

        cell: ({ getValue }) => {
          const status = getValue()

          return (
            <span
              className={`
                inline-flex items-center justify-center
                rounded-full px-3 py-1
                text-[11px] font-bold
                uppercase tracking-wide
                ${statusPill[status]}
              `}
            >
              {status}
            </span>
          )
        },
      }),

      columnHelper.accessor('appliedOn', {
        header: 'Created At',

        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-slate-600">
            {getValue()}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'actions',

        header: () => (
          <span className="block text-center">
            Actions
          </span>
        ),

        cell: ({ row }) => {
          const a = row.original

          const qs = buildTxQuery(a)

          const base = `/dashboard/apply/${encodeURIComponent(
            a.id,
          )}`

          return (
            <ActionMenu
              transactionsTo={`${base}/transactions?${qs}`}
              historyTo={`${base}/history?${qs}`}
              totalHistoryTo={`${base}/total-history?${qs}`}
            />
          )
        },
      }),
    ],
    [sortKey, sortDir, onToggleSort],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),

    getRowId: (row, index) =>
      `${row.id}::${index}`,
  })

  const colCount = columns.length

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)]">

      {/* HEADER */}

      <div className="border-b border-slate-200 bg-gradient-to-r from-[#0f172b] via-[#1e40af] to-[#312e81] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              TDR Applications
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              Manage all TDR applications &
              transactions
            </p>
          </div>

          <div
            className="
    flex items-center gap-3
    rounded-2xl
    border border-white/10
    bg-white/10
    px-4 py-2
    backdrop-blur-md
    shadow-lg
  "
          >
            <p
              className="
      text-[11px]
      font-semibold
      uppercase
      tracking-[2px]
      text-blue-100
      whitespace-nowrap
    "
            >
              Total Records
            </p>

            <p
              className="
      text-2xl
      font-bold
      leading-none
      text-white
    "
            >
              {rows.length}
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="max-h-[72vh] overflow-auto">
        <table
          className="w-full table-fixed border-separate border-spacing-0"
          style={{
            minWidth: TABLE_MIN_WIDTH_PX,
          }}
        >
          <colgroup>
            {COLUMN_WIDTHS_PX.map((w, i) => (
              <col
                key={i}
                style={{ width: w }}
              />
            ))}
          </colgroup>

          {/* HEADER */}

          <thead>
            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header) => {
                      const isActions =
                        header.column.id ===
                        'actions'

                      return (
                        <th
                          key={header.id}
                          className={`${thClass} ${isActions
                            ? 'text-center'
                            : ''
                            }`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column
                                .columnDef
                                .header,
                              header.getContext(),
                            )}
                        </th>
                      )
                    },
                  )}
                </tr>
              ))}
          </thead>

          {/* BODY */}

          <tbody>
            {table.getRowModel().rows.length ===
              0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className={`${tdClass} py-10 text-center text-sm text-slate-400`}
                >
                  No applications found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(
                (row, index) => (
                  <tr
                    key={row.id}
                    className={`
                      transition-all duration-200
                      hover:bg-blue-50/50
                      ${index % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/40'
                      }
                    `}
                  >
                    {row
                      .getVisibleCells()
                      .map((cell) => {
                        const isActions =
                          cell.column.id ===
                          'actions'

                        return (
                          <td
                            key={cell.id}
                            className={`${tdClass}${isActions
                              ? ' text-center'
                              : ''
                              }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        )
                      })}
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* =========================================================
   SORT ICON
========================================================= */

function SortIcon({
  active,
  dir,
}: {
  active: boolean
  dir: 'asc' | 'desc'
}) {
  if (active) {
    return dir === 'asc' ? (
      <FiChevronUp className="text-blue-300" />
    ) : (
      <FiChevronDown className="text-blue-300" />
    )
  }

  return (
    <span
      className="inline-flex flex-col opacity-40"
      aria-hidden
    >
      <FiChevronUp className="-mb-1 h-3 w-3" />
      <FiChevronDown className="h-3 w-3" />
    </span>
  )
}

/* =========================================================
   ACTION MENU
========================================================= */

function ActionMenu({
  transactionsTo,
  historyTo,
  totalHistoryTo,
}: {
  transactionsTo: string
  historyTo: string
  totalHistoryTo: string
}) {
  const [open, setOpen] = useState(false)

  const menuRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  return (
    <div
      className="relative inline-block"
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className="
          flex h-10 w-10 items-center justify-center
          rounded-xl
          border border-slate-200
          bg-white
          shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-slate-50
          hover:shadow-md
        "
      >
        <FiMoreVertical className="h-5 w-5 text-slate-700" />
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-12 z-50
            w-64
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            py-2
            shadow-[0_12px_30px_-10px_rgba(15,23,42,0.25)]
          "
        >
          <Link
            to={transactionsTo}
            onClick={() => setOpen(false)}
            className="
              block px-5 py-3
              text-sm font-medium text-slate-700
              transition-all duration-200
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            Transaction History
          </Link>

          <Link
            to={historyTo}
            onClick={() => setOpen(false)}
            className="
              block px-5 py-3
              text-sm font-medium text-slate-700
              transition-all duration-200
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            Activity History
          </Link>

          <Link
            to={totalHistoryTo}
            onClick={() => setOpen(false)}
            className="
              block px-5 py-3
              text-sm font-medium text-slate-700
              transition-all duration-200
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            Total History Tree
          </Link>
        </div>
      )}
    </div>
  )
}