import { Handle, Position } from '@xyflow/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiCopy, FiExternalLink, FiShield } from 'react-icons/fi'
import { toast } from 'react-toastify'
import type { AppBlockchainVerification } from '../helpers/ridHistoryTree'

function n(v?: number) {
  if (v == null) return '—'
  return v.toLocaleString('en-IN')
}

function d(v?: string | Date) {
  if (!v) return '—'
  const dt = new Date(v)
  if (Number.isNaN(dt.getTime())) return String(v)
  return (
    dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
}

function relativeTime(value?: string | Date) {
  if (!value) return 'Unknown'
  const time = new Date(value)
  if (Number.isNaN(time.getTime())) return String(value)
  const diffSeconds = Math.round((Date.now() - time.getTime()) / 1000)
  const suffix = diffSeconds >= 0 ? 'ago' : 'from now'
  const absoluteSeconds = Math.abs(diffSeconds)
  if (absoluteSeconds < 60) return `${absoluteSeconds}s ${suffix}`
  const diffMinutes = Math.round(absoluteSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ${suffix}`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ${suffix}`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ${suffix}`
}

function truncateId(id?: string, head = 10, tail = 14) {
  if (!id) return '—'
  if (id.length <= head + tail + 3) return id
  return `${id.slice(0, head)}...${id.slice(-tail)}`
}

function truncateHash(hash?: string) {
  if (!hash) return '—'
  if (hash.length <= 18) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  } catch {
    toast.error('Could not copy')
  }
}

function CountBadge({ label, value }: { label: string; value: number }) {
  return (
    <span
      className="inline-flex min-w-[32px] items-center justify-center rounded-md bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
      title={label === 'T' ? 'Transaction count' : 'Utilization count'}
    >
      {label}:{value}
    </span>
  )
}

function ChainBadge({ verified }: { verified?: boolean }) {
  if (verified == null) return null
  return verified ? (
    <span className="inline-flex items-center gap-0.5 rounded border border-[#b7eb8f] bg-[#f6ffed] px-1.5 py-0.5 text-[9px] font-bold text-[#237804]">
      <FiShield size={10} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 rounded border border-[#ffa39e] bg-[#fff1f0] px-1.5 py-0.5 text-[9px] font-bold text-[#cf1322]">
      Tampered
    </span>
  )
}

function TamperedCompareBlock({ verification }: { verification: AppBlockchainVerification }) {
  if (!verification.tampered) return null
  const {
    currentTdr,
    blockchainTdr,
    currentArea,
    blockchainArea,
    ledgerMatched,
    ledgerTotal,
    chainTxCount,
  } = verification

  return (
    <div className="space-y-2 rounded-lg border border-[#ffa39e] bg-[#fff1f0] p-2.5 text-[10px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold uppercase tracking-wide text-[#5c6b8a]">Blockchain</span>
        <ChainBadge verified={false} />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        <span className="text-[#8c9ab5]">Previous TDR</span>
        <span className="font-semibold text-[#237804]">₹ {n(blockchainTdr ?? undefined)}</span>
        <span className="text-[#8c9ab5]">Current TDR</span>
        <span className="font-semibold text-[#cf1322]">₹ {n(currentTdr ?? undefined)}</span>
        <span className="text-[#8c9ab5]">Previous Area</span>
        <span className="font-semibold text-[#237804]">{n(blockchainArea ?? undefined)}</span>
        <span className="text-[#8c9ab5]">Current Area</span>
        <span className="font-semibold text-[#cf1322]">{n(currentArea ?? undefined)}</span>
        <span className="text-[#8c9ab5]">Ledger</span>
        <span className="font-semibold text-[#1c2b4a]">
          {ledgerMatched}/{ledgerTotal} · Chain {chainTxCount}
        </span>
      </div>
    </div>
  )
}

function StatRow({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 text-[#5c6b8a]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-bold text-[#1c2b4a]">{value}</span>
    </div>
  )
}

function appTotalHistoryPath(
  applicationId: string,
  rid: string,
  samagraId?: string,
  tab: 'tree' | 'overview' = 'overview',
) {
  const q = new URLSearchParams({ rid, tab })
  if (samagraId) q.set('samagra_id', samagraId)
  return `/dashboard/apply/${encodeURIComponent(applicationId)}/total-history?${q.toString()}`
}

export const ApplicationNode = ({
  data,
  onViewDetails,
}: {
  data: {
    app: Record<string, unknown>
    isChild?: boolean
    treeLabel?: string
    linkedParentLabel?: string
    transferCount?: number
    utilizationCount?: number
    verification?: AppBlockchainVerification
    rid?: string
    samagraId?: string
  }
  onViewDetails?: (payload: {
    kind: 'application'
    app: Record<string, unknown>
    isChild?: boolean
    treeLabel?: string
    linkedParentLabel?: string
    transferCount?: number
    utilizationCount?: number
    verification?: AppBlockchainVerification
    rid?: string
    samagraId?: string
  }) => void
}) => {
  const app = data.app
  const isChild = Boolean(data.isChild)
  const appId = String(app.application_id ?? '')
  const rid = data.rid ?? ''
  const samagraId = data.samagraId ?? (app.samagra_id ? String(app.samagra_id) : undefined)
  const fullPageTo = appId && rid ? appTotalHistoryPath(appId, rid, samagraId, 'overview') : null
  const treeLabel = data.treeLabel ?? (isChild ? 'Child' : 'P1')
  const txCount = data.transferCount ?? 0
  const utilCount = data.utilizationCount ?? 0

  return (
    <div
      className={`w-[300px] rounded-lg border bg-white shadow-[0_2px_8px_rgba(28,43,74,0.08)] overflow-hidden ${isChild ? 'border-[#d3adf7]' : 'border-[#91caff]'
        }`}
    >
      <Handle
        type="target"
        id="app-in"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#1890ff]"
      />
      <div
        className={`px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider ${isChild ? 'bg-[#9254de]' : 'bg-[#1890ff]'
          }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span>
            {isChild ? 'Child' : 'Parent / Root'} · {treeLabel}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <CountBadge label="T" value={txCount} />
            <CountBadge label="U" value={utilCount} />
          </div>
        </div>
      </div>
      <div className="space-y-2.5 overflow-hidden p-3.5">
        {isChild && data.linkedParentLabel ? (
          <p className="rounded-md bg-[#f9f0ff] px-2 py-1 text-[10px] font-semibold text-[#722ed1]">
            Linked from parent {data.linkedParentLabel}
          </p>
        ) : null}

        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase text-[#8c9ab5]">Application ID</p>
          <div className="flex items-start justify-between gap-2">
            <p className="break-all font-mono text-[12px] font-bold leading-snug text-[#1c2b4a]" title={appId}>
              {truncateId(appId)}
            </p>
            <button
              type="button"
              onClick={() => void copyText(appId)}
              className="nodrag nopan shrink-0 p-0.5 text-[#8c9ab5] hover:text-[#1890ff]"
            >
              <FiCopy size={13} />
            </button>
          </div>
        </div>

        {data.verification?.tampered ? (
          <TamperedCompareBlock verification={data.verification} />
        ) : data.verification ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-[#b7eb8f] bg-[#f6ffed] px-2.5 py-2 text-[10px]">
            <span className="font-bold uppercase tracking-wide text-[#5c6b8a]">Blockchain</span>
            <ChainBadge verified={data.verification.verified} />
          </div>
        ) : null}

        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase text-[#8c9ab5]">Owner</p>
          <p className="truncate text-[13px] font-semibold text-[#1c2b4a]">{String(app.owner_name ?? '—')}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase ${app.status === 'CREATED'
                ? 'border border-[#b7eb8f] bg-[#f6ffed] text-[#389e0d]'
                : 'border border-[#d3adf7] bg-[#f9f0ff] text-[#722ed1]'
              }`}
          >
            {String(app.status ?? 'UNKNOWN')}
          </span>
        </div>

        <div className="space-y-1.5 border-t border-[#f0f2f5] pt-2 text-[11px]">
          <StatRow label="Total TDR" value={`₹ ${n(Number(app.total_tdr_value))}`} dot="#1890ff" />
          <StatRow label="Remaining TDR" value={`₹ ${n(Number(app.remaining_tdr_value))}`} dot="#52c41a" />
          <StatRow label="Total Area" value={n(Number(app.total_area))} dot="#8c9ab5" />
        </div>
      </div>
      <div
        className={`border-t px-3 py-2.5 ${isChild ? 'border-[#efdbff] bg-[#faf5ff]' : 'border-[#d6e8ff] bg-[#f0f7ff]'}`}
      >
        <button
          type="button"
          onClick={() =>
            onViewDetails?.({
              kind: 'application',
              app,
              isChild,
              treeLabel: data.treeLabel,
              linkedParentLabel: data.linkedParentLabel,
              transferCount: data.transferCount,
              utilizationCount: data.utilizationCount,
              verification: data.verification,
              rid: data.rid,
              samagraId: data.samagraId,
            })
          }
          className="nodrag nopan flex w-full items-center justify-center gap-2 rounded-md border border-[#1890ff] bg-[#1890ff] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#096dd9]"
        >
          View Details
        </button>
      </div>
      {fullPageTo ? (

        <div
          className={`border-t px-3 py-2.5 ${isChild ? 'border-[#efdbff] bg-[#faf5ff]' : 'border-[#d6e8ff] bg-[#f0f7ff]'}`}
        >
          <Link
            to={fullPageTo}
            className="nodrag nopan flex w-full items-center justify-center gap-2 rounded-md border border-[#1890ff] bg-[#1890ff] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#096dd9]"
          >
            View Full Page
            <FiExternalLink size={12} />
          </Link>
        </div>
      ) : null}

      <Handle
        type="source"
        id="transfer-out"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#fa8c16]"
      />
      <Handle
        type="source"
        id="util-out"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#52c41a]"
      />
    </div>
  )
}

export const TransferNode = ({
  data,
}: {
  data: {
    transfer: Record<string, unknown>
    treeLabel?: string
    childLabel?: string
    chainVerified?: boolean
    transferIndex?: number
    txStepNumber?: number
  }
}) => {
  const [showTimeline, setShowTimeline] = useState(false)
  const t = data.transfer
  const txId = String(t.txId ?? t.trn_txId ?? '')
  const transferTime = String(t.trn_date ?? '')
  const transferLabel = transferTime ? `${d(transferTime)} · ${relativeTime(transferTime)}` : '—'

  return (
    <div className="w-[230px] overflow-hidden rounded-xl border border-[#ffd591] bg-white shadow-[0_2px_8px_rgba(28,43,74,0.08)]">
      <Handle
        type="target"
        id="transfer-in"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#fa8c16]"
      />
      <div className="border-b border-[#ffe7ba] bg-[#fff7e6] px-3 py-1.5">
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#d46b08]">
              {data.txStepNumber ? `Step ${data.txStepNumber} · ` : ''}Transfer #{data.transferIndex ?? 1}
            </p>
            <p className="text-[9px] text-[#ad6800]">{transferLabel}</p>
          </div>
          <ChainBadge verified={data.chainVerified} />
        </div>
        {data.treeLabel ? (
          <p className="mt-0.5 text-[9px] font-semibold text-[#ad6800]">From {data.treeLabel}</p>
        ) : null}
        {data.childLabel ? (
          <p className="mt-0.5 text-[9px] font-semibold text-[#ad6800]">→ Child {data.childLabel}</p>
        ) : null}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-bold text-[#1c2b4a]">
          {n(Number(t.transferred_tdr_value ?? t.trn_value_tdr))} TDR
        </p>
        <p className="mb-2 text-[11px] text-[#5c6b8a]">{n(Number(t.transferred_area))} Area</p>
        <div className="mb-2 flex items-center gap-1 text-[10px] text-[#8c9ab5]">
          <FiCalendar className="shrink-0" size={11} />
          <span>{d(String(t.trn_date ?? ''))}</span>
        </div>
        <p className="mb-0.5 text-[9px] font-bold uppercase text-[#8c9ab5]">TxID</p>
        <button
          type="button"
          onClick={() => txId && void copyText(txId)}
          className="break-all text-left font-mono text-[10px] text-[#1890ff] hover:underline"
          title={txId}
        >
          {truncateHash(txId)}
        </button>

        <div className="mt-3 space-y-3 border-t border-[#fff1b8] pt-3">
          <button
            type="button"
            onClick={() => setShowTimeline((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-md border border-[#ffd591] bg-[#fff7e6] px-3 py-2 text-[11px] font-semibold text-[#ad6800] transition hover:bg-[#fff1b8]"
          >
            <span>{showTimeline ? 'Hide' : 'Show'} transfer timeline</span>
            <span className="text-[10px] text-[#d48806]">{showTimeline ? '▲' : '▼'}</span>
          </button>

          {showTimeline ? (
            <div className="rounded-lg border border-[#ffe7ba] bg-[#fffdfa] p-3 text-[10px] text-[#5c6b8a]">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-[#ad6800]">Status</span>
                <span className="text-[#1c2b4a]">{String(t.transfer_status ?? t.status ?? 'Pending')}</span>
              </div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span>From</span>
                <span className="truncate text-right text-[#1c2b4a]">{String(t.from ?? t.origin ?? 'N/A')}</span>
              </div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span>To</span>
                <span className="truncate text-right text-[#1c2b4a]">{String(t.to ?? t.destination ?? 'N/A')}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Tx</span>
                <span className="break-all font-mono text-[10px] text-[#1890ff]">{truncateHash(txId)}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Handle
        type="source"
        id="transfer-out"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#fa8c16]"
      />
    </div>
  )
}

export const UtilizationNode = ({
  data,
  onViewDetails,
}: {
  data: {
    utilization: Record<string, unknown>
    treeLabel?: string
    utilIndex?: number
    chainVerified?: boolean
    txStepNumber?: number
  }
  onViewDetails?: (payload: {
    kind: 'utilization'
    utilization: Record<string, unknown>
    treeLabel?: string
    utilIndex?: number
    chainVerified?: boolean
  }) => void
}) => {
  const u = data.utilization
  const txId = String(u.txId ?? '')

  return (
    <div className="w-[188px] overflow-hidden rounded-lg border border-[#b7eb8f] bg-white shadow-[0_2px_8px_rgba(28,43,74,0.06)]">
      <Handle
        type="target"
        id="util-in"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#52c41a]"
      />
      <div className="bg-[#52c41a] px-3 py-1.5">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white">
            {data.txStepNumber ? `Step ${data.txStepNumber} · ` : ''}Utilization {data.utilIndex ? `#${data.utilIndex}` : ''}
          </p>
          <ChainBadge verified={data.chainVerified} />
        </div>
        {data.treeLabel ? <p className="mt-0.5 text-[9px] text-white/90">From {data.treeLabel}</p> : null}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-bold text-[#1c2b4a]">
          {n(Number(u.utilized_value_tdr ?? u.utilized_tdr_value))} TDR
        </p>
        <p className="mb-2 text-[11px] text-[#5c6b8a]">{n(Number(u.utilized_area))} Area</p>
        <div className="mb-2 flex items-center gap-1 text-[10px] text-[#8c9ab5]">
          <FiCalendar className="shrink-0" size={11} />
          <span>{d(String(u.utilization_date ?? ''))}</span>
        </div>
        <p className="mb-0.5 text-[9px] font-bold uppercase text-[#8c9ab5]">Purpose</p>
        <p className="mb-2 line-clamp-2 text-[11px] font-semibold text-[#1c2b4a]">
          {String(u.utilization_purpose || 'N/A')}
        </p>
        <p className="mb-0.5 text-[9px] font-bold uppercase text-[#8c9ab5]">TxID</p>
        <button
          type="button"
          onClick={() => txId && void copyText(txId)}
          className="break-all text-left font-mono text-[10px] text-[#1890ff] hover:underline"
          title={txId}
        >
          {truncateHash(txId)}
        </button>

        <div className="mt-3 border-t border-[#d9f7be] pt-2">
          <button
            type="button"
            onClick={() =>
              onViewDetails?.({
                kind: 'utilization',
                utilization: u,
                treeLabel: data.treeLabel,
                utilIndex: data.utilIndex,
                chainVerified: data.chainVerified,
              })
            }
            className="nodrag nopan flex w-full items-center justify-center gap-2 rounded-md border border-[#52c41a] bg-[#52c41a] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#389e0d]"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export const nodeTypes = {
  applicationNode: ApplicationNode,
  transferNode: TransferNode,
  utilizationNode: UtilizationNode,
}
