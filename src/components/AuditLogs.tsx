import { useMemo, useState } from 'react'
import { useTdr } from '../context/useTdr'

export default function AuditLogs() {
  const { auditLogs } = useTdr()
  const [page, setPage] = useState(1)
  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(auditLogs.length / pageSize))
  const rows = useMemo(() => auditLogs.slice((page - 1) * pageSize, page * pageSize), [auditLogs, page])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 font-semibold">Audit Logs</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {['Action', 'Actor', 'Timestamp', 'Tx Hash'].map((item) => (
                <th key={item} className="px-2 py-2 font-medium">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((log, index) => (
              <tr key={`${log.txHash}-${index}`} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-2 py-2">{log.action}</td>
                <td className="px-2 py-2">{log.actor}</td>
                <td className="px-2 py-2">{log.timestamp}</td>
                <td className="px-2 py-2">{log.txHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs">
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
