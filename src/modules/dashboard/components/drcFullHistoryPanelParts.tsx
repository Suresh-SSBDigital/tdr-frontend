import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi'
import { flexRender, type PaginationState, type Table } from '@tanstack/react-table'
import type { DrcHistoryFlatRow } from '../data/certificateLedgerData'
import type { DrcApiTableRow } from './drcFullHistoryPanel.types'

const inputClass =
  'w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#262626] shadow-sm placeholder:text-[#bfbfbf] transition focus:border-[#1890ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20'
const thClass =
  'whitespace-nowrap px-2.5 py-3 text-left text-xs font-bold uppercase tracking-[0.06em] text-slate-600 sm:px-3'
const tdBase =
  'border-b border-slate-100 px-2.5 py-3 align-middle text-sm text-slate-800 transition-colors duration-100 group-hover:bg-slate-50/90 sm:px-3'

function renderSortableHeader(
  label: string,
  sorted: false | 'asc' | 'desc',
  onToggle: ((event: unknown) => void) | undefined,
) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 text-left font-bold text-slate-600 transition-colors hover:text-[#1890ff]"
    >
      {label}
      {sorted ? (
        sorted === 'asc' ? (
          <FiChevronUp className="shrink-0 text-[#1890ff]" aria-hidden />
        ) : (
          <FiChevronDown className="shrink-0 text-[#1890ff]" aria-hidden />
        )
      ) : (
        <span className="inline-flex shrink-0 flex-col opacity-40" aria-hidden>
          <FiChevronUp className="-mb-1 h-3 w-3" />
          <FiChevronDown className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}

export function PanelHeader({ isLoading, total, onExport }: { isLoading: boolean; total: number; onExport: () => void }) {
  return (
    <div className="border-b border-[#f0f0f0] bg-gradient-to-br from-[#fafbff] via-white to-[#f6fbff] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-[#1890ff]" aria-hidden />
            <p className="text-base font-semibold tracking-tight text-[#262626]">All DRC blockchain history</p>
          </div>
          <p className="text-sm text-[#8c8c8c]">
            {isLoading ? 'Loading DRC certificates…' : 'Every event from all certificate trees'} ·{' '}
            <span className="font-medium tabular-nums text-[#595959]">{total}</span> events after filters
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="shrink-0 rounded-lg bg-[#1890ff] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1890ff]/25 transition hover:bg-[#40a9ff] hover:shadow-lg hover:shadow-[#1890ff]/30"
        >
          Export filtered CSV
        </button>
      </div>
    </div>
  )
}

type FiltersProps = {
  allLabel: string
  search: string
  onSearch: (v: string) => void
  certSno: string
  onCertSno: (v: string) => void
  city: string
  onCity: (v: string) => void
  statusF: string
  onStatusF: (v: string) => void
  actionF: string
  onActionF: (v: string) => void
  certOptions: Array<{ sno: number; no: string }>
  uniqueCities: string[]
  distinctStatuses: DrcHistoryFlatRow['status'][]
  distinctActions: DrcHistoryFlatRow['actionType'][]
  actionLabels: Record<DrcHistoryFlatRow['actionType'], string>
}

export function FiltersBar({
  allLabel,
  search,
  onSearch,
  certSno,
  onCertSno,
  city,
  onCity,
  statusF,
  onStatusF,
  actionF,
  onActionF,
  certOptions,
  uniqueCities,
  distinctStatuses,
  distinctActions,
  actionLabels,
}: FiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <div className="relative mt-5 xl:col-span-2">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Holder, DRC no., app id, RID, DRC id…"
          className={`${inputClass} pl-10`}
          aria-label="Search history"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Certificate</label>
        <select value={certSno} onChange={(e) => onCertSno(e.target.value)} className={inputClass}>
          <option value={allLabel}>All certificates</option>
          {certOptions.map((o) => (
            <option key={o.sno} value={String(o.sno)}>
              #{o.sno} — {o.no}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">City</label>
        <select value={city} onChange={(e) => onCity(e.target.value)} className={inputClass}>
          <option value={allLabel}>All cities</option>
          {uniqueCities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Status</label>
        <select value={statusF} onChange={(e) => onStatusF(e.target.value)} className={inputClass}>
          <option value={allLabel}>All statuses</option>
          {distinctStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Action type</label>
        <select value={actionF} onChange={(e) => onActionF(e.target.value)} className={inputClass}>
          <option value={allLabel}>All actions</option>
          {distinctActions.map((s) => (
            <option key={s} value={s}>
              {actionLabels[s] ?? s}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function HistoryTable({ table }: { table: Table<DrcApiTableRow> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`${thClass}${header.column.id === 'view' || header.column.id === 'history' ? ' text-center' : ''}`}
                    scope="col"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.getCanSort()
                        ? renderSortableHeader(
                            String(header.column.columnDef.header),
                            header.column.getIsSorted(),
                            header.column.getToggleSortingHandler(),
                          )
                        : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-600">No rows match these filters</p>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-400">
                    Try clearing search or widening certificate / city filters.
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => {
                const r = row.original
                return (
                  <tr
                    key={r.rowId}
                    className={`group border-b border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`${tdBase} ${
                          cell.column.id === 'certificateSno'
                            ? 'min-w-0 tabular-nums'
                            : cell.column.id === 'applicationRid'
                              ? 'min-w-0 max-w-[11rem] sm:max-w-[18rem]'
                              : cell.column.id === 'timestampEpoch'
                                ? 'min-w-0 whitespace-normal sm:whitespace-nowrap'
                                : cell.column.id === 'view' || cell.column.id === 'history'
                                  ? 'text-center'
                                  : 'min-w-0'
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PaginationBar({
  table,
  pagination,
  total,
  totalPages,
  rangeStart,
  rangeEnd,
}: {
  table: Table<DrcApiTableRow>
  pagination: PaginationState
  total: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-[#f0f0f0] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#595959]">
        <span className="font-medium">Rows per page</span>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
            table.setPageIndex(0)
          }}
          className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm shadow-sm transition focus:border-[#1890ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#8c8c8c]">
          Showing {rangeStart}–{rangeEnd} of {total}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className="rounded-lg border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-[#262626] shadow-sm transition hover:border-[#1890ff] hover:text-[#1890ff] disabled:pointer-events-none disabled:opacity-35"
        >
          Previous
        </button>
        <span className="rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium tabular-nums text-[#434343]">
          Page {pagination.pageIndex + 1} / {totalPages}
        </span>
        <button
          type="button"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          className="rounded-lg border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-[#262626] shadow-sm transition hover:border-[#1890ff] hover:text-[#1890ff] disabled:pointer-events-none disabled:opacity-35"
        >
          Next
        </button>
      </div>
    </div>
  )
}
