import { useMemo, useState, type ReactNode } from 'react'
import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi'

const cardClass = 'rounded-lg border border-[#e8e8e8] bg-white p-4 shadow-sm'
const inputClass =
  'w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-sm text-[#262626] placeholder:text-[#bfbfbf] focus:border-[#1890ff] focus:outline-none focus:ring-1 focus:ring-[#1890ff]'
const thClass =
  'border-b border-[#f0f0f0] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#595959]'
const tdClass = 'border-b border-[#fafafa] px-3 py-2.5 text-sm text-[#262626]'

export type PortalColumn<T> = {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
}

type SortDir = 'asc' | 'desc'

function cellText<T extends object>(row: T, key: keyof T) {
  const v = row[key]
  if (v == null) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function compare<T extends object>(a: T, b: T, key: keyof T, dir: SortDir) {
  const va = a[key]
  const vb = b[key]
  let c = 0
  if (typeof va === 'number' && typeof vb === 'number') c = va - vb
  else c = String(va ?? '').localeCompare(String(vb ?? ''), undefined, { numeric: true })
  return dir === 'asc' ? c : -c
}

function escapeCsv(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`
  return v
}

function downloadCsv<T extends object>(rows: T[], columns: PortalColumn<T>[], filename: string) {
  const header = columns.map((c) => escapeCsv(String(c.label))).join(',')
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.render ? String(cellText(row, c.key)) : cellText(row, c.key)
        return escapeCsv(raw)
      })
      .join(','),
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function PortalDataTablePage<T extends object>({
  variant = 'page',
  title,
  subtitle,
  cardTitle,
  columns,
  rows: sourceRows,
  filterKey,
  filterLabel = 'Filter',
  searchPlaceholder = 'Search all columns…',
  exportFileName = 'export.csv',
  showExport = true,
}: {
  /** `embedded` = card only (for drill-down pages); `page` = full page with heading */
  variant?: 'page' | 'embedded'
  title?: string
  subtitle?: string
  /** Shown inside the card when variant is embedded */
  cardTitle?: string
  columns: PortalColumn<T>[]
  rows: T[]
  /** Property name on each row for dropdown filter (e.g. district) */
  filterKey?: string
  filterLabel?: string
  searchPlaceholder?: string
  exportFileName?: string
  showExport?: boolean
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [sortKey, setSortKey] = useState<keyof T>(columns[0].key)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const distinctFilter = useMemo(() => {
    if (!filterKey) return []
    const s = new Set<string>()
    for (const r of sourceRows) {
      const v = (r as Record<string, unknown>)[filterKey]
      if (v != null && v !== '') s.add(String(v))
    }
    return Array.from(s).sort()
  }, [sourceRows, filterKey])

  const { rows, total } = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = sourceRows.filter((row) => {
      if (filterKey && filter !== 'All') {
        if (String((row as Record<string, unknown>)[filterKey]) !== filter) return false
      }
      if (!q) return true
      return columns.some((c) => cellText(row, c.key).toLowerCase().includes(q))
    })
    const sk = sortKey
    const col = columns.find((c) => c.key === sk)
    if (col?.sortable !== false) {
      list = [...list].sort((a, b) => compare(a, b, sk, sortDir))
    }
    return { rows: list, total: list.length }
  }, [sourceRows, search, filter, filterKey, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: keyof T) => {
    const col = columns.find((c) => c.key === key)
    if (col?.sortable === false) return
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const tableSection = (
      <section className={`${cardClass} space-y-4`}>
        {variant === 'embedded' && cardTitle ? (
          <h2 className="border-b border-[#f0f0f0] pb-2 text-sm font-semibold text-[#262626]">{cardTitle}</h2>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-[#595959]">
            {total} record{total === 1 ? '' : 's'} (filtered)
          </p>
          {showExport ? (
            <button
              type="button"
              onClick={() => downloadCsv(rows, columns, exportFileName)}
              className="rounded-md bg-[#1890ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#40a9ff]"
            >
              Export CSV
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative lg:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bfbfbf]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              className={`${inputClass} pl-10`}
            />
          </div>
          {filterKey && distinctFilter.length > 0 ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-[#595959]">{filterLabel}</label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value)
                  setPage(1)
                }}
                className={inputClass}
              >
                <option value="All">All</option>
                {distinctFilter.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-md border border-[#f0f0f0]">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#fafafa]">
              <tr>
                {columns.map((c) => (
                  <th key={String(c.key)} className={thClass}>
                    {c.sortable === false ? (
                      c.label
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 font-semibold text-[#595959] hover:text-[#1890ff]"
                      >
                        {c.label}
                        {sortKey === c.key ? (
                          sortDir === 'asc' ? (
                            <FiChevronUp className="text-[#1890ff]" />
                          ) : (
                            <FiChevronDown className="text-[#1890ff]" />
                          )
                        ) : (
                          <span className="inline-flex flex-col opacity-40">
                            <FiChevronUp className="-mb-1 h-3 w-3" />
                            <FiChevronDown className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-[#8c8c8c]">
                    No records match.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#fafafa]">
                    {columns.map((c) => (
                      <td key={String(c.key)} className={tdClass}>
                        {c.render ? c.render(row) : cellText(row, c.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[#595959]">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="rounded-md border border-[#d9d9d9] px-2 py-1"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-[#d9d9d9] px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-[#595959]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-[#d9d9d9] px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
  )

  if (variant === 'embedded') {
    return tableSection
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#262626]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#8c8c8c]">{subtitle}</p> : null}
      </div>
      {tableSection}
    </div>
  )
}
