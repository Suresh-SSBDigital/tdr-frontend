import { useMemo, useState } from 'react'
import { useTdr } from '../context/useTdr'

const statusColorMap: Record<string, string> = {
  ISSUED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  TRANSFERRED: 'bg-cyan-100 text-cyan-700',
  UTILIZED: 'bg-purple-100 text-purple-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REVOKED: 'bg-rose-100 text-rose-700',
}

const pageSize = 5

export default function TDRTable() {
  const { tdrData, globalSearch } = useTdr()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const keyword = globalSearch.trim().toLowerCase()
    return tdrData.filter((item) => {
      const textMatch =
        !keyword ||
        item.drcId.toLowerCase().includes(keyword) ||
        item.owner.toLowerCase().includes(keyword) ||
        item.txHash.toLowerCase().includes(keyword)
      const statusMatch = statusFilter === 'ALL' || item.status === statusFilter
      return textMatch && statusMatch
    })
  }, [tdrData, globalSearch, statusFilter])

  const pages = Math.max(Math.ceil(filtered.length / pageSize), 1)
  const start = (page - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  const copyHash = async (txHash: string) => {
    await navigator.clipboard.writeText(txHash)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="font-semibold">TDR Registry</h3>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="ALL">All Status</option>
          <option value="ISSUED">Issued</option>
          <option value="ACTIVE">Active</option>
          <option value="TRANSFERRED">Transferred</option>
          <option value="UTILIZED">Utilized</option>
          <option value="PENDING">Pending</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {['DRC ID', 'Owner', 'Area', 'FSI', 'Status', 'Tx Hash', 'Verification', 'Actions'].map((col) => (
                <th key={col} className="px-2 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.drcId} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-2 py-2">{row.drcId}</td>
                <td className="px-2 py-2">{row.owner}</td>
                <td className="px-2 py-2">{row.area}</td>
                <td className="px-2 py-2">{row.fsi}</td>
                <td className="px-2 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColorMap[row.status] || 'bg-slate-100'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-2 py-2">{row.txHash}</td>
                <td className="px-2 py-2">{row.verified ? 'Verified' : 'Unverified'}</td>
                <td className="px-2 py-2">
                  <button onClick={() => copyHash(row.txHash)} className="rounded-md bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300 dark:bg-slate-800">
                    Copy Tx Hash
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">
          Prev
        </button>
        <span className="text-xs">
          {page}/{pages}
        </span>
        <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">
          Next
        </button>
      </div>
    </section>
  )
}
