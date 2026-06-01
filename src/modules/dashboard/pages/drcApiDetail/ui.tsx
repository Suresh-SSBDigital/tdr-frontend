import { Link } from 'react-router-dom'
import { FiArrowLeft, FiExternalLink, FiX } from 'react-icons/fi'
import type { ReactNode, RefObject } from 'react'
import { PageHeader } from '../../components'
import DrcCertificateSheet from '../../components/DrcCertificateSheet'
import type { CertificateRecord } from '../../data/certificateLedgerData'
import {
  cardShell,
  detailTableBodyRow,
  detailTableHeadRow,
  formatValue,
  ghostBtnClass,
  humanizeKey,
  isSensitiveHashField,
  primaryBtnClass,
  shellClass,
} from './helpers'

export function kvCell(label: string, value: string | number | undefined) {
  return (
    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 px-3 py-2.5 shadow-[0_2px_8px_-4px_rgba(29,57,196,0.12)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#597ef7]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#1c2b4a]">{value ?? '—'}</p>
    </div>
  )
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#d6e4ff] bg-white/80 shadow-[0_4px_20px_-12px_rgba(29,57,196,0.18)]">
      <div className="border-b border-[#e8efff] bg-gradient-to-r from-[#e6f0ff] via-[#f5f9ff] to-[#eef4ff] px-4 py-3.5">
        <p className="text-sm font-semibold text-[#1d39c4]">{title}</p>
      </div>
      <div className="bg-[#fafcff] p-4">{children}</div>
    </section>
  )
}

export function DetailFieldTable({ data }: { data?: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-[#5c6b8a]">No data available.</p>
  }
  const rows = Object.entries(data).filter(([key]) => !isSensitiveHashField(key))
  if (rows.length === 0) {
    return <p className="text-sm text-[#5c6b8a]">No displayable fields available.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[min(100%,480px)] text-left text-sm">
        <thead>
          <tr className={detailTableHeadRow}>
            <th className="py-2.5 pl-1 sm:w-[34%]">Field</th>
            <th className="py-2.5 pr-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, value]) => {
            const isObjectLike = value != null && typeof value === 'object'
            return (
              <tr key={key} className={detailTableBodyRow}>
                <td className="align-top py-2.5 pl-1 text-[13px] font-semibold text-[#597ef7]">{humanizeKey(key)}</td>
                <td className="min-w-0 py-2.5 pr-1">
                  {isObjectLike ? (
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[#e8efff] bg-[#f5f9ff] px-2 py-1.5 text-xs text-[#2f3f5c]">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <span className="break-words font-medium text-[#1c2b4a]">{formatValue(value)}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ExternalLinkField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3 shadow-[0_2px_8px_-4px_rgba(29,57,196,0.1)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">{label}</p>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 break-all text-sm font-medium text-[#1d39c4] hover:text-[#10239e] hover:underline"
        >
          {value}
          <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </a>
      ) : (
        <p className="mt-1 text-sm text-[#8c9ab5]">—</p>
      )}
    </div>
  )
}

export function LedgerFieldTable({
  rows,
}: {
  rows: Array<[string, unknown]>
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-2xl border border-[#dbeafe] bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Top Accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1677ff] to-[#69b1ff]" />

          {/* Label */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f4ff] text-[10px] font-bold text-[#1677ff]">
              {label?.charAt(0)}
            </div>

            <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
              {label}
            </p>
          </div>

          {/* Value */}
          <div className="rounded-lg border border-[#e6f0ff] bg-[#f8fbff] px-2.5 py-2">
            <p className="break-all whitespace-normal text-[11px] font-semibold leading-5 text-[#0f172a]">
              {formatValue(value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function FeedbackCard({
  icon,
  title,
  description,
  drcId,
  variant,
}: {
  icon: ReactNode
  title: string
  description: string
  drcId: string
  variant: 'not_found' | 'error'
}) {
  const accent =
    variant === 'not_found'
      ? 'from-[#e8f0ff] via-[#f5f9ff] to-[#f0f7ff] border-[#c7d9ff]'
      : 'from-[#fff7e6] via-[#fffbf0] to-[#fff1e0] border-[#ffd591]'
  const iconWrap =
    variant === 'not_found'
      ? 'bg-[#e6f0ff] text-[#1d39c4] ring-1 ring-[#adc6ff]'
      : 'bg-[#fff7e6] text-[#d46b08] ring-1 ring-[#ffd591]'

  return (
    <div className={shellClass}>
      <PageHeader title="DRC details" subtitle="Digital Receiving Certificate — registry lookup" />
      <div className={`${cardShell} ${accent}`}>
        <div className="flex flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:gap-8 sm:px-10 sm:py-12">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconWrap}`}>{icon}</div>
          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="text-lg font-semibold text-[#1c2b4a] sm:text-xl">{title}</h2>
            <p className="max-w-xl text-sm leading-relaxed text-[#5c6b8a]">{description}</p>
            {drcId ? (
              <p className="text-xs font-medium text-[#597ef7]">
                Requested id{' '}
                <code className="mt-1 block w-fit max-w-full truncate rounded-lg border border-[#d6e4ff] bg-white px-2.5 py-1.5 font-mono text-[13px] text-[#1c2b4a] sm:ml-1 sm:mt-0 sm:inline">
                  {drcId}
                </code>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/dashboard/certificates" className={primaryBtnClass}>
                <FiArrowLeft className="h-4 w-4" aria-hidden />
                Back to All DRC
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CertificatePreviewModal({
  open,
  onClose,
  onDownload,
  pdfBusy,
  ledgerRecord,
  certSheetRef,
}: {
  open: boolean
  onClose: () => void
  onDownload: () => void
  pdfBusy: boolean
  ledgerRecord: CertificateRecord | null
  certSheetRef: RefObject<HTMLDivElement | null>
}) {
  if (!open || !ledgerRecord) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="DRC certificate preview"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[880px] flex-col overflow-hidden rounded-2xl border border-[#d6e4ff] bg-[#eceff1] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e8efff] bg-gradient-to-r from-[#e6f0ff] to-[#f5f9ff] px-4 py-3">
          <p className="text-sm font-semibold text-[#1d39c4]">DRC certificate — preview (same data as PDF)</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d6e4ff] bg-white p-2 text-[#5c6b8a] transition hover:border-[#597ef7] hover:text-[#1d39c4]"
            aria-label="Close preview"
          >
            <FiX className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-5">
          <div className="mx-auto flex w-full justify-center">
            <DrcCertificateSheet ref={certSheetRef} record={ledgerRecord} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#e8efff] bg-[#fafcff] px-4 py-3">
          <button type="button" onClick={onClose} className={ghostBtnClass}>
            Close
          </button>
          <button type="button" disabled={pdfBusy} onClick={onDownload} className={primaryBtnClass}>
            {pdfBusy ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

type DocumentInfo = {
  file_url?: string
  hash?: string
  uploaded_at?: string
}

export function DocumentLinkField({ label, doc }: { label: string; doc?: string | DocumentInfo }) {
  if (!doc) {
    return (
      <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3 shadow-[0_2px_8px_-4px_rgba(29,57,196,0.1)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">{label}</p>
        <p className="mt-1 text-sm text-[#8c9ab5]">—</p>
      </div>
    )
  }

  const url = typeof doc === 'string' ? doc : doc.file_url
  const hash = typeof doc === 'object' ? doc.hash : undefined
  const uploaded_at = typeof doc === 'object' ? doc.uploaded_at : undefined

  return (
    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3 shadow-[0_2px_8px_-4px_rgba(29,57,196,0.1)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">{label}</p>
        {uploaded_at && (
          <p className="text-xs text-[#8c9ab5]">
            Uploaded on{' '}
            {new Date(uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 break-all text-sm font-medium text-[#1d39c4] hover:text-[#10239e] hover:underline">
          {url}
          <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </a>
      ) : (
        <p className="mt-2 text-sm text-[#8c9ab5]">File URL not available</p>
      )}
      {hash && (
        <p className="mt-2 break-all rounded-md bg-[#f5f9ff] px-2 py-1.5 font-mono text-[11px] text-[#5c6b8a] ring-1 ring-[#e8efff]">
          <span className="font-semibold text-[#8c9ab5]">SHA256:</span> {hash}
        </p>
      )}
    </div>
  )
}
