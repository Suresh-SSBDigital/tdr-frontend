import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiCalendar, FiGitBranch, FiShuffle, FiZap } from 'react-icons/fi'
import { PageHeader } from '../components'
import { useCertificatesSetDataLoading } from '../layout/certificatesDataLoadingContext'
import { apiUrl } from '../../../api/http'
import {
  buildTimelineRows,
  fetchTdrFullSnapshot,
  formatOwnerIdWithName,
  type TdrFullSnapshot,
  type TimelineRow,
} from '../../../api/tdrFullTimeline'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

type DrcDetailResponse = {
  drc_id?: string
  drc?: {
    application_id?: string
    rid?: string
    tdrApplicationId?: string
    owner?: { samagra_id?: string }
    total_tdr_value?: number
    remaining_tdr_value?: number
    utilized_tdr_value?: number
    transferred_tdr_value?: number
    transfer_tdr_value?: number
    project?: { drc_certificate_no?: string }
  }
}

function d(v?: string) {
  if (!v) return '—'
  const dt = new Date(v)
  if (Number.isNaN(dt.getTime())) return v
  return dt.toLocaleString('en-IN')
}

function n(v?: number) {
  if (v == null) return '—'
  return v.toLocaleString('en-IN')
}

function statusBadge(status?: string) {
  const normalized = (status ?? '').toUpperCase()
  if (normalized === 'APPROVED') return 'bg-[#e9f9ee] text-[#237804] border border-[#b7eb8f]'
  if (normalized === 'REJECTED') return 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]'
  if (normalized === 'PENDING') return 'bg-[#e6f4ff] text-[#0958d9] border border-[#91caff]'
  return 'bg-[#f5f5f5] text-[#595959] border border-[#d9d9d9]'
}

function TreeNode({ row, index, isLast }: { row: TimelineRow; index: number; isLast: boolean }) {
  const isTransfer = row.stepType === 'TRANSFER'
  return (
    <li className="relative flex gap-0">
      <div className="flex w-9 shrink-0 flex-col items-center pt-0.5">
        <div
          className={`relative z-[1] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm ${
            isTransfer ? 'bg-[#1890ff] text-white' : 'bg-[#722ed1] text-white'
          }`}
        >
          {isTransfer ? <FiShuffle className="h-4 w-4" aria-hidden /> : <FiZap className="h-4 w-4" aria-hidden />}
        </div>
        {!isLast ? (
          <div className="mt-px w-px flex-1 min-h-[10px] bg-[#d6e4ff]" aria-hidden />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-3 pl-2">
        <div
          className={`overflow-hidden rounded-lg border bg-white shadow-sm ${
            isTransfer ? 'border-[#91d5ff]' : 'border-[#d3adf7]'
          }`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 ${
              isTransfer ? 'border-[#e6f4ff] bg-[#f5fbff]' : 'border-[#efdbff] bg-[#faf5ff]'
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded bg-white px-2 text-sm font-bold tabular-nums text-[#1d39c4] ring-1 ring-[#d6e4ff]">
                {index + 1}
              </span>
              <p className="truncate text-sm font-bold text-[#1c2b4a]">{isTransfer ? 'Transfer' : 'Utilization'}</p>
            </div>
            <span
              className={`shrink-0 rounded px-2.5 py-1 text-xs font-bold ${
                isTransfer ? 'bg-[#e6f4ff] text-[#0050b3]' : 'bg-[#f4ebff] text-[#531dab]'
              }`}
            >
              {row.stepType}
            </span>
          </div>

          <div className="space-y-3 p-3.5">
            <p className="block max-w-full break-all rounded border border-[#eef2f7] bg-[#f8fafc] px-2.5 py-1.5 font-mono text-xs leading-relaxed text-[#5c6b8a]">
              {row.refId}
            </p>

            {isTransfer ? (
              <>
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="rounded-md border border-[#e8efff] bg-[#fafcff] px-2.5 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8c9ab5]">From</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-[#1c2b4a]">
                      {formatOwnerIdWithName(row.from, row.fromName)}
                    </p>
                  </div>
                  <div className="flex justify-center py-0.5">
                    <FiArrowRight className="h-4 w-4 text-[#1890ff]" aria-hidden />
                  </div>
                  <div className="rounded-md border border-[#91d5ff] bg-[#f0f9ff] px-2.5 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#1890ff]">To</p>
                    <p className="mt-1 text-sm font-bold leading-snug text-[#10239e]">
                      {formatOwnerIdWithName(row.to, row.toName)}
                    </p>
                  </div>
                </div>

                <div className="hidden gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                  <div className="rounded-md border border-[#e8efff] bg-[#fafcff] px-2.5 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#8c9ab5]">From</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-[#1c2b4a]">
                      {formatOwnerIdWithName(row.from, row.fromName)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center self-center px-0.5">
                    <FiArrowRight className="h-5 w-5 shrink-0 text-[#1890ff]" aria-hidden />
                  </div>
                  <div className="rounded-md border border-[#69c0ff] bg-[#e6f7ff] px-2.5 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#0050b3]">To</p>
                    <p className="mt-1 text-sm font-bold leading-snug text-[#10239e]">
                      {formatOwnerIdWithName(row.to, row.toName)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-[#e9d5ff] bg-[#faf5ff] px-2.5 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#722ed1]">Utilized by</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-[#1c2b4a]">
                  {formatOwnerIdWithName(row.from, row.fromName)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md border border-[#d6e4ff] bg-[#f5f9ff] px-1.5 py-2 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#597ef7]">Before</p>
                <p className="mt-1 font-mono text-sm font-bold tabular-nums text-[#1c2b4a]">{n(row.before)}</p>
                {row.beforeArea != null ? (
                  <p className="mt-1 text-[11px] text-slate-500">Area {n(row.beforeArea)} Sq.m.</p>
                ) : null}
              </div>
              <div className="rounded-md border border-[#ffd591] bg-[#fffbe6] px-1.5 py-2 text-center ring-1 ring-[#ffe58f]/60">
                <p className="text-[11px] font-bold uppercase leading-tight text-[#ad6800]">
                  {isTransfer ? 'Transfer' : 'Util.'}
                </p>
                <p className="mt-1 font-mono text-sm font-bold tabular-nums text-[#ad4e00]">{n(row.amount)}</p>
                {row.amountArea != null ? (
                  <p className="mt-1 text-[11px] text-slate-500">Area {n(row.amountArea)} Sq.m.</p>
                ) : null}
              </div>
              <div className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-1.5 py-2 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#237804]">After</p>
                <p className="mt-1 font-mono text-sm font-bold tabular-nums text-[#1c2b4a]">{n(row.after)}</p>
                {row.afterArea != null ? (
                  <p className="mt-1 text-[11px] text-slate-500">Area {n(row.afterArea)} Sq.m.</p>
                ) : null}
              </div>
            </div>

            {row.notes ? (
              <p className="rounded border border-dashed border-[#e8efff] bg-[#fafcff] px-2.5 py-2 text-sm leading-relaxed text-[#5c6b8a]">
                {row.notes}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f3f8] pt-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-[#5c6b8a]">
                <FiCalendar className="h-3.5 w-3.5 shrink-0 text-[#8c9ab5]" aria-hidden />
                {d(row.at)}
              </span>
              <span className={`rounded px-2.5 py-1 text-xs font-bold ${statusBadge(row.status)}`}>
                {row.status ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function DrcHistoryTreePage() {
  const { drcId = '' } = useParams()
  const [drcDetail, setDrcDetail] = useState<DrcDetailResponse | null>(null)
  const [fullSnap, setFullSnap] = useState<TdrFullSnapshot | null>(null)
  const [resolvedRid, setResolvedRid] = useState('')
  const [phase, setPhase] = useState<'drc' | 'full' | 'done'>('drc')
  const [error, setError] = useState<string | null>(null)
  const setCertificatesDataLoading = useCertificatesSetDataLoading()

  useLayoutEffect(() => {
    if (!drcId) {
      setCertificatesDataLoading(false)
      return
    }
    setCertificatesDataLoading(true)
    return () => setCertificatesDataLoading(false)
  }, [drcId, setCertificatesDataLoading])

  useEffect(() => {
    let active = true
    const run = async () => {
      setError(null)
      setDrcDetail(null)
      setFullSnap(null)
      setResolvedRid('')
      setPhase('drc')
      if (!drcId) {
        setPhase('done')
        return
      }
      try {
        const headers: Record<string, string> = {}
        if (API_KEY) headers['x-api-key'] = API_KEY
        const dRes = await fetch(apiUrl(`/api/tdr/drc/${encodeURIComponent(drcId)}`), { headers })
        if (!active) return
        if (!dRes.ok) {
          setError(`Could not load DRC (HTTP ${dRes.status}).`)
          setPhase('done')
          return
        }
        const dJson = (await dRes.json()) as DrcDetailResponse
        setDrcDetail(dJson)
        const appId = dJson.drc?.application_id?.trim()
        const rid = dJson.drc?.rid?.trim() ?? ''
        const samagraId = dJson.drc?.owner?.samagra_id?.trim() ?? ''
        if (!appId) {
          setError('This DRC has no application id — history cannot be loaded.')
          setPhase('done')
          return
        }
        setPhase('full')
        const snap = await fetchTdrFullSnapshot(appId, rid, samagraId, API_KEY)
        if (!active) return
        if (snap.ok === false) {
          setError(snap.error)
          setPhase('done')
          return
        }
        setFullSnap(snap.data)
        setResolvedRid(snap.resolvedRid)
      } catch {
        if (active) setError('Network error while loading history.')
      } finally {
        if (active) {
          setPhase('done')
          setCertificatesDataLoading(false)
        }
      }
    }
    void run()
    return () => {
      active = false
    }
  }, [drcId, setCertificatesDataLoading])

  const rows = useMemo(() => buildTimelineRows(fullSnap), [fullSnap])
  const transfers = fullSnap?.tdr?.transfers ?? []
  const utils = fullSnap?.tdr?.utilizations ?? []
  const drc = drcDetail?.drc
  const backHref = `/dashboard/certificates/drc/${encodeURIComponent(drcId)}`
  const txQuery = (() => {
    const q = new URLSearchParams()
    const r = resolvedRid || drc?.rid?.trim() || ''
    if (r) q.set('rid', r)
    const s = drc?.owner?.samagra_id?.trim() ?? ''
    if (s) q.set('samagra_id', s)
    const qs = q.toString()
    return qs ? `?${qs}` : ''
  })()

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="DRC history"
        subtitle="Transfer & utilization timeline (/full), same data as apply → transactions."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={backHref}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#d6e4ff] bg-white px-3 py-1.5 text-sm font-medium text-[#355070] shadow-sm transition hover:border-[#597ef7] hover:text-[#1d39c4]"
            >
              <FiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              DRC
            </Link>
            {drc?.application_id ? (
              <Link
                to={`/dashboard/apply/${encodeURIComponent(drc.application_id)}/transactions${txQuery}`}
                className="inline-flex items-center rounded-md border border-[#adc6ff] bg-[#f0f5ff] px-3 py-1.5 text-sm font-semibold text-[#1d39c4] transition hover:bg-white"
              >
                Table view
              </Link>
            ) : null}
          </div>
        }
      />

      {error ? (
        <p className="rounded-md border border-[#ffa39e] bg-[#fff1f0] px-3 py-2.5 text-sm text-[#a8071a]">{error}</p>
      ) : null}

      {drc && !error ? (
        <section className="overflow-hidden rounded-lg border border-[#d6e4ff] bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-[#e8efff] bg-[#f5f9ff] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FiGitBranch className="h-5 w-5 shrink-0 text-[#1d39c4]" aria-hidden />
              <p className="text-sm font-semibold text-[#1d39c4]">Summary</p>
            </div>
            <p className="max-w-full text-sm leading-snug text-[#5c6b8a]">
              <span className="font-mono text-[#1c2b4a]">{drc.application_id}</span>
              {resolvedRid || drc.rid ? (
                <>
                  {' '}
                  <span className="text-[#c0c8d4]">·</span> RID{' '}
                  <span className="font-mono text-[#1c2b4a]">{resolvedRid || drc.rid}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            <div className="rounded-md border border-[#d6e4ff] bg-[#fafcff] px-2 py-2 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#597ef7]">Transfers</p>
              <p className="text-xl font-bold tabular-nums leading-tight text-[#1d39c4]">{transfers.length}</p>
            </div>
            <div className="rounded-md border border-[#d6e4ff] bg-[#fafcff] px-2 py-2 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#597ef7]">Util.</p>
              <p className="text-xl font-bold tabular-nums leading-tight text-[#722ed1]">{utils.length}</p>
            </div>
            <div className="rounded-md border border-[#d6e4ff] bg-[#fafcff] px-2 py-2 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#237804]">Balance</p>
              <p className="text-base font-bold tabular-nums leading-tight text-[#237804]">{n(drc.remaining_tdr_value)}</p>
              <p className="text-[11px] leading-tight text-[#8c9ab5]">of {n(drc.total_tdr_value)}</p>
            </div>
          </div>
        </section>
      ) : null}

      {phase === 'done' && drc && !error ? (
        <section className="rounded-lg border border-[#d6e4ff] bg-[#f8fbff] p-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#1d39c4]">Events</h2>
            <p className="text-xs text-[#8c9ab5]">Newest at bottom</p>
          </div>
          <ul className="relative mt-3 list-none pl-0">
            <li className="relative mb-3 flex gap-0">
              <div className="flex w-9 shrink-0 flex-col items-center pt-0.5">
                <div className="h-3 w-3 shrink-0 rounded-full border border-white bg-[#52c41a] shadow-sm ring-1 ring-[#b7eb8f]" />
                {rows.length > 0 ? <div className="mt-px w-px flex-1 min-h-[8px] bg-[#d6e4ff]" aria-hidden /> : null}
              </div>
              <div className="min-w-0 flex-1 rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-2.5 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#237804]">Root · DRC issued</p>
                <p className="mt-1 truncate text-sm font-medium text-[#1c2b4a]">
                  {drc.project?.drc_certificate_no ?? drcDetail?.drc_id ?? drcId}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5c6b8a]">
                  Granted {n(drc.total_tdr_value)} · Transferred {n(drc.transferred_tdr_value ?? drc.transfer_tdr_value)} · Utilized {n(drc.utilized_tdr_value)} · Remaining {n(drc.remaining_tdr_value)}
                </p>
              </div>
            </li>
            {rows.map((row, i) => (
              <TreeNode key={`${row.stepType}-${row.refId}-${i}`} row={row} index={i} isLast={i === rows.length - 1} />
            ))}
            {rows.length === 0 ? (
              <li className="py-2 pl-10 text-sm text-[#8c9ab5]">No transfer or utilization rows for this RID.</li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
