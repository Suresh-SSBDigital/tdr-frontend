import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FiCopy, FiExternalLink, FiX } from 'react-icons/fi'
import { actionBadgeClass, copyText, statusBadgeClass, tdClass, thClass, truncateMiddle } from './format'

export function CopyBtn({ value, label }: { value?: string; label?: string }) {
  if (!value) return <span className="text-[#8c9ab5]">—</span>
  return (
    <button
      type="button"
      onClick={() => void copyText(value)}
      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#1890ff] hover:underline"
      title={value}
    >
      {label ?? truncateMiddle(value)}
      <FiCopy size={11} className="shrink-0 opacity-60" />
    </button>
  )
}

export function StatusPill({ status }: { status?: string }) {
  if (!status) return <span>—</span>
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(status)}`}>
      {status}
    </span>
  )
}

export function ActionPill({ action }: { action?: string }) {
  if (!action) return <span>—</span>
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase ${actionBadgeClass(action)}`}>
      {action.replace(/_/g, ' ')}
    </span>
  )
}

export function AppLink({
  applicationId,
  samagraId,
  rid,
  label,
}: {
  applicationId: string
  samagraId?: string
  rid: string
  label?: string
}) {
  const q = new URLSearchParams({ rid })
  if (samagraId) q.set('samagra_id', samagraId)
  return (
    <Link
      to={`/dashboard/apply/${encodeURIComponent(applicationId)}/total-history?${q.toString()}`}
      className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#1890ff] hover:underline"
      title={applicationId}
    >
      {label ?? truncateMiddle(applicationId, 12, 10)}
      <FiExternalLink size={10} />
    </Link>
  )
}

export function DetailPanel({
  title,
  subtitle,
  fields,
  onClose,
}: {
  title: string
  subtitle?: string
  fields: { label: string; value: ReactNode }[]
  onClose: () => void
}) {
  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" 
      onClick={onClose} 
      role="presentation"
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right-full duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81] px-6 py-6 text-white shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <FiX size={20} className="text-white" />
          </button>
          
          <div>
            <h3 className="text-lg font-bold tracking-tight pr-8">{title}</h3>
            {subtitle ? (
              <p className="mt-2 text-sm text-blue-100 truncate">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-6 space-y-2">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-[#8c9ab5]">
              <p className="text-sm">No details available</p>
            </div>
          ) : (
            <div className="space-y-0">
              {fields.map((f) => {


                const isNumeric = typeof f.value === 'string' && /^[₹\d,.\s-]+$/.test(String(f.value));
                const isId = typeof f.value === 'string' && (String(f.value).length > 20 || String(f.label).toLowerCase().includes('id'));
                const isLink = typeof f.value === 'string' && (String(f.label).toLowerCase().includes('url') || String(f.label).toLowerCase().includes('link'));
                
                return (
                  <div 
                    key={f.label}
                    className="group border-b border-[#f0f4f8] hover:bg-[#f8fafd] px-4 py-3 transition-colors last:border-0"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8c9ab5] mb-1.5">
                      {f.label}
                    </dt>
                    <dd className={`text-sm break-words leading-relaxed transition-colors ${
                      isNumeric ? 'font-semibold text-[#1d39c4]' : 
                      isId ? 'font-mono text-[11px] text-[#5c6b8a]' :
                      isLink ? 'text-[#1890ff] underline' :
                      'text-[#1c2b4a] font-medium'
                    }`}>
                      {f.value}
                    </dd>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 border-t border-[#f0f4f8] bg-gradient-to-t from-[#f5f7fa] to-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gradient-to-r from-[#1890ff] to-[#1d39c4] px-4 py-2.5 font-semibold text-white hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export function TableShell({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#eef2f7] bg-white shadow-sm">
      <div className="border-b border-[#eef2f7] px-4 py-3">
        <h2 className="text-sm font-bold text-[#1c2b4a]">
          {title}
          {count != null ? (
            <span className="ml-2 text-xs font-normal text-[#8c9ab5]">({count} records)</span>
          ) : null}
        </h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  )
}

export function ClickableRow({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition hover:bg-[#f0f7ff] ${active ? 'bg-[#e6f4ff]' : ''}`}
    >
      {children}
    </tr>
  )
}

export function fieldsFromRecord(record: Record<string, unknown>): { label: string; value: ReactNode }[] {
  return Object.entries(record)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([key, value]) => ({
      label: key.replace(/_/g, ' '),
      value:
        typeof value === 'object' ? (
          <pre className="whitespace-pre-wrap font-mono text-[11px]">{JSON.stringify(value, null, 2)}</pre>
        ) : (
          String(value)
        ),
    }))
}

export { thClass, tdClass, truncateMiddle }
