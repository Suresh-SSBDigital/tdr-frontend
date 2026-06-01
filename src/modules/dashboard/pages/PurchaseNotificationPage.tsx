import { useMemo, useState } from 'react'
import { inputClassName, primaryButtonClassName } from '../helpers'
import { purchaseNotifications } from '../data/notificationsData'
import DashboardPageFrame from './DashboardPageFrame'

const th = 'px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'
const td = 'px-2 py-2 text-sm align-top'

export default function PurchaseNotificationPage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    mobile: '',
    email: '',
    message: '',
  })
  const pageSize = 6

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return purchaseNotifications
    return purchaseNotifications.filter((item) =>
      [item.name, item.address, item.city, item.mobileNo, item.email, item.message, item.requestDate].join(' ').toLowerCase().includes(q),
    )
  }, [keyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <DashboardPageFrame title="Purchase Notification" subtitle={`Total No. of Purchase Notification: ${purchaseNotifications.length}`}>
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button className="text-sm text-indigo-600 hover:underline" type="button" onClick={() => setShowModal(true)}>
          Click here, to raise request to purchase.
        </button>
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
                {['Sno.', 'Name', 'Address', 'City', 'Mobile No.', 'Email', 'Message', 'Request date'].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sno} className="border-t border-slate-100 dark:border-slate-800">
                  <td className={td}>{r.sno}</td>
                  <td className={td}>{r.name}</td>
                  <td className={td}>{r.address}</td>
                  <td className={td}>{r.city}</td>
                  <td className={td}>{r.mobileNo}</td>
                  <td className={td}>{r.email}</td>
                  <td className={td}>{r.message}</td>
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

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="mx-2 w-full max-w-4xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
              <h3 className="text-base font-semibold text-slate-800">Raise Purchase Request</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <form
              className="space-y-4 px-6 py-5"
              onSubmit={(event) => {
                event.preventDefault()
                setShowModal(false)
                setForm({ name: '', address: '', city: '', mobile: '', email: '', message: '' })
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Name: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    className={inputClassName}
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Address: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    className={inputClassName}
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    placeholder="Address"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    City: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    className={inputClassName}
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Mobile No.: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    className={inputClassName}
                    value={form.mobile}
                    onChange={(event) => setForm({ ...form, mobile: event.target.value })}
                    placeholder="Mobile No."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Email Address: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    className={inputClassName}
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Email"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Message: <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    className={`${inputClassName} min-h-[80px] resize-none`}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Message"
                    required
                  />
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-right">
                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardPageFrame>
  )
}
