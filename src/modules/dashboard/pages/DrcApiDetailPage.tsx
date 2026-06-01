import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiAlertCircle, FiArrowLeft, FiDownload, FiEye, FiFileText } from 'react-icons/fi'
import { PageHeader } from '../components'
import { useCertificatesSetDataLoading } from '../layout/certificatesDataLoadingContext'
import { apiUrl } from '../../../api/http'
import { drcCertificatePdfFilename, downloadDrcCertificatePdf, downloadDrcCertificatePdfFromRecord } from '../helpers/drcCertificatePdf'
import {
  certificateRecordFromDrcApi,
  detailTableBodyRow,
  detailTableHeadRow,
  downloadFileBtnClass,
  ghostBtnClass,
  humanizeKey,
  issuedLandAreaSqMFromDrc,
  previewBtnClass,
  shellClass,
} from './drcApiDetail/helpers'
import type { DrcDetailResponse } from './drcApiDetail/types'
import { CertificatePreviewModal, DetailFieldTable, DocumentLinkField, FeedbackCard, kvCell, LedgerFieldTable, SectionCard } from './drcApiDetail/ui'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

export default function DrcApiDetailPage() {
  const { drcId = '' } = useParams()
  const [detail, setDetail] = useState<DrcDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [showCertPreview, setShowCertPreview] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const certSheetRef = useRef<HTMLDivElement>(null)
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
    const load = async () => {
      setFetchError(null)
      setHttpStatus(null)
      setDetail(null)
      try {
        const headers: Record<string, string> = {}
        if (API_KEY) headers['x-api-key'] = API_KEY
        const res = await fetch(apiUrl(`/api/tdr/drc/${encodeURIComponent(drcId)}`), { headers })
        if (!active) return
        setHttpStatus(res.status)
        if (!res.ok) {
          let msg = `The server returned ${res.status}.`
          try {
            const errBody = (await res.json()) as { message?: string; error?: string }
            if (errBody.message) msg = errBody.message
            else if (errBody.error) msg = errBody.error
          } catch {
            /* ignore */
          }
          setFetchError(msg)
          return
        }
        const data = (await res.json()) as DrcDetailResponse
        if (!active) return
        setDetail(data)
      } catch (e) {
        if (!active) return
        setFetchError(e instanceof Error ? e.message : 'Could not reach the server.')
        setHttpStatus(null)
      } finally {
        if (active) {
          setIsLoading(false)
          setCertificatesDataLoading(false)
        }
      }
    }
    if (!drcId) {
      setIsLoading(false)
      setFetchError(null)
      setHttpStatus(null)
      setCertificatesDataLoading(false)
      return
    }
    setIsLoading(true)
    void load()
    return () => {
      active = false
    }
  }, [drcId, setCertificatesDataLoading])

  useEffect(() => {
    setShowCertPreview(false)
  }, [drcId])

  const drc = detail?.drc

  const plotRows = useMemo(() => drc?.plots ?? [], [drc?.plots])
  const ownerData = (drc?.owner ?? {}) as Record<string, unknown>
  const projectData = (drc?.project ?? {}) as Record<string, unknown>

  const issuedAreaSqM = drc ? issuedLandAreaSqMFromDrc(drc) : 0

  const ledgerRows = useMemo<[string, unknown][]>(
    () => [
      ['Land ID', drc?.land?.land_id ?? '—'],
      ['Khasra No', drc?.land?.khasra_no ?? '—'],

      ['Total Area', drc?.land?.total_area ?? drc?.land?.proposed_area ?? '—'],
      ['Proposed Area', drc?.land?.proposed_area ?? drc?.land?.total_area ?? '—'],
      ['Remaining Area (sq.m)', drc?.land?.total_area - (drc?.land?.proposed_area ?? 0) - (drc?.transferred_tdr_value ?? 0) - (drc?.utilized_tdr_value ?? 0) > 0 ? (drc?.land?.total_area - (drc?.land?.proposed_area ?? 0) - (drc?.transferred_tdr_value ?? 0) - (drc?.utilized_tdr_value ?? 0)).toLocaleString('en-IN') : '—'],
      ['Value TDR', drc?.land?.value_tdr ?? '—'],
      ['Total TDR Value', drc?.total_tdr_value ?? '—'],
      ['Transferred TDR Value', drc?.transferred_tdr_value ?? drc?.transfer_tdr_value ?? '—'],
      ['Utilized TDR Value', drc?.utilized_tdr_value ?? '—'],
      ['Remaining TDR Value', drc?.remaining_tdr_value ?? '—'],
    ],
    [
      drc,
      issuedAreaSqM,
    ],
  )

  const documentEntries = useMemo(
    () => (drc?.documents ? Object.entries(drc.documents).filter(([, doc]) => doc) : []),
    [drc?.documents],
  )

  const ledgerRecord = useMemo(
    () => (drc ? certificateRecordFromDrcApi(drc, detail) : null),
    [drc, detail],
  )

  const handleDownloadLayoutPdf = useCallback(async () => {
    if (!ledgerRecord) return
    setPdfBusy(true)
    try {
      const name = drcCertificatePdfFilename(ledgerRecord)
      // If preview modal is open, the sheet is already mounted and can be captured.
      if (showCertPreview && certSheetRef.current) {
        await downloadDrcCertificatePdf(certSheetRef.current, name)
      } else {
        // Otherwise, render off-screen and capture the same certificate view.
        await downloadDrcCertificatePdfFromRecord(ledgerRecord)
      }
    } finally {
      setPdfBusy(false)
    }
  }, [ledgerRecord, showCertPreview])

  if (isLoading) {
    return <div className={`${shellClass} min-h-[48vh]`} aria-busy="true" />
  }

  if (!drcId) {
    return (
      <FeedbackCard
        variant="not_found"
        icon={<FiFileText className="h-7 w-7" aria-hidden />}
        title="No DRC id in the link"
        description="Open a DRC from the certificates list or use a valid link that includes the DRC identifier."
        drcId=""
      />
    )
  }

  if (fetchError && !drc) {
    const is404 = httpStatus === 404
    return (
      <FeedbackCard
        variant={is404 ? 'not_found' : 'error'}
        icon={is404 ? <FiFileText className="h-7 w-7" aria-hidden /> : <FiAlertCircle className="h-7 w-7" aria-hidden />}
        title={is404 ? 'DRC not found' : 'Could not load DRC'}
        description={
          is404
            ? 'No certificate is registered for this DRC id. Check the id or return to the list and open a DRC from there.'
            : fetchError
        }
        drcId={drcId}
      />
    )
  }

  if (!drc) {
    return (
      <FeedbackCard
        variant="not_found"
        icon={<FiFileText className="h-7 w-7" aria-hidden />}
        title="DRC not found"
        description="No details were returned for this DRC id. It may be invalid, removed, or not visible in your context."
        drcId={drcId}
      />
    )
  }

  return (
    <div className={shellClass}>
      <PageHeader
        title="DRC full details"
        subtitle={`${drc.project?.drc_certificate_no ?? detail?.drc_id ?? drcId} · ${drc.application_id ?? 'N/A'}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link to="/dashboard/certificates" className={ghostBtnClass}>
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Back to All DRC
        </Link>
        <span className="inline-flex rounded-full border border-[#b7eb8f] bg-[#f6ffed] px-3 py-1 text-xs font-semibold text-[#389e0d]">
          {drc.project?.status ?? 'UNKNOWN'}
        </span>
        <span className="inline-flex rounded-full border border-[#adc6ff] bg-[#f0f5ff] px-3 py-1 text-xs font-semibold text-[#1d39c4]">
          Stage: {drc.project?.project_stage ?? 'N/A'}
        </span>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#d6e4ff] bg-white/80 shadow-[0_4px_20px_-12px_rgba(29,57,196,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#e6f0ff] via-[#f5f9ff] to-[#eef4ff] px-4 py-3.5">
          <p className="min-w-0 text-sm font-semibold text-[#1d39c4]">DRC certificate</p>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!ledgerRecord}
              onClick={() => setShowCertPreview(true)}
              className={previewBtnClass}
            >
              <FiEye className="h-4 w-4 shrink-0" aria-hidden />
              Preview
            </button>
            <button
              type="button"
              disabled={pdfBusy || !ledgerRecord}
              onClick={() => void handleDownloadLayoutPdf()}
              className={downloadFileBtnClass}
            >
              <FiDownload className="h-4 w-4 shrink-0" aria-hidden />
              {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            {drc.application_id ? (
              <Link
                to={`/dashboard/certificates/drc/${encodeURIComponent(drcId)}/history`}
                className={ghostBtnClass}
              >
                View DRC history
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kvCell('Application ID', drc.application_id)}
        {kvCell('TDR App ID', drc.tdrApplicationId)}
        {kvCell('RID', drc.rid)}
        {kvCell('DRC ID', drc.project?.drc_id ?? detail?.drc_id)}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Owner details">
          <DetailFieldTable data={ownerData} />
        </SectionCard>

        <SectionCard title="Project information">
          <DetailFieldTable data={projectData} />
        </SectionCard>
      </section>

      <SectionCard title="Land & TDR ledger">
        <LedgerFieldTable rows={ledgerRows} />
      </SectionCard>

      <SectionCard title={`Plot Breakdown (${plotRows.length} plots)`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className={detailTableHeadRow}>
                <th className="py-2.5 pl-1">Plot ID</th>
                <th className="py-2.5">Plot No</th>
                <th className="py-2.5">Registry Area</th>
                <th className="py-2.5">Proposed Area</th>
                <th className="py-2.5">Ownership</th>
                <th className="py-2.5">Latitude</th>
                <th className="py-2.5 pr-1">Longitude</th>
              </tr>
            </thead>
            <tbody>
              {plotRows.map((p, idx) => (
                <tr
                  key={`${p.plot_id ?? idx}-${p.plot_no ?? idx}`}
                  className={detailTableBodyRow}
                >
                  <td className="py-2.5 pl-1 font-medium">{p.plot_id ?? '—'}</td>
                  <td className="py-2.5">{p.plot_no ?? '—'}</td>
                  <td className="py-2.5 tabular-nums">{p.registry_area ?? '—'}</td>
                  <td className="py-2.5 tabular-nums">{p.proposed_area ?? '—'}</td>
                  <td className="py-2.5">{p.ownership ?? '—'}</td>
                  <td className="py-2.5 tabular-nums">{p.latitude ?? '—'}</td>
                  <td className="py-2.5 pr-1 tabular-nums">{p.longitude ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {documentEntries.length > 0 ? (
        <SectionCard title="Documents">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {documentEntries.map(([key, doc]) => <DocumentLinkField key={key} label={humanizeKey(key)} doc={doc} />)}
          </div>
        </SectionCard>
      ) : null}

      <CertificatePreviewModal
        open={showCertPreview}
        ledgerRecord={ledgerRecord}
        certSheetRef={certSheetRef}
        pdfBusy={pdfBusy}
        onClose={() => setShowCertPreview(false)}
        onDownload={() => void handleDownloadLayoutPdf()}
      />

    </div>
  )
}
