import { Link } from 'react-router-dom'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { d, statusBadge } from './helpers'
import type { TransferRow, UtilizationRow } from './types'

// ======================================================
// PREMIUM HEADER + TABLE STYLES
// ======================================================

const th = `
  sticky top-0 z-10
  border-b border-[#dbeafe]
  bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#312e81]
  px-4 py-3
  text-center
  text-[11px]
  font-semibold
  uppercase
  tracking-[0.08em]
  text-white
  whitespace-nowrap
  shadow-sm
`

const td = `
  border-b border-slate-100
  px-4 py-3
  text-center
  text-[12px]
  text-slate-700
  whitespace-nowrap
`

// ======================================================
// COMMON TABLE
// ======================================================

function DataTable<T extends object>({
  rows,
  columns,
  emptyText,
  viewAllHref,
  buttonLabel,
  buttonGradient,
}: {
  rows: T[]
  columns: ColumnDef<T, unknown>[]
  emptyText: string
  viewAllHref: string
  buttonLabel: string
  buttonGradient: string
}) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* ======================================== */}
      {/* CARD HEADER */}
      {/* ======================================== */}

      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-lg font-bold text-transparent">
              Transaction Records
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Transfer & Utilization Details
            </p>
          </div>

          <Link
            to={viewAllHref}
            className={`
              inline-flex items-center justify-center
              rounded-xl
              px-4 py-2.5
              text-[12px]
              font-bold
              text-white
              shadow-md
              transition-all duration-300
              hover:-translate-y-0.5
              hover:shadow-lg
              ${buttonGradient}
            `}
          >
            {buttonLabel}
          </Link>
        </div>
      </div>

      {/* ======================================== */}
      {/* TABLE */}
      {/* ======================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={th}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm font-medium text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`
                    transition-all duration-200
                    hover:bg-blue-50/60
                    ${index % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50/40'
                    }
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={td}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ======================================================
// TRANSFER TABLE
// ======================================================

export function TransfersTable({
  rows,
  viewAllHref,
}: {
  rows: TransferRow[]
  viewAllHref: string
}) {
  const columnHelper =
    createColumnHelper<TransferRow>()

  const columns = useMemo<
    ColumnDef<TransferRow, unknown>[]
  >(
    () => [
      columnHelper.accessor('srNo', {
        header: 'SR. No.',
        cell: (info) => (
          <span className="font-semibold text-slate-700">
            {info.getValue()}
          </span>
        ),
      }) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor('trnId', {
        header: 'TRN ID',
        cell: (info) => (
          <span className="font-mono text-[11px] font-semibold text-violet-700">
            {info.getValue()}
          </span>
        ),
      }) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor('ownerFrom', {
        header: 'Owner From',
        cell: (info) => (
          <span className="font-medium text-slate-700">
            {info.getValue()}
          </span>
        ),
      }) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor('ownerTo', {
        header: 'Owner To',
        cell: (info) => (
          <span className="font-medium text-slate-700">
            {info.getValue()}
          </span>
        ),
      }) as ColumnDef<TransferRow, unknown>,

      // columnHelper.accessor('transferValue', {
      //   header: 'Transfer Value',
      //   cell: (info) => (
      //     <span className="font-bold text-emerald-600">
      //       {n(info.getValue())}
      //     </span>
      //   ),
      // }) as ColumnDef<TransferRow, unknown>,

      // columnHelper.accessor('beforeBalance', {
      //   header: 'Before Balance',
      //   cell: (info) => (
      //     <span className="font-bold text-blue-700">
      //       {n(info.getValue())}
      //     </span>
      //   ),
      // }) as ColumnDef<TransferRow, unknown>,

      // columnHelper.accessor('remaining', {
      //   header: 'Remaining',
      //   cell: (info) => (
      //     <span className="font-bold text-indigo-700">
      //       {n(info.getValue())}
      //     </span>
      //   ),
      // }) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor(
        'beforeTransferAreaSqM',
        {
          header: 'Before Area',
          cell: (info) =>
            info.getValue() == null ? (
              '-'
            ) : (
              <span className="font-semibold text-sky-700">
                {`${info
                  .getValue()!
                  .toLocaleString(
                    'en-IN',
                  )} sq.m`}
              </span>
            ),
        },
      ) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor(
        'usedTransferAreaSqM',
        {
          header: 'Used Area',
          cell: (info) =>
            info.getValue() == null ? (
              '-'
            ) : (
              <span className="font-semibold text-orange-600">
                {`${info
                  .getValue()!
                  .toLocaleString(
                    'en-IN',
                  )} sq.m`}
              </span>
            ),
        },
      ) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor(
        'remainingAreaSqM',
        {
          header: 'Remaining Area',
          cell: (info) =>
            info.getValue() == null ? (
              '-'
            ) : (
              <span className="font-semibold text-emerald-700">
                {`${info
                  .getValue()!
                  .toLocaleString(
                    'en-IN',
                  )} sq.m`}
              </span>
            ),
        },
      ) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => (
          <span className="font-medium text-slate-600">
            {d(info.getValue())}
          </span>
        ),
      }) as ColumnDef<TransferRow, unknown>,

      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`
              inline-flex items-center justify-center
              rounded-full px-3 py-1
              text-[11px] font-bold
              ring-1
              ${statusBadge(
              info.getValue(),
            )}
            `}
          >
            {info.getValue() ?? '-'}
          </span>
        ),
      }) as ColumnDef<TransferRow, unknown>,
    ],
    [columnHelper],
  )

  return (
    <DataTable
      rows={rows}
      columns={columns}
      emptyText="No transfer records."
      viewAllHref={viewAllHref}
      buttonLabel="View All Transfers"
      buttonGradient="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
    />
  )
}

// ======================================================
// UTILIZATION TABLE
// ======================================================

export function UtilizationsTable({
  rows,
  viewAllHref,
}: {
  rows: UtilizationRow[]
  viewAllHref: string
}) {
  const columnHelper =
    createColumnHelper<UtilizationRow>()

  const columns = useMemo<
    ColumnDef<UtilizationRow, unknown>[]
  >(
    () =>
      [
        columnHelper.display({
          id: 'srNo',

          header: 'SR. No.',

          cell: (info) => (
            <span className="font-bold text-slate-700">
              {info.row.index + 1}
            </span>
          ),
        }),
        columnHelper.accessor(
          'utilizationId',
          {
            header: 'Utilization ID',
            cell: (info) => (
              <span className="font-mono text-[11px] font-semibold text-violet-700">
                {info.getValue()}
              </span>
            ),
          },
        ),

        columnHelper.accessor('utilizedBy', {
          header: 'Utilized By',
          cell: (info) => (
            <span className="font-medium text-slate-700">
              {info.getValue()}
            </span>
          ),
        }),

        // columnHelper.accessor(
        //   'utilizedValue',
        //   {
        //     header: 'Utilized Value',
        //     cell: (info) => (
        //       <span className="font-bold text-emerald-600">
        //         {n(info.getValue())}
        //       </span>
        //     ),
        //   },
        // ),

        // columnHelper.accessor(
        //   'beforeBalance',
        //   {
        //     header: 'Before Balance',
        //     cell: (info) => (
        //       <span className="font-bold text-blue-700">
        //         {n(info.getValue())}
        //       </span>
        //     ),
        //   },
        // ),

        // columnHelper.accessor(
        //   'afterBalance',
        //   {
        //     header: 'After Balance',
        //     cell: (info) => (
        //       <span className="font-bold text-indigo-700">
        //         {n(info.getValue())}
        //       </span>
        //     ),
        //   },
        // ),

        columnHelper.accessor(
          'beforeUtilizationAreaSqM',
          {
            header: 'Before Area',
            cell: (info) =>
              info.getValue() == null
                ? '-'
                : (
                  <span className="font-semibold text-sky-700">
                    {`${info
                      .getValue()!
                      .toLocaleString(
                        'en-IN',
                      )} sq.m`}
                  </span>
                ),
          },
        ),

        columnHelper.accessor(
          'usedUtilizationAreaSqM',
          {
            header: 'Used Area',
            cell: (info) =>
              info.getValue() == null
                ? '-'
                : (
                  <span className="font-semibold text-orange-600">
                    {`${info
                      .getValue()!
                      .toLocaleString(
                        'en-IN',
                      )} sq.m`}
                  </span>
                ),
          },
        ),

        columnHelper.accessor(
          'remainingAreaSqM',
          {
            header: 'Remaining Area',
            cell: (info) =>
              info.getValue() == null
                ? '-'
                : (
              <span className="font-semibold text-emerald-700">
                {`${info
                  .getValue()!
                  .toLocaleString(
                    'en-IN',
                  )} sq.m`}
              </span>
            ),
          },
        ),

        columnHelper.accessor('purpose', {
          header: 'Purpose',
          cell: (info) => (
            <span
              className="inline-block max-w-[260px] truncate"
              title={info.getValue()}
            >
              {info.getValue()}
            </span>
          ),
        }),

        columnHelper.accessor('date', {
          header: 'Date',
          cell: (info) => d(info.getValue()),
        }),

        columnHelper.accessor('status', {
          header: 'Status',
          cell: (info) => (
            <span
              className={`
                inline-flex items-center justify-center
                rounded-full px-3 py-1
                text-[11px] font-bold
                ring-1
                ${statusBadge(
                info.getValue(),
              )}
              `}
            >
              {info.getValue() ?? '-'}
            </span>
          ),
        }),
      ] as ColumnDef<
        UtilizationRow,
        unknown
      >[],
    [columnHelper],
  )

  return (
    <DataTable
      rows={rows}
      columns={columns}
      emptyText="No utilization records."
      viewAllHref={viewAllHref}
      buttonLabel="View All Utilizations"
      buttonGradient="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
    />
  )
}

