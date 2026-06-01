import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { certificateRecords, TOTAL_CERTIFICATES } from '../data/certificateLedgerData'
import { inputClassName, primaryButtonClassName } from '../helpers'

const tableHeaderClass = 'px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'
const tableCellClass = 'px-2 py-2 text-sm'

export default function CertificateLedgerExplorer() {
  const navigate = useNavigate()
  const [city, setCity] = useState('All')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return certificateRecords.filter((item) => {
      const cityMatch = city === 'All' || item.city === city
      const textMatch = !query || item.name.toLowerCase().includes(query) || String(item.sno).includes(query)
      return cityMatch && textMatch
    })
  }, [city, keyword])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Total No. of TDR certificate: {TOTAL_CERTIFICATES}</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_120px_1fr]">
        <select value={city} onChange={(event) => { setCity(event.target.value); setPage(1) }} className={inputClassName}>
          <option value="All">Search by city: All</option>
          <option value="INDORE">INDORE</option>
        </select>
        <button className={primaryButtonClassName} type="button">
          Search
        </button>
        <input
          value={keyword}
          onChange={(event) => { setKeyword(event.target.value); setPage(1) }}
          placeholder="Enter Keyword for search"
          className={inputClassName}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full">
          <thead className="bg-slate-100 dark:bg-slate-900/60">
            <tr>
              {['Sno', 'Name', 'TDR in City', 'Extent of TDR Issued(sq.mt.)', 'Balance TDR(sq.mt.)', 'TDR Market value(per sq.mt.)', 'Action'].map((item) => (
                <th key={item} className={tableHeaderClass}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr key={`${item.sno}-${item.certificateNo}`} className="border-t border-slate-100 dark:border-slate-800">
                <td className={tableCellClass}>{item.sno}</td>
                <td className={tableCellClass}>{item.name}</td>
                <td className={tableCellClass}>{item.city}</td>
                <td className={tableCellClass}>{item.issuedArea}</td>
                <td className={tableCellClass}>{item.balanceArea}</td>
                <td className={tableCellClass}>{item.marketValue}</td>
                <td className={tableCellClass}>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/certificates/${item.sno}`)}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 text-xs">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-2 py-1 disabled:opacity-40">
          Prev
        </button>
        <span>{page}/{totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 disabled:opacity-40">
          Next
        </button>
      </div>
    </section>
  )
}
