import type { CertificateRecord } from '../data/certificateLedgerData'
import { getDrcUtilizationBreakdown } from '../data/certificateLedgerData'

/** React Router path to the full on-screen certificate (download PDF available there). */
export function getDrcCertificateVerifyPath(record: CertificateRecord): string {
  if (record.applicationId) {
    return `/dashboard/certificates/drc-view/by-application/${encodeURIComponent(record.applicationId)}`
  }
  return `/dashboard/certificates/drc-view/sno/${record.sno}`
}

/** Absolute URL for QR codes — scanning opens this certificate in the portal. */
export function getDrcCertificateVerifyUrl(record: CertificateRecord): string {
  const path = getDrcCertificateVerifyPath(record)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  return path
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function drcCertificateFilename(record: CertificateRecord): string {
  const base = record.certificateNo.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_')
  return `DRC_${base}.html`
}

export function buildDrcCertificateStandaloneHtml(
  record: CertificateRecord,
  opts?: { blockchainTxHash?: string; blockNumber?: number },
): string {
  const u = getDrcUtilizationBreakdown(record)
  const verifyUrl = getDrcCertificateVerifyUrl(record)
  const tx = opts?.blockchainTxHash ?? `0xISSUED${record.sno.toString().padStart(4, '0')}`
  const block = opts?.blockNumber ?? 10000 + record.sno

  const rows: [string, string][] = [
    ['Certificate no.', record.certificateNo],
    ['Linked application', record.applicationId ?? '—'],
    ['Samagra (holder id)', record.holderSamagraId ?? '—'],
    ['Beneficiary name', record.name],
    ['ULB / district', record.city],
    ['Issue date', record.issueDate],
    ['Issue transaction no.', record.issueTransactionNo],
    ['Issued area (sq.m)', String(record.issuedArea)],
    ['Balance area (sq.m)', String(record.balanceArea)],
    ['Utilized (sq.m)', String(u.utilizedSqMt)],
    ['Market value / sq.m (₹)', String(record.marketValue)],
    ['Blockchain anchor (demo)', `${tx} · Block ${block}`],
    ['Certificate verification URL', verifyUrl],
  ]

  const bodyRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #d9d9d9;background:#fafafa;font-weight:600;font-size:12px;color:#595959;width:38%;">${escapeHtml(k)}</td><td style="padding:8px 12px;border:1px solid #d9d9d9;font-size:13px;color:#262626;">${escapeHtml(v)}</td></tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(record.certificateNo)} — DRC</title>
<style>
  body { font-family: system-ui, Segoe UI, Roboto, sans-serif; margin: 24px; color: #262626; background: #f0f2f5; }
  .sheet { max-width: 720px; margin: 0 auto; background: #fff; border: 2px solid #1890ff; border-radius: 12px; padding: 28px 32px 36px; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  h1 { margin: 0 0 8px; font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: #1890ff; }
  h2 { margin: 0 0 20px; font-size: 22px; color: #262626; }
  .note { font-size: 11px; color: #8c8c8c; margin-top: 20px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  @media print {
    body { background: #fff; margin: 0; }
    .sheet { box-shadow: none; border-radius: 0; border-color: #000; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <h1>Government of Madhya Pradesh · TCP</h1>
    <h2>Transferable Development Rights — Certificate</h2>
    <table>${bodyRows}</table>
    <p style="margin-top:18px;font-size:13px;"><a href="${escapeHtml(verifyUrl)}">Open full certificate in portal (download PDF)</a></p>
    <p class="note">This HTML file was generated from the portal (demo). Open in a browser and use Print → Save as PDF for an official-style PDF copy. Scanning the QR on the portal certificate opens this same page. Verify authenticity through the departmental blockchain / registry module.</p>
  </div>
</body>
</html>`
}

export function downloadDrcCertificateHtml(
  record: CertificateRecord,
  opts?: { blockchainTxHash?: string; blockNumber?: number },
): void {
  const html = buildDrcCertificateStandaloneHtml(record, opts)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = drcCertificateFilename(record)
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
