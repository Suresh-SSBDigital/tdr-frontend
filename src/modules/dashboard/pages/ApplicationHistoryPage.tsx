import {useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft } from 'react-icons/fi'
import { apiUrl } from '../../../api/http'
import { resolveSamagraIdForApplication } from '../../../api/tdrFullTimeline'
import { buildSummary, card, d, toTransferRows, toUtilizationRows } from './applicationHistory/helpers'
import { DocumentsSection, HeaderSection, LandPlotsSection, SummarySection } from './applicationHistory/sections'
import { TransfersTable, UtilizationsTable } from './applicationHistory/tables'
import type { FullResponse, HistoryResponse } from './applicationHistory/types'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

export default function ApplicationHistoryPage() {
  const { applicationId } = useParams()
  const location = useLocation()
  const decodedId = decodeURIComponent(applicationId ?? '')
  const queryRid = new URLSearchParams(location.search).get('rid')?.trim() ?? ''
  const querySamagra = new URLSearchParams(location.search).get('samagra_id')?.trim() ?? ''
  const { data: pageData = null, isLoading, error: queryError } = useQuery({
    queryKey: ['application-history', decodedId, querySamagra],
    queryFn: async ({ signal }) => {
      if (!decodedId) return null

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (API_KEY) headers['x-api-key'] = API_KEY

      const hRes = await fetch(apiUrl(`/api/tdr/${encodeURIComponent(decodedId)}/blockchain/history`), { headers, signal })
      const hData = hRes.ok ? ((await hRes.json()) as HistoryResponse) : null

      let samagraId = querySamagra
      if (!samagraId) {
        samagraId = await resolveSamagraIdForApplication(decodedId, API_KEY)
      }
      if (!samagraId) {
        throw new Error('Samagra ID is required. Use “View history” from the applications list, or add ?samagra_id=… to the URL.')
      }

      const fullUrl = apiUrl(
        `/api/tdr/${encodeURIComponent(decodedId)}/full?samagra_id=${encodeURIComponent(samagraId)}`,
      )
      const fRes = await fetch(fullUrl, { headers, signal })
      if (!fRes.ok) {
        throw new Error(`Unable to load details (HTTP ${fRes.status})`)
      }
      const fData = (await fRes.json()) as FullResponse

      return {
        hData,
        fData,
        samagraId
      }
    },
    enabled: !!decodedId,
  })

  const history = pageData?.hData ?? null
  const full = pageData?.fData ?? null
  const samagraForLinks = pageData?.samagraId ?? querySamagra
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null

  const tdr = full?.tdr
  const lastHistory = history?.history?.[history.history.length - 1]
  const rid =
    (tdr?.rid ?? full?.rid ?? queryRid)?.trim() ||
    history?.history?.[history.history.length - 1]?.value?.rid?.trim() ||
    history?.history?.find((x) => x.value?.rid?.trim())?.value?.rid?.trim() ||
    '-'
  const docDrc = tdr?.documents?.drc_certificate
  const docForm4 = tdr?.documents?.form4
  const summary = useMemo(() => buildSummary(full), [full])
  const transferRows = useMemo(() => toTransferRows(full), [full])
  const utilizationRows = useMemo(() => toUtilizationRows(full), [full])
  const transactionsHref = (() => {
    const q = new URLSearchParams()
    if (rid !== '-') q.set('rid', rid)
    const sid = full?.samagra_id ?? full?.tdr?.owner?.samagra_id?.trim() ?? samagraForLinks
    if (sid) q.set('samagra_id', sid)
    const qs = q.toString()
    return `/dashboard/apply/${encodeURIComponent(decodedId)}/transactions${qs ? `?${qs}` : ''}`
  })()

  if (isLoading && decodedId) {
    return <div className="text-sm text-[#8c8c8c]">Loading…</div>
  }

  if (!decodedId) return <div className="text-sm text-[#8c8c8c]">No application selected.</div>

  if (error && !tdr) {

    return (
      <div className="space-y-3 bg-[#f6f8fb] p-2">
        <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
          <Link
            to="/dashboard/apply"
            className="inline-flex items-center gap-1 rounded-md border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-1.5 text-xs font-semibold text-[#1d39c4]"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Applications
          </Link>
        </div>
        <p className="rounded-md border border-[#ffa39e] bg-[#fff1f0] px-3 py-2.5 text-sm text-[#a8071a]">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 bg-[#f6f8fb] p-2">
      <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
        <Link to="/dashboard/apply" className="inline-flex items-center gap-1 rounded-md border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-1.5 text-xs font-semibold text-[#1d39c4]">
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>
        <Link to={transactionsHref} className="inline-flex items-center gap-1 rounded-md border border-[#d3adf7] bg-[#f9f0ff] px-3 py-1.5 text-xs font-semibold text-[#531dab]">
          All Transaction History
        </Link>
      </div>
      <HeaderSection tdr={tdr} decodedId={decodedId} rid={rid} />
      <SummarySection summary={summary} />
      <LandPlotsSection tdr={tdr} />
      <section>
        <section className={card}>
          <div className="border-b border-[#edf0f5] px-4 py-2.5 text-sm font-semibold text-[#1f2d3d]">Transfers</div>
          <TransfersTable rows={transferRows} viewAllHref={transactionsHref} />
        </section>
        <section className={card}>
          <div className="border-b border-[#edf0f5] px-4 py-2.5 text-sm font-semibold text-[#1f2d3d]">Utilizations</div>
          <UtilizationsTable rows={utilizationRows} viewAllHref={transactionsHref} />
        </section>
      </section>
      <DocumentsSection
        tdr={tdr}
        docDrc={docDrc}
        docDrcUrl={typeof docDrc === 'string' ? docDrc : docDrc?.file_url}
        docDrcHash={typeof docDrc === 'object' ? docDrc?.hash : undefined}
        docForm4={docForm4}
        docForm4Url={typeof docForm4 === 'string' ? docForm4 : docForm4?.file_url}
        docForm4Hash={typeof docForm4 === 'object' ? docForm4?.hash : undefined}
        lastHistory={lastHistory}
      />
      <div className="text-xs text-[#8c8c8c]">Last refresh: {d(tdr?.updatedAt)}</div>
      {error ? <p className="text-xs text-[#cf1322]">{error}</p> : null}
    </div>
  )
}
