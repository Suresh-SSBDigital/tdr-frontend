import { useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi'
import DrcCertificateSheet from '../components/DrcCertificateSheet'
import { PageHeader } from '../components'
import { buildLedgerData, getCertificateByApplicationId, getCertificateBySno } from '../data/certificateLedgerData'
import { buildDrcCertificateStandaloneHtml } from '../helpers/drcCertificateDocument'
import {
  downloadDrcCertificatePdf,
  downloadDrcCertificatePdfFromRecord,
  drcCertificatePdfFilename,
} from '../helpers/drcCertificatePdf'

export default function DrcCertificateViewPage() {
  const certRef = useRef<HTMLDivElement>(null)
  const { applicationId: applicationIdParam, sno: snoParam } = useParams()

  const record = useMemo(() => {
    if (applicationIdParam) {
      return getCertificateByApplicationId(decodeURIComponent(applicationIdParam))
    }
    const sno = Number(snoParam)
    return getCertificateBySno(Number.isNaN(sno) ? -1 : sno)
  }, [applicationIdParam, snoParam])

  const ledger = useMemo(() => (record ? buildLedgerData(record) : null), [record])

  const backHref = record?.applicationId
    ? `/dashboard/certificates/by-application/${encodeURIComponent(record.applicationId)}`
    : record
      ? `/dashboard/certificates/${record.sno}`
      : '/dashboard/certificates'

  if (!record || !ledger) {
    return (
      <div className="space-y-4">
        <PageHeader title="Certificate not found" subtitle="No DRC record matches this link." />
        <Link to="/dashboard/certificates" className="text-sm font-medium text-[#1890ff] hover:underline">
          ← Back to registry
        </Link>
      </div>
    )
  }

  const ledgerOpts = {
    blockchainTxHash: ledger.blockchainTxHash,
    blockNumber: ledger.blockNumber,
  }

  const handlePrint = () => {
    const html = buildDrcCertificateStandaloneHtml(record, ledgerOpts)
    const w = window.open('', '_blank', 'noopener,noreferrer')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    requestAnimationFrame(() => w.print())
  }

  const handleDownloadPdf = async () => {
    const el = certRef.current
    if (el) {
      await downloadDrcCertificatePdf(el, drcCertificatePdfFilename(record))
      return
    }
    await downloadDrcCertificatePdfFromRecord(record, ledgerOpts)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="DRC certificate"
        subtitle={`${record.certificateNo}${record.applicationId ? ` · ${record.applicationId}` : ''}`}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d9d9d9] bg-white px-4 py-2.5 text-sm font-medium text-[#262626] shadow-sm hover:border-[#1890ff] hover:text-[#1890ff]"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Ledger statement
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1890ff] bg-[#1890ff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#40a9ff]"
        >
          <FiPrinter className="h-4 w-4" aria-hidden />
          Print / Save as PDF
        </button>
        <button
          type="button"
          onClick={() => void handleDownloadPdf()}
          className="inline-flex items-center gap-2 rounded-lg border border-[#52c41a] bg-[#f6ffed] px-4 py-2.5 text-sm font-semibold text-[#237804] shadow-sm hover:bg-[#d9f7be]"
        >
          <FiDownload className="h-4 w-4" aria-hidden />
          Download PDF
        </button>
      </div>

      <DrcCertificateSheet
        ref={certRef}
        record={record}
        blockchainTxHash={ledger.blockchainTxHash}
        blockNumber={ledger.blockNumber}
      />
    </div>
  )
}
