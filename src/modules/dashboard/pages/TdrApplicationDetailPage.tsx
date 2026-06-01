import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowRight, FiChevronRight, FiDownload, FiExternalLink, FiEye } from 'react-icons/fi'
import BlockchainAnchor from '../../../components/BlockchainAnchor'
import { useTdrApplications } from '../../../context/TdrApplicationsContext'
import { apiUrl } from '../../../api/http'
import { PageHeader, TdrWorkflowProgress } from '../components'
import type { OfficerActivityEvent, TimelineStep } from '../data/tdrApplicationsData'
import { buildStatutoryApprovalTimeline, resolveWorkflowStageId } from '../data/tdrWorkflowStages'
import {
  aggregateHolderPortfolio,
  buildLedgerData,
  getCertificateByApplicationId,
  getCertificatesForSamagraId,
} from '../data/certificateLedgerData'
import { downloadDrcCertificatePdfFromRecord } from '../helpers/drcCertificatePdf'

const cardClass = 'rounded-lg border border-[#e8e8e8] bg-white p-4 shadow-sm'
const labelClass = 'text-xs font-medium text-[#8c8c8c]'
const valueClass = 'mt-0.5 text-sm font-medium text-[#262626]'

const activityThClass =
  'border border-[#d9d9d9] bg-[#fafafa] px-3 py-2.5 text-left text-xs font-semibold text-[#595959]'
const activityTdClass = 'border border-[#d9d9d9] px-3 py-2.5 text-sm align-top text-[#262626]'
const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

const statusPill: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-600',
  Pending: 'bg-[#e6f7ff] text-[#1890ff] border border-[#91d5ff]',
  'Under Review': 'bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]',
  Approved: 'bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]',
  Rejected: 'bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]',
  'DRC Issued': 'bg-[#f9f0ff] text-[#722ed1] border border-[#d3adf7]',
}

function stepStyle(s: TimelineStep['status']) {
  if (s === 'completed') return 'border-[#389e0d] bg-[#f6ffed] text-[#237804] shadow-sm'
  if (s === 'in_progress') return 'border-[#fa8c16] bg-[#fff7e6] text-[#d46b08] shadow-sm'
  if (s === 'rejected') return 'border-[#ff4d4f] bg-[#fff1f0] text-[#cf1322] shadow-sm'
  return 'border-[#d9d9d9] bg-[#fafafa] text-[#8c8c8c]'
}

function humanStepStatus(s: TimelineStep['status']) {
  if (s === 'completed') return 'Completed'
  if (s === 'in_progress') return 'In progress'
  if (s === 'pending') return 'Pending'
  if (s === 'rejected') return 'Rejected'
  return s
}

function formatApplied(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  if (!y) return iso
  return `${d}/${m}/${y}`
}

function statusBadge(status: string) {
  const s = status.trim()
  if (s === '—' || s === '–' || s === '-') return <span className="font-mono text-[#bfbfbf]">—</span>
  if (s === 'Draft')
    return (
      <span className="rounded border border-[#ffe58f] bg-[#fffbe6] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#ad6800]">{s}</span>
    )
  if (s === 'Pending')
    return (
      <span className="rounded border border-[#91d5ff] bg-[#e6f7ff] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#0050b3]">{s}</span>
    )
  if (s === 'Under Review')
    return (
      <span className="rounded border border-[#ffd591] bg-[#fff7e6] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#d46b08]">{s}</span>
    )
  if (s === 'Approved')
    return (
      <span className="rounded border border-[#b7eb8f] bg-[#f6ffed] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#389e0d]">{s}</span>
    )
  if (s === 'Rejected')
    return (
      <span className="rounded border border-[#ffa39e] bg-[#fff1f0] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#cf1322]">{s}</span>
    )
  if (s === 'DRC Issued')
    return (
      <span className="rounded border border-[#d3adf7] bg-[#f9f0ff] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#531dab]">{s}</span>
    )
  return (
    <span className="rounded border border-[#f0f0f0] bg-[#fafafa] px-1.5 py-0.5 font-mono text-xs font-medium text-[#595959]">{s}</span>
  )
}

function StatusTransition({ fromStatus, toStatus }: { fromStatus: string; toStatus: string }) {
  const same = fromStatus === toStatus
  if (same) {
    const txt =
      fromStatus === 'Pending' && toStatus === 'Pending'
        ? 'Pending (no change)'
        : `${fromStatus === '—' || fromStatus === '–' ? '—' : fromStatus} (no change)`
    return <p className="text-xs italic leading-snug text-[#8c8c8c]">{txt}</p>
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      {statusBadge(fromStatus)}
      <FiArrowRight className="h-3.5 w-3.5 shrink-0 text-[#1890ff]" aria-hidden />
      {statusBadge(toStatus)}
    </div>
  )
}

function OfficerActivityBlock({ events }: { events: OfficerActivityEvent[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-[#d9d9d9] bg-white shadow-sm md:block">
        <table className="min-w-[1040px] w-full border-collapse">
          <thead>
            <tr>
              <th className={`${activityThClass} w-10 text-center`}>#</th>
              <th className={`${activityThClass} min-w-[150px]`}>Date &amp; time</th>
              <th className={`${activityThClass} min-w-[140px]`}>Officer / actor</th>
              <th className={`${activityThClass} min-w-[120px]`}>Role / designation</th>
              <th className={`${activityThClass} min-w-[180px]`}>Tier / workflow gate</th>
              <th className={`${activityThClass} min-w-[130px]`}>Department</th>
              <th className={`${activityThClass} min-w-[160px]`}>Action</th>
              <th className={`${activityThClass} min-w-[200px]`}>Status change</th>
              <th className={`${activityThClass} min-w-[200px]`}>Remarks</th>
              <th className={`${activityThClass} min-w-[90px]`}>Channel</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, index) => (
              <tr key={e.id} className="hover:bg-[#fafafa]">
                <td className={`${activityTdClass} text-center font-mono text-xs text-[#8c8c8c]`}>{index + 1}</td>
                <td className={`${activityTdClass} whitespace-nowrap font-mono text-xs text-[#595959]`}>{e.at}</td>
                <td className={activityTdClass}>
                  <span className="font-semibold text-[#262626]">{e.actorName}</span>
                </td>
                <td className={`${activityTdClass} text-xs font-medium text-[#595959]`}>{e.actorRole}</td>
                <td className={activityTdClass}>
                  {e.workflowTier || e.workflowDesk ? (
                    <div className="space-y-1.5">
                      {e.workflowTier ? (
                        <span className="inline-block rounded border border-[#adc6ff] bg-[#f0f5ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2f54eb]">
                          {e.workflowTier}
                        </span>
                      ) : null}
                      {e.workflowDesk ? <p className="text-[11px] leading-snug text-[#595959]">{e.workflowDesk}</p> : null}
                    </div>
                  ) : (
                    <span className="text-[#bfbfbf]">—</span>
                  )}
                </td>
                <td className={`${activityTdClass} text-xs text-[#262626]`}>{e.department}</td>
                <td className={activityTdClass}>{e.action}</td>
                <td className={activityTdClass}>
                  <StatusTransition fromStatus={e.fromStatus} toStatus={e.toStatus} />
                </td>
                <td className={`${activityTdClass} max-w-[280px] text-xs leading-relaxed text-[#595959]`}>{e.remarks ?? '—'}</td>
                <td className={`${activityTdClass} whitespace-nowrap text-xs text-[#8c8c8c]`}>{e.channel ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {events.map((e) => (
          <li key={e.id} className="rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-[#f0f0f0] pb-2">
              <div>
                <p className="text-sm font-semibold text-[#262626]">{e.actorName}</p>
                <p className="text-xs font-medium text-[#595959]">{e.actorRole}</p>
                <p className="mt-1 text-xs text-[#262626]">{e.department}</p>
                {e.workflowTier ? (
                  <p className="mt-1">
                    <span className="rounded border border-[#adc6ff] bg-[#f0f5ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2f54eb]">
                      {e.workflowTier}
                    </span>
                  </p>
                ) : null}
                {e.workflowDesk ? <p className="mt-1 text-[11px] leading-snug text-[#8c8c8c]">{e.workflowDesk}</p> : null}
              </div>
              <p className="shrink-0 font-mono text-[10px] text-[#8c8c8c]">{e.at}</p>
            </div>
            <p className="mt-2 text-sm text-[#262626]">{e.action}</p>
            <div className="mt-2">
              <StatusTransition fromStatus={e.fromStatus} toStatus={e.toStatus} />
            </div>
            {e.remarks ? <p className="mt-2 text-xs leading-relaxed text-[#595959]">{e.remarks}</p> : null}
            <p className="mt-2 text-[10px] uppercase tracking-wide text-[#bfbfbf]">Channel: {e.channel ?? '—'}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

type BackendBlockchainHistoryItem = {
  txId?: string
  timestamp?: string
  isDelete?: boolean
  value?: {
    status?: string
    lastAction?: string
    hash?: string
    updatedAt?: string
    rid?: string
    application_id?: string
    tdrApplicationId?: string
  }
}

type BackendBlockchainHistoryResponse = {
  success?: boolean
  application_id?: string
  history?: BackendBlockchainHistoryItem[]
}

function mapApiHistoryToActivityEvents(items: BackendBlockchainHistoryItem[]): OfficerActivityEvent[] {
  return items.map((h, idx) => {
    const value = h.value ?? {}
    const status = value.status?.trim() || '—'
    const tx = h.txId?.trim() || `tx-${idx + 1}`
    return {
      id: `api-${tx}-${idx}`,
      at: h.timestamp ? new Date(h.timestamp).toLocaleString('en-IN') : 'N/A',
      actorName: 'Blockchain Service',
      actorRole: 'System',
      department: 'TDR Ledger',
      workflowTier: 'Blockchain',
      workflowDesk: value.rid ? `RID ${value.rid}` : undefined,
      action: value.lastAction?.trim() || (h.isDelete ? 'Asset deleted' : 'Blockchain update'),
      fromStatus: status,
      toStatus: status,
      remarks: value.hash ? `Txn ${tx} · Anchored on-chain` : `Txn ${tx}`,
      channel: 'On-chain',
    }
  })
}

export default function TdrApplicationDetailPage() {
  const { applicationId } = useParams()
  const id = applicationId ? decodeURIComponent(applicationId) : ''
  const { applications } = useTdrApplications()
  const [apiHistoryEvents, setApiHistoryEvents] = useState<OfficerActivityEvent[] | null>(null)
  const [isApiHistoryLoading, setIsApiHistoryLoading] = useState(false)

  const app = useMemo(() => applications.find((a) => a.id === id) ?? null, [applications, id])

  useEffect(() => {
    let active = true
    const loadBlockchainHistory = async () => {
      if (!id) return
      setIsApiHistoryLoading(true)
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (API_KEY) headers['x-api-key'] = API_KEY
        let res = await fetch(apiUrl(`/api/tdr/${encodeURIComponent(id)}/history`), { headers })
        if (!res.ok) {
          res = await fetch(apiUrl(`/api/tdr/${encodeURIComponent(id)}/blockchain/history`), { headers })
        }
        if (!res.ok) return
        const data = (await res.json()) as BackendBlockchainHistoryResponse
        const rows = data.history ?? []
        if (!active) return
        setApiHistoryEvents(rows.length > 0 ? mapApiHistoryToActivityEvents(rows) : [])
      } catch {
        if (!active) return
        setApiHistoryEvents(null)
      } finally {
        if (active) setIsApiHistoryLoading(false)
      }
    }
    void loadBlockchainHistory()
    return () => {
      active = false
    }
  }, [id])

  const fallbackOfficerEvents = useMemo(() => {
    const log = app?.officerActivityLog
    if (!log?.length) return []
    return [...log]
  }, [app])
  const officerEvents = apiHistoryEvents ?? fallbackOfficerEvents

  const workflowStageId = useMemo(() => (app ? resolveWorkflowStageId(app) : 'form1_generation'), [app])

  const holderDrcPortfolio = useMemo(() => {
    if (!app?.samagraId) return null
    const certs = getCertificatesForSamagraId(app.samagraId)
    if (certs.length === 0) return null
    return aggregateHolderPortfolio(certs)
  }, [app])

  const linkedDrcCertificate = useMemo(() => (app ? getCertificateByApplicationId(app.id) : null), [app])
  const linkedDrcLedger = useMemo(
    () => (linkedDrcCertificate ? buildLedgerData(linkedDrcCertificate) : null),
    [linkedDrcCertificate],
  )

  /** Prefer ledger anchor when this application has an issued DRC so UI matches certificate PDF/registry. */
  const blockchainView = useMemo((): {
    hash: string
    status: string
    blockNumber?: number
    subtitle?: string
  } | null => {
    if (!app) return null
    if (linkedDrcLedger && linkedDrcCertificate) {
      return {
        hash: linkedDrcLedger.blockchainTxHash,
        status: linkedDrcLedger.blockchainVerified ? 'Anchored — verified (ledger)' : 'Recorded',
        blockNumber: linkedDrcLedger.blockNumber,
        subtitle: `Issue txn · ${linkedDrcCertificate.issueTransactionNo}`,
      }
    }
    if (app.blockchain) {
      return {
        hash: app.blockchain.hash,
        status: app.blockchain.status,
        subtitle: app.blockchain.txId !== app.blockchain.hash ? `Reference · ${app.blockchain.txId}` : undefined,
      }
    }
    return null
  }, [app, linkedDrcLedger, linkedDrcCertificate])

  const statutoryApprovalSteps = useMemo((): TimelineStep[] => {
    if (!app) return []
    return buildStatutoryApprovalTimeline(app)
  }, [app])

  if (!app) {
    return (
      <div className="space-y-4">
        <PageHeader title="Application not found" subtitle="The requested application id is invalid or was removed." />
        <Link to="/dashboard/apply" className="text-sm font-medium text-[#1890ff] hover:underline">
          ← Back to applications
        </Link>
      </div>
    )
  }

  const d = app.details

  return (
    <div className="space-y-4">
      <PageHeader
        title="Application details"
        subtitle={app.id}
        action={
          <Link
            to="/dashboard/apply"
            className="rounded-md border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-[#262626] hover:border-[#1890ff] hover:text-[#1890ff]"
          >
            ← Back to list
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusPill[app.status] ?? 'bg-slate-100'}`}>
          {app.status}
        </span>
        <span className="text-sm text-[#595959]">
          Applied on <strong className="text-[#262626]">{formatApplied(app.appliedOn)}</strong> · {app.currentLevel}
        </span>
      </div>

      <TdrWorkflowProgress currentStageId={workflowStageId} applicationStatus={app.status} />

      {officerEvents.length > 0 ? (
        <section className={cardClass}>
          <div className="mb-4 border-b border-[#f0f0f0] pb-3">
            <h2 className="text-base font-semibold text-[#262626]">Officer activity &amp; status history</h2>
            <p className="mt-1 text-sm text-[#8c8c8c]">
              {isApiHistoryLoading
                ? 'Loading history from API...'
                : apiHistoryEvents
                  ? 'Loaded from /api/tdr/{application_id}/blockchain/history.'
                  : 'Who updated the file, when, and how application status moved through the workflow (read-only audit view).'}
            </p>
          </div>
          <OfficerActivityBlock events={officerEvents} />
          <p className="mt-4 border-t border-[#f0f0f0] pt-3 text-xs text-[#8c8c8c]">
            Latest event: <span className="font-medium text-[#595959]">{officerEvents[officerEvents.length - 1]?.at}</span>
            {' · '}
            <span className="text-[#262626]">{officerEvents[officerEvents.length - 1]?.actorName}</span>
          </p>
        </section>
      ) : null}

      <section className={`${cardClass}`}>
        <h2 className="mb-4 border-b border-[#f0f0f0] pb-2 text-base font-semibold text-[#262626]">Applicant details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className={labelClass}>Name</p>
            <p className={valueClass}>{app.applicantName}</p>
          </div>
          <div>
            <p className={labelClass}>Samagra ID</p>
            <p className={`${valueClass} font-mono`}>{app.samagraId}</p>
          </div>
          <div>
            <p className={labelClass}>Mobile</p>
            <p className={valueClass}>{app.mobile}</p>
          </div>
          {d ? (
            <>
              <div>
                <p className={labelClass}>Email</p>
                <p className={`${valueClass} text-xs`}>{d.email}</p>
              </div>
              <div>
                <p className={labelClass}>Alternate contact</p>
                <p className={valueClass}>{d.alternatePhone}</p>
              </div>
            </>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-4">
            <p className={labelClass}>Address</p>
            <p className={valueClass}>{app.address}</p>
          </div>
          {d ? (
            <>
              <div>
                <p className={labelClass}>PIN code</p>
                <p className={`${valueClass} font-mono`}>{d.pincode}</p>
              </div>
              <div>
                <p className={labelClass}>Ward</p>
                <p className={valueClass}>{d.wardNo}</p>
              </div>
              <div>
                <p className={labelClass}>Colony / sector</p>
                <p className={valueClass}>{d.colonySector}</p>
              </div>
              <div>
                <p className={labelClass}>Nearest road</p>
                <p className={`${valueClass} text-xs`}>{d.nearestRoad}</p>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className={`${cardClass}`}>
        <h2 className="mb-4 border-b border-[#f0f0f0] pb-2 text-base font-semibold text-[#262626]">Land details</h2>
        {linkedDrcCertificate && app.status === 'DRC Issued' ? (
          <p className="mb-4 rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-3 py-2 text-xs leading-relaxed text-[#263826]">
            Values below align with issued DRC <span className="font-mono font-semibold">{linkedDrcCertificate.certificateNo}</span>{' '}
            ({linkedDrcCertificate.issuedArea.toLocaleString('en-IN')} sq.m granted · ledger S.no. {linkedDrcCertificate.sno}).
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className={labelClass}>Khasra no.</p>
            <p className={`${valueClass} font-mono`}>{app.khasraNo}</p>
          </div>
          <div>
            <p className={labelClass}>Land area</p>
            <p className={valueClass}>{app.landAreaSqM.toLocaleString('en-IN')} sq.m</p>
          </div>
          <div>
            <p className={labelClass}>Proposed area</p>
            <p className={valueClass}>{app.proposedAreaSqM.toLocaleString('en-IN')} sq.m</p>
          </div>
          <div>
            <p className={labelClass}>TDR value</p>
            <p className={valueClass}>₹ {app.tdrValueCr.toFixed(2)} Cr</p>
          </div>
          <div>
            <p className={labelClass}>Land use</p>
            <p className={valueClass}>{app.landUse}</p>
          </div>
          <div>
            <p className={labelClass}>Village / Tehsil</p>
            <p className={valueClass}>
              {app.village} · {app.tehsil}
            </p>
          </div>
          {d ? (
            <>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className={labelClass}>Property category</p>
                <p className={valueClass}>{d.propertyCategory}</p>
              </div>
              <div>
                <p className={labelClass}>Survey / khata ref.</p>
                <p className={`${valueClass} text-xs`}>{d.surveyNumber}</p>
              </div>
              <div>
                <p className={labelClass}>Patwari halka</p>
                <p className={valueClass}>{d.patwariHalka}</p>
              </div>
              <div>
                <p className={labelClass}>Road width (abutting)</p>
                <p className={valueClass}>{d.roadWidthM}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className={labelClass}>Encumbrance</p>
                <p className={`${valueClass} text-xs`}>{d.encumbrance}</p>
              </div>
              <div>
                <p className={labelClass}>Building plan ref.</p>
                <p className={`${valueClass} text-xs`}>{d.buildingPlanRef}</p>
              </div>
              <div>
                <p className={labelClass}>Water connection</p>
                <p className={`${valueClass} text-xs`}>{d.waterConn}</p>
              </div>
              <div>
                <p className={labelClass}>Electricity RR no.</p>
                <p className={`${valueClass} font-mono text-xs`}>{d.electricityRRNo}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className={labelClass}>Geo tag</p>
                <p className={`${valueClass} font-mono text-xs`}>{d.geoTag}</p>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {d ? (
        <section className={`${cardClass}`}>
          <h2 className="mb-4 border-b border-[#f0f0f0] pb-2 text-base font-semibold text-[#262626]">Registration & fees</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className={labelClass}>Application channel</p>
              <p className={valueClass}>{d.applicationChannel}</p>
            </div>
            <div>
              <p className={labelClass}>Fee status</p>
              <p className={valueClass}>{d.feeStatus}</p>
            </div>
            <div>
              <p className={labelClass}>Amount deposited</p>
              <p className={valueClass}>{d.amountDeposited}</p>
            </div>
            <div>
              <p className={labelClass}>GRAS / payment ref.</p>
              <p className={`${valueClass} font-mono text-xs`}>{d.paymentRef}</p>
            </div>
            <div>
              <p className={labelClass}>NPCI transaction id</p>
              <p className={`${valueClass} font-mono text-xs`}>{d.npciTransactionId}</p>
            </div>
            <div>
              <p className={labelClass}>Map / B1 reference</p>
              <p className={`${valueClass} text-xs`}>{d.mapB1Ref}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className={labelClass}>Court case status</p>
              <p className={valueClass}>{d.courtCaseStatus}</p>
            </div>
          </div>
        </section>
      ) : null}

      {d ? (
        <section className={`${cardClass}`}>
          <h2 className="mb-4 border-b border-[#f0f0f0] pb-2 text-base font-semibold text-[#262626]">Processing & internal</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className={labelClass}>Assigned to</p>
              <p className={`${valueClass} text-sm`}>{d.assignedTo}</p>
            </div>
            <div>
              <p className={labelClass}>Last updated</p>
              <p className={valueClass}>{d.lastUpdatedOn}</p>
            </div>
            <div>
              <p className={labelClass}>Site inspection id</p>
              <p className={`${valueClass} font-mono text-xs`}>{d.siteInspectionId}</p>
            </div>
            <div className="sm:col-span-2">
              <p className={labelClass}>Internal notes</p>
              <p className={`${valueClass} text-sm leading-relaxed text-[#595959]`}>{d.internalNotes}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${cardClass}`}>
        <h2 className="mb-4 border-b border-[#f0f0f0] pb-2 text-base font-semibold text-[#262626]">Documents</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between border-b border-[#fafafa] py-2">
            <span className="text-[#595959]">Form 3</span>
            <span className="font-medium text-[#1890ff]">{app.documents.form3}</span>
          </li>
          <li className="flex items-center justify-between border-b border-[#fafafa] py-2">
            <span className="text-[#595959]">Mutation</span>
            <span className="font-medium text-[#1890ff]">{app.documents.mutation}</span>
          </li>
          <li className="flex items-center justify-between py-2">
            <span className="text-[#595959]">Land certificate</span>
            <span className="font-medium text-[#1890ff]">{app.documents.landCertificate}</span>
          </li>
        </ul>
      </section>

      <section className={`${cardClass}`}>
        <div className="mb-4 flex flex-col gap-4 border-b border-[#f0f0f0] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#262626]">Approval timeline</h2>
            <p className="mt-1 text-sm text-[#8c8c8c]">
              Full statutory TCP gate sequence for this file (same order as the workflow tracker above). Dates appear where captured on the
              summary timeline or issuance record; scroll sideways on small screens.
            </p>
          </div>
          {app.status === 'DRC Issued' ? (
            <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
              {linkedDrcCertificate && linkedDrcLedger ? (
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    to={`/dashboard/certificates/drc-view/by-application/${encodeURIComponent(app.id)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#531dab] bg-[#f9f0ff] px-4 py-2.5 text-sm font-semibold text-[#391085] shadow-sm transition hover:bg-[#efdbff]"
                  >
                    <FiEye className="h-4 w-4 shrink-0" aria-hidden />
                    View certificate
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      void downloadDrcCertificatePdfFromRecord(linkedDrcCertificate, {
                        blockchainTxHash: linkedDrcLedger.blockchainTxHash,
                        blockNumber: linkedDrcLedger.blockNumber,
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#52c41a] bg-[#f6ffed] px-4 py-2.5 text-sm font-semibold text-[#237804] shadow-sm transition hover:bg-[#d9f7be]"
                  >
                    <FiDownload className="h-4 w-4 shrink-0" aria-hidden />
                    Download PDF
                  </button>
                </div>
              ) : null}
              <Link
                to={`/dashboard/certificates/by-application/${encodeURIComponent(app.id)}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d9d9d9] bg-white px-4 py-2.5 text-sm font-semibold text-[#262626] shadow-sm transition hover:border-[#1890ff] hover:text-[#1890ff]"
              >
                Open DRC ledger &amp; history
                <FiExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="-mx-1 overflow-x-auto pb-2 pt-1 [scrollbar-gutter:stable]">
          <div className="flex w-max min-h-[148px] gap-1.5 px-1">
            {statutoryApprovalSteps.map((step, index) => (
              <div key={`${step.label}-${index}`} className="flex items-stretch">
                <div
                  className={`flex w-[158px] shrink-0 snap-start flex-col rounded-xl border-2 p-3 shadow-sm sm:w-[168px] ${stepStyle(step.status)}`}
                >
                  <p className="line-clamp-4 text-xs font-bold leading-snug">{step.label}</p>
                  <p className="mt-2 text-[11px] font-semibold">{humanStepStatus(step.status)}</p>
                  {step.date ? (
                    <p className="mt-1.5 text-[10px] font-medium opacity-95">{step.date}</p>
                  ) : (
                    <p className="mt-1.5 text-[10px] opacity-60">—</p>
                  )}
                  {step.officer ? (
                    <p className="mt-2 border-t border-black/[0.08] pt-2 text-[10px] font-medium leading-snug opacity-95">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wide opacity-75">Gate</span>
                      <span className="mt-0.5 block line-clamp-3">{step.officer}</span>
                    </p>
                  ) : null}
                  {step.remark ? (
                    <p className="mt-auto pt-2 text-[10px] italic leading-relaxed opacity-90 line-clamp-3">{step.remark}</p>
                  ) : null}
                </div>
                {index < statutoryApprovalSteps.length - 1 ? (
                  <div className="flex w-5 shrink-0 items-center justify-center text-[#bfbfbf]" aria-hidden>
                    <FiChevronRight className="h-5 w-5 opacity-50" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {holderDrcPortfolio && holderDrcPortfolio.rows.length > 0 ? (
        <section className={cardClass}>
          <div className="mb-4 border-b border-[#f0f0f0] pb-3">
            <h2 className="text-base font-semibold text-[#262626]">DRC portfolio (same holder / Samagra)</h2>
            <p className="mt-1 text-sm text-[#8c8c8c]">
              One beneficiary can have multiple DRCs. Utilization = issued area minus current balance; remaining = live balance on each
              certificate.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 rounded-lg border border-[#d9d9d9] bg-[#fafafa] px-3 py-2.5 text-sm">
              <span>
                <span className="text-[#8c8c8c]">Samagra</span>{' '}
                <span className="font-mono font-semibold text-[#262626]">{app.samagraId}</span>
              </span>
              <span className="text-[#d9d9d9]">|</span>
              <span>
                <span className="text-[#8c8c8c]">Certificates</span>{' '}
                <span className="font-semibold text-[#1890ff]">{holderDrcPortfolio.rows.length}</span>
              </span>
              <span className="text-[#d9d9d9]">|</span>
              <span>
                Total issued <strong className="tabular-nums text-[#262626]">{holderDrcPortfolio.totals.issuedSqMt.toLocaleString('en-IN')}</strong> sq.m
              </span>
              <span>
                Utilized <strong className="tabular-nums text-[#fa8c16]">{holderDrcPortfolio.totals.utilizedSqMt.toLocaleString('en-IN')}</strong> sq.m
              </span>
              <span>
                Remaining <strong className="tabular-nums text-[#52c41a]">{holderDrcPortfolio.totals.remainingSqMt.toLocaleString('en-IN')}</strong> sq.m
              </span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#d9d9d9]">
            <table className="min-w-[960px] w-full border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className={activityThClass}>S.no</th>
                  <th className={activityThClass}>Certificate no.</th>
                  <th className={activityThClass}>Linked application</th>
                  <th className={`${activityThClass} text-right`}>Issued (sq.m)</th>
                  <th className={`${activityThClass} text-right`}>Utilized</th>
                  <th className={`${activityThClass} text-right`}>Remaining</th>
                  <th className={`${activityThClass} text-right`}>Utilization</th>
                  <th className={activityThClass}>View DRC</th>
                </tr>
              </thead>
              <tbody>
                {holderDrcPortfolio.rows.map((row) => (
                  <tr
                    key={row.record.sno}
                    className={row.record.applicationId === app.id ? 'bg-[#e6f7ff]/60' : 'hover:bg-[#fafafa]'}
                  >
                    <td className={activityTdClass}>{row.record.sno}</td>
                    <td className={`${activityTdClass} font-mono text-xs`}>{row.record.certificateNo}</td>
                    <td className={activityTdClass}>
                      {row.record.applicationId ? (
                        <Link
                          to={`/dashboard/apply/${encodeURIComponent(row.record.applicationId)}`}
                          className="font-mono text-xs font-medium text-[#1890ff] hover:underline"
                        >
                          {row.record.applicationId}
                        </Link>
                      ) : (
                        <span className="text-[#bfbfbf]">—</span>
                      )}
                      {row.record.applicationId === app.id ? (
                        <span className="ml-2 rounded bg-[#1890ff]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#1890ff]">
                          This file
                        </span>
                      ) : null}
                    </td>
                    <td className={`${activityTdClass} text-right tabular-nums`}>{row.issuedSqMt.toLocaleString('en-IN')}</td>
                    <td className={`${activityTdClass} text-right tabular-nums text-[#d46b08]`}>{row.utilizedSqMt.toLocaleString('en-IN')}</td>
                    <td className={`${activityTdClass} text-right tabular-nums text-[#389e0d]`}>{row.remainingSqMt.toLocaleString('en-IN')}</td>
                    <td className={`${activityTdClass} text-right`}>
                      <span className="inline-block min-w-[3.5rem] rounded-md bg-[#f5f5f5] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#595959]">
                        {row.pctUtilized}%
                      </span>
                    </td>
                    <td className={activityTdClass}>
                      <Link
                        to={
                          row.record.applicationId
                            ? `/dashboard/certificates/by-application/${encodeURIComponent(row.record.applicationId)}`
                            : `/dashboard/certificates/${row.record.sno}`
                        }
                        className="inline-flex rounded-md border border-[#1890ff] px-2.5 py-1 text-xs font-medium text-[#1890ff] hover:bg-[#e6f7ff]"
                      >
                        Ledger
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className={`${cardClass}`}>
        <h2 className="mb-2 border-b border-[#f0f0f0] pb-2 text-base font-semibold text-[#262626]">Blockchain linkage</h2>
        <p className="mb-4 text-sm text-[#8c8c8c]">
          जारी (CREATE) और हस्तांतरण (TRANSFER) अलग on-chain लेनदेन होते हैं — explorer से मेल खाने पर ही पूर्ण पुष्टि।
        </p>
        {linkedDrcLedger && linkedDrcCertificate ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <BlockchainAnchor
              title="DRC issuance — इस फाइल का प्रमाण"
              txHash={linkedDrcLedger.blockchainTxHash}
              blockNumber={linkedDrcLedger.blockNumber}
              hint={`${linkedDrcCertificate.certificateNo} · ${linkedDrcLedger.blockchainVerified ? 'Anchored (ledger)' : 'Recorded'}`}
            />
            {linkedDrcLedger.transferAnchor ? (
              <BlockchainAnchor
                title="Sale / transfer — Dr. लेनदेन"
                txHash={linkedDrcLedger.transferAnchor.txHash}
                blockNumber={linkedDrcLedger.transferAnchor.blockNumber}
                hint="Ledger में Sale/transfer पंक्ति से लिंक। पूरा इतिहास: खाते का ledger खोलें।"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-[#d9d9d9] bg-[#fafafa] p-4 text-sm text-[#8c8c8c]">
                Transfer का अलग anchor तभी जब इस certificate पर आंशिक उपयोग/डेबिट दर्ज हो। अभी शेष = जारी जितना है।
              </div>
            )}
          </div>
        ) : blockchainView ? (
          <BlockchainAnchor
            title="Application reference"
            txHash={blockchainView.hash}
            blockNumber={blockchainView.blockNumber}
            hint={[blockchainView.status, blockchainView.subtitle].filter(Boolean).join(' · ')}
          />
        ) : (
          <p className="text-sm text-[#8c8c8c]">
            अभी कोई on-chain anchor नहीं। जब DRC जारी और anchor होगा तब issuance hash यहाँ दिखेगा; transfer पर अलग tx।
          </p>
        )}
        {linkedDrcCertificate?.applicationId ? (
          <p className="mt-4 text-sm">
            <Link
              to={`/dashboard/certificates/by-application/${encodeURIComponent(linkedDrcCertificate.applicationId)}`}
              className="font-medium text-[#1890ff] hover:underline"
            >
              पूरा ledger + blockchain history देखें →
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  )
}
