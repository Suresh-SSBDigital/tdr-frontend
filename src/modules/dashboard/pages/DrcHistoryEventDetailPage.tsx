import { useMemo, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import { PageHeader } from '../components'
import {
  drcHistoryActionTypeLabels,
  getDrcHistoryFlatRowByRowId,
  type DrcHistoryFlatRow,
} from '../data/certificateLedgerData'

const cardClass =
  'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.28),0_2px_10px_-6px_rgba(15,23,42,0.16)]'

const statusStyles: Record<DrcHistoryFlatRow['status'], string> = {
  VALID: 'bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]',
  TRANSFERRED: 'bg-[#e6f7ff] text-[#1890ff] border border-[#91d5ff]',
  UTILIZED: 'bg-[#f9f0ff] text-[#722ed1] border border-[#d3adf7]',
  EDITED: 'bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]',
  DELETED: 'bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]',
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-0 sm:grid sm:grid-cols-[minmax(8rem,11rem)_1fr] sm:gap-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 sm:mb-0 sm:pt-1">{label}</p>
      <div className="min-w-0 text-sm text-slate-700">{children}</div>
    </div>
  )
}

export default function DrcHistoryEventDetailPage() {
  const { rowId: rowIdParam } = useParams()
  const rowId = rowIdParam ?? ''

  const row = useMemo(() => (rowId ? getDrcHistoryFlatRowByRowId(rowId) : null), [rowId])

  if (!row) {
    return (
      <div className="space-y-4">
        <PageHeader title="Event not found" subtitle="This blockchain history row is missing or the link is invalid." />
        <Link
          to="/dashboard/certificates"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1890ff] hover:underline"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Back to All DRC
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Blockchain event"
        subtitle={`${row.certificateNo} · ${drcHistoryActionTypeLabels[row.actionType]} event`}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          to="/dashboard/certificates"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#1890ff] hover:text-[#1890ff]"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          All DRC
        </Link>
        <Link
          to={`/dashboard/certificates/${row.certificateSno}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[#93c5fd] bg-gradient-to-b from-white to-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#1d4ed8] shadow-sm transition hover:border-[#3b82f6] hover:shadow-md"
        >
          Open certificate ledger
          <FiExternalLink className="h-4 w-4 opacity-80" aria-hidden />
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Certificate S.no.</p>
          <p className="mt-1 text-base font-semibold tabular-nums text-slate-800">{row.certificateSno}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Status</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[row.status]}`}
          >
            {row.status}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Action</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{drcHistoryActionTypeLabels[row.actionType]}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Timestamp</p>
          <p className="mt-1 text-sm tabular-nums text-slate-700">{row.timestamp}</p>
        </div>
      </section>

      <section className={cardClass}>
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Certificate profile</p>
          <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{row.certificateNo}</p>
          <p className="mt-3 text-sm text-slate-600">
            Holder: <span className="font-medium text-slate-800">{row.holderName}</span>
            {' · '}
            City: <span className="font-medium text-slate-800 uppercase">{row.city}</span>
          </p>
        </div>
        <div className="px-5 py-2 sm:px-6">
          <Field label="Event label">
            <span className="font-medium text-slate-900">{row.label}</span>
          </Field>
          <Field label="Timestamp">
            <span className="tabular-nums font-medium text-slate-800">{row.timestamp}</span>
          </Field>
          <Field label="Status">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyles[row.status]}`}
            >
              {row.status}
            </span>
          </Field>
          <Field label="Action type">
            <span className="inline-flex rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs font-bold text-[#475569]">
              {drcHistoryActionTypeLabels[row.actionType]}{' '}
              <span className="font-mono text-[10px] font-normal uppercase text-[#94a3b8]">({row.actionType})</span>
            </span>
          </Field>
          <Field label="Actor">
            <span className="font-medium text-slate-800">{row.actor}</span>
          </Field>
          <Field label="Transaction hash">
            <code className="block break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
              {row.txHash}
            </code>
          </Field>
          <Field label="Block number">
            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 tabular-nums font-semibold text-slate-800">
              {row.blockNumber}
            </span>
          </Field>
          <Field label="Tree path">
            <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-700">{row.treePath}</p>
          </Field>
          <Field label="Notes">
            <p className="rounded-lg bg-slate-50 px-3 py-2 italic text-slate-600 ring-1 ring-slate-100">
              {row.notes?.trim() ? row.notes : 'No notes available for this event.'}
            </p>
          </Field>
        </div>
      </section>
    </div>
  )
}
