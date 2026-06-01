import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiChevronUp, FiDownload, FiEye, FiSearch } from 'react-icons/fi'
import {
  buildLedgerData,
  certificateRecords,
  getDrcBalanceCategory,
  type CertificateRecord,
  type DrcBalanceFilter,
  uniqueCertificateCities,
  TOTAL_CERTIFICATES,
} from '../data/certificateLedgerData'
import { downloadCertificateRegistryCsv } from '../helpers/csvHelpers'
import { downloadDrcCertificatePdfFromRecord } from '../helpers/drcCertificatePdf'

const cardClass =
  'rounded-lg border border-[#e8e8e8] bg-white p-4 shadow-sm'

const inputClass =
  'w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-sm text-[#262626] placeholder:text-[#bfbfbf] focus:border-[#1890ff] focus:outline-none focus:ring-1 focus:ring-[#1890ff]'

const thClass =
  'border border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#595959]'
const tdClass = 'border border-[#f0f0f0] px-3 py-2.5 text-sm text-[#262626] align-middle'
const tdNumClass = `${tdClass} text-right tabular-nums`

type SortKey = keyof Pick<
  CertificateRecord,
  'sno' | 'name' | 'city' | 'certificateNo' | 'issueTransactionNo' | 'issueDate' | 'issuedArea' | 'balanceArea' | 'marketValue'
>
type SortDir = 'asc' | 'desc'

const balanceLabel: Record<'full_balance' | 'partial' | 'zero_balance', string> = {
  full_balance: 'Full balance',
  partial: 'Partial utilization',
  zero_balance: 'Fully utilized',
}

function balanceBadge(category: ReturnType<typeof getDrcBalanceCategory>) {
  if (category === 'full_balance') return 'bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]'
  if (category === 'partial') return 'bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]'
  return 'bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]'
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  align = 'left',
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  align?: 'left' | 'right'
}) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'
  return (
    <th className={`${thClass} ${alignClass}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex w-full items-center gap-1 font-semibold text-[#595959] hover:text-[#1890ff] ${align === 'right' ? 'justify-end' : 'justify-start'}`}
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <FiChevronUp className="text-[#1890ff]" aria-hidden />
          ) : (
            <FiChevronDown className="text-[#1890ff]" aria-hidden />
          )
        ) : (
          <span className="inline-flex flex-col opacity-40" aria-hidden>
            <FiChevronUp className="-mb-1 h-3 w-3" />
            <FiChevronDown className="h-3 w-3" />
          </span>
        )}
      </button>
    </th>
  )
}

type CertificateRegistryPanelProps = {
  /** From `/dashboard/certificates?app=APP-…` — focuses registry on that TDR application */
  initialApplicationId?: string
  /** From `/dashboard/certificates?holder=…` — show only DRCs for this Samagra id */
  initialHolderSamagra?: string
}

export default function CertificateRegistryPanel({
  initialApplicationId,
  initialHolderSamagra,
}: CertificateRegistryPanelProps) {
  const [search, setSearch] = useState(initialApplicationId ?? '')
  const [city, setCity] = useState<string>('All')
  const [balanceFilter, setBalanceFilter] = useState<DrcBalanceFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('sno')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [includeLatestForHolder, setIncludeLatestForHolder] = useState(false)

  useEffect(() => {
    if (initialApplicationId) {
      setSearch(initialApplicationId)
      setPage(1)
    }
  }, [initialApplicationId])

  useEffect(() => {
    if (initialHolderSamagra) {
      setIncludeLatestForHolder(false)
      setPage(1)
    }
  }, [initialHolderSamagra])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const { rows, total } = useMemo(() => {
    const q = search.trim().toLowerCase()
    const latestHolderSno = initialHolderSamagra
      ? certificateRecords
          .filter((r) => r.holderSamagraId === initialHolderSamagra)
          .reduce((mx, r) => Math.max(mx, r.sno), -1)
      : -1

    let list = certificateRecords.filter((r) => {
      if (initialHolderSamagra && r.holderSamagraId !== initialHolderSamagra) return false
      if (initialHolderSamagra && !includeLatestForHolder && r.sno === latestHolderSno) return false
      if (city !== 'All' && r.city !== city) return false
      const cat = getDrcBalanceCategory(r)
      if (balanceFilter !== 'all' && cat !== balanceFilter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.certificateNo.toLowerCase().includes(q) ||
        r.issueTransactionNo.toLowerCase().includes(q) ||
        r.issueDate.toLowerCase().includes(q) ||
        String(r.sno).includes(q) ||
        String(r.issuedArea).includes(q) ||
        String(r.balanceArea).includes(q) ||
        (r.applicationId?.toLowerCase().includes(q) ?? false) ||
        (r.holderSamagraId?.toLowerCase().includes(q) ?? false)
      )
    })

    list = [...list].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      let c = 0
      if (typeof va === 'number' && typeof vb === 'number') c = va - vb
      else c = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDir === 'asc' ? c : -c
    })

    return { rows: list, total: list.length }
  }, [search, city, balanceFilter, sortKey, sortDir, initialHolderSamagra, includeLatestForHolder])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  /** Same Samagra/name for every row — hide columns to avoid a huge empty grid when filtered */
  const showHolderColumns = !initialHolderSamagra
  const columnCount = showHolderColumns ? 13 : 11

  return (
    <section className={`${cardClass} space-y-4`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#262626]">DRC certificate registry</p>
          <p className="text-xs text-[#8c8c8c]">
            Total in system: {TOTAL_CERTIFICATES} · Showing {total} after filters
            {initialApplicationId ? (
              <span className="ml-1 font-medium text-[#1890ff]">· Filtered by application {initialApplicationId}</span>
            ) : null}
            {initialHolderSamagra ? (
              <span className="ml-1 font-medium text-[#722ed1]">
                · All DRCs for Samagra <span className="font-mono">{initialHolderSamagra}</span>
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCertificateRegistryCsv(rows)}
          className="rounded-md bg-[#1890ff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#40a9ff]"
        >
          Export filtered CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bfbfbf]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, certificate no., tx no., area, date…"
            className={`${inputClass} pl-10`}
            aria-label="Search certificates"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#595959]">City</label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          >
            <option value="All">All cities</option>
            {uniqueCertificateCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#595959]">Balance / utilization</label>
          <select
            value={balanceFilter}
            onChange={(e) => {
              setBalanceFilter(e.target.value as DrcBalanceFilter)
              setPage(1)
            }}
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="full_balance">Full balance</option>
            <option value="partial">Partial utilization</option>
            <option value="zero_balance">Fully utilized (zero balance)</option>
          </select>
        </div>
      </div>
      {initialHolderSamagra ? (
        <div className="rounded-md border border-[#f0f0f0] bg-[#fafafa] px-3 py-2">
          <label className="inline-flex items-center gap-2 text-sm text-[#434343]">
            <input
              type="checkbox"
              checked={includeLatestForHolder}
              onChange={(e) => {
                setIncludeLatestForHolder(e.target.checked)
                setPage(1)
              }}
              className="h-4 w-4 rounded border-[#bfbfbf] text-[#1890ff] focus:ring-[#1890ff]"
            />
            Include latest/current DRC in table
          </label>
          <p className="mt-1 text-xs text-[#8c8c8c]">
            Default hides the most recent certificate to review historical DRC transfers first.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-[#d9d9d9] bg-white">
        <table
          className={`w-full border-collapse text-[#262626] ${
            showHolderColumns ? 'min-w-[1180px]' : 'min-w-[1040px]'
          }`}
        >
          <thead>
            <tr>
              <SortTh label="Sno." active={sortKey === 'sno'} dir={sortDir} onClick={() => toggleSort('sno')} />
              <th className={thClass}>TDR application</th>
              {showHolderColumns ? (
                <>
                  <th className={thClass}>Samagra (holder)</th>
                  <SortTh label="Holder name" active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')} />
                </>
              ) : null}
              <SortTh label="City" active={sortKey === 'city'} dir={sortDir} onClick={() => toggleSort('city')} />
              <SortTh
                label="Certificate no."
                active={sortKey === 'certificateNo'}
                dir={sortDir}
                onClick={() => toggleSort('certificateNo')}
              />
              <SortTh
                label="Issue tx no."
                active={sortKey === 'issueTransactionNo'}
                dir={sortDir}
                onClick={() => toggleSort('issueTransactionNo')}
              />
              <SortTh
                label="Issue date"
                active={sortKey === 'issueDate'}
                dir={sortDir}
                onClick={() => toggleSort('issueDate')}
              />
              <SortTh
                label="Issued (sq.mt)"
                active={sortKey === 'issuedArea'}
                dir={sortDir}
                onClick={() => toggleSort('issuedArea')}
                align="right"
              />
              <SortTh
                label="Balance (sq.mt)"
                active={sortKey === 'balanceArea'}
                dir={sortDir}
                onClick={() => toggleSort('balanceArea')}
                align="right"
              />
              <SortTh
                label="Market value / sq.mt"
                active={sortKey === 'marketValue'}
                dir={sortDir}
                onClick={() => toggleSort('marketValue')}
                align="right"
              />
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-center`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="border border-[#f0f0f0] px-3 py-10 text-center text-sm text-[#8c8c8c]">
                  No certificates match the current filters.
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const cat = getDrcBalanceCategory(r)
                const highlight =
                  initialApplicationId && r.applicationId === initialApplicationId ? 'bg-[#e6f7ff]' : ''
                const certViewHref = r.applicationId
                  ? `/dashboard/certificates/drc-view/by-application/${encodeURIComponent(r.applicationId)}`
                  : `/dashboard/certificates/drc-view/sno/${r.sno}`
                const ledgerHref = r.applicationId
                  ? `/dashboard/certificates/by-application/${encodeURIComponent(r.applicationId)}`
                  : `/dashboard/certificates/${r.sno}`
                const onCertDownload = () => {
                  const L = buildLedgerData(r)
                  void downloadDrcCertificatePdfFromRecord(r, {
                    blockchainTxHash: L.blockchainTxHash,
                    blockNumber: L.blockNumber,
                  })
                }
                return (
                  <tr key={r.sno} className={`transition-colors hover:bg-[#fafafa] ${highlight}`}>
                    <td className={tdClass} data-label="Sno.">
                      {r.sno}
                    </td>
                    <td className={`${tdClass} max-w-[140px] truncate font-mono text-xs sm:max-w-none`} title={r.applicationId ?? undefined} data-label="Application">
                      {r.applicationId ?? '—'}
                    </td>
                    {showHolderColumns ? (
                      <>
                        <td className={`${tdClass} font-mono text-xs text-[#595959]`} data-label="Samagra">
                          {r.holderSamagraId ?? '—'}
                        </td>
                        <td className={tdClass} data-label="Name">
                          {r.name}
                        </td>
                      </>
                    ) : null}
                    <td className={tdClass}>{r.city}</td>
                    <td className={`${tdClass} whitespace-nowrap font-mono text-xs`}>{r.certificateNo}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{r.issueTransactionNo}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{r.issueDate}</td>
                    <td className={tdNumClass}>{r.issuedArea}</td>
                    <td className={tdNumClass}>{r.balanceArea}</td>
                    <td className={tdNumClass}>{r.marketValue}</td>
                    <td className={tdClass}>
                      <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${balanceBadge(cat)}`}>
                        {balanceLabel[cat]}
                      </span>
                    </td>
                    <td className={`${tdClass}`}>
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        <Link
                          to={certViewHref}
                          title="View printable certificate"
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[#531dab] bg-[#f9f0ff] px-2 py-1 text-[11px] font-semibold text-[#391085] hover:bg-[#efdbff]"
                        >
                          <FiEye className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          Certificate
                        </Link>
                        <button
                          type="button"
                          title="Download certificate (PDF)"
                          onClick={onCertDownload}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[#52c41a] bg-[#f6ffed] px-2 py-1 text-[11px] font-semibold text-[#237804] hover:bg-[#d9f7be]"
                        >
                          <FiDownload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          Download
                        </button>
                        <Link
                          to={ledgerHref}
                          title="Ledger statement & blockchain history"
                          className="inline-block whitespace-nowrap rounded-md bg-[#1890ff] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#40a9ff]"
                        >
                          Ledger
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[#595959]">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="rounded-md border border-[#d9d9d9] px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((n) => (
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
}
