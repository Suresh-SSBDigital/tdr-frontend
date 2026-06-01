import { useMemo, useState } from 'react'
import { inputClassName, primaryButtonClassName } from '../helpers'
import { saleNotifications } from '../data/notificationsData'
import DashboardPageFrame from './DashboardPageFrame'

const th = 'px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'
const td = 'px-2 py-2 text-sm align-top'

export default function SaleNotificationPage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return saleNotifications
    return saleNotifications.filter((item) =>
      [item.name, item.mobileNo, item.email, item.city, item.drcNo, String(item.requestedValueForSale), item.requestDate]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [keyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <DashboardPageFrame title="Sale Notification" subtitle={`Total No. of Sale Notification: ${saleNotifications.length}`}>
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr]">
          <button className={primaryButtonClassName} type="button">Search</button>
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPage(1)
            }}
            placeholder="Enter Keyword for search"
            className={inputClassName}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full">
            <thead className="bg-slate-100 dark:bg-slate-900/60">
              <tr>
                {['Sno.', 'Name', 'Mobile No.', 'Email Address', 'City', 'DRC No.', 'Requested Value For Sale', 'Request date'].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sno} className="border-t border-slate-100 dark:border-slate-800">
                  <td className={td}>{r.sno}</td>
                  <td className={td}>{r.name}</td>
                  <td className={td}>{r.mobileNo}</td>
                  <td className={td}>{r.email}</td>
                  <td className={td}>{r.city}</td>
                  <td className={td}>{r.drcNo}</td>
                  <td className={td}>{r.requestedValueForSale}</td>
                  <td className={td}>{r.requestDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 text-xs">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Prev</button>
          <span>{page}/{totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Next</button>
        </div>
      </section>
    </DashboardPageFrame>
  )
}
