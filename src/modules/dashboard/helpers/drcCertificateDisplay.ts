import type { CertificateRecord } from '../data/certificateLedgerData'

const BELOW_TWENTY = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function lt1000(n: number): string {
  if (n < 20) return BELOW_TWENTY[n]
  if (n < 100) {
    const u = n % 10
    return TENS[Math.floor(n / 10)] + (u ? ` ${BELOW_TWENTY[u]}` : '')
  }
  const h = Math.floor(n / 100)
  const rest = n % 100
  return `${BELOW_TWENTY[h]} Hundred${rest ? ` ${lt1000(rest)}` : ''}`
}

/** Indian numbering — integers only; adequate for DRC areas in demo data. */
export function integerToIndianWords(n: number): string {
  const x = Math.round(Math.abs(n))
  if (x === 0) return 'Zero'

  const parts: string[] = []
  let rem = x

  const crore = Math.floor(rem / 10000000)
  rem %= 10000000
  if (crore) parts.push(`${lt1000(crore)} Crore`.trim())

  const lakh = Math.floor(rem / 100000)
  rem %= 100000
  if (lakh) parts.push(`${lt1000(lakh)} Lakh`.trim())

  const thousand = Math.floor(rem / 1000)
  rem %= 1000
  if (thousand) parts.push(`${lt1000(thousand)} Thousand`.trim())

  if (rem) parts.push(lt1000(rem))

  return parts.join(' ')
}

export function sqmGrantedWords(totalSqm: number): string {
  return `${integerToIndianWords(totalSqm)} Square Metres only`
}

/** Parses DD-MM-YYYY / DD/MM/YYYY dates used in demo ledger rows. */
export function parseCertificateIssueDate(raw: string): Date | null {
  const parts = raw.trim().split(/[-/]/)
  if (parts.length !== 3) return null
  const d = Number(parts[0])
  const m = Number(parts[1]) - 1
  const y = Number(parts[2])
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null
  const dt = new Date(y, m, d)
  return Number.isNaN(dt.getTime()) ? null : dt
}

export function formatCertificateIssueDate(raw: string): string {
  const dt = parseCertificateIssueDate(raw)
  if (!dt) return raw
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function certificateValidUpto(rawIssueDate: string, years: number): string {
  const dt = parseCertificateIssueDate(rawIssueDate)
  if (!dt) return rawIssueDate
  const v = new Date(dt)
  v.setFullYear(v.getFullYear() + years)
  return v.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtSq2(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export type ResolvedDrcCertificateDisplay = {
  ownerName: string
  fatherOrHusbandName: string
  samagraId: string
  mobileNo: string
  address: string
  khasraNo: string
  village: string
  tehsil: string
  district: string
  totalLandAreaSqM: string
  landUse: string
  zoneSector: string
  permissibleFsi: string
  baseFsiConsumed: string
  additionalTdrLine: string
  certificateNo: string
  issueDateFormatted: string
  issueTransactionNo: string
  applicationId?: string
  tdrValueFormula: string
  totalTdrGranted: string
  totalTdrNumeric: number
  totalTdrWords: string
  validUptoFormatted: string
  summaryAreaLabel: string
  summaryTdrFactor: string
  summaryTotalTdr: string
  balanceArea: string
  utilizedPct: string
  transferRestriction: string
  verificationLine: string
  marketValueSqm: string
  /** Remaining TDR (sq.m.) — registry; may differ from land-equivalent balanceArea × factor when API supplies values. */
  balanceTdrSqm: string
  transferredTdrSqm: string

}

export function resolveDrcCertificateDisplay(record: CertificateRecord): ResolvedDrcCertificateDisplay {
  const factor = record.tdrFactor ?? 1
  const landBasis = record.totalLandAreaSqM ?? record.issuedArea

  const totalTdrNum =
    typeof record.totalTdrGrantedSqm === 'number' && Number.isFinite(record.totalTdrGrantedSqm) && record.totalTdrGrantedSqm >= 0
      ? record.totalTdrGrantedSqm
      : record.issuedArea * factor

  /** Factor shown in the formula so land × factor matches registry total when API total is supplied. */
  const formulaFactor =
    record.issuedArea > 0 && totalTdrNum > 0 ? totalTdrNum / record.issuedArea : factor

  const tdrValueFormula = `${fmtSq2(record.issuedArea)} Sq.m. × ${fmtSq2(formulaFactor)} × 1.0 = ${fmtSq2(totalTdrNum)} Sq.m.`

  const remainingTdrNum =
    typeof record.remainingTdrSqm === 'number' && Number.isFinite(record.remainingTdrSqm)
      ? Math.max(0, Math.min(record.remainingTdrSqm, totalTdrNum))
      : Math.max(0, record.balanceArea * factor)

  const utilizedTdrNum =
    typeof record.utilizedTdrSqm === 'number' && Number.isFinite(record.utilizedTdrSqm)
      ? Math.max(0, Math.min(record.utilizedTdrSqm, totalTdrNum))
      : Math.max(0, totalTdrNum - remainingTdrNum)

  const transferredTdrNum =
    typeof record.transferredTdrSqm === 'number' && Number.isFinite(record.transferredTdrSqm)
      ? Math.max(0, Math.min(record.transferredTdrSqm, totalTdrNum))
      : Math.max(0, utilizedTdrNum)

  const pct = totalTdrNum > 0 ? Math.round((utilizedTdrNum / totalTdrNum) * 1000) / 10 : 0


  const marketVal = record.marketValue
  const marketValueSqm =
    marketVal > 0 ? `₹${marketVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'

  return {
    ownerName: record.name,
    fatherOrHusbandName: record.fatherOrHusbandName ?? '—',
    samagraId: record.holderSamagraId ?? '—',
    mobileNo: record.mobileNo ?? '—',
    address: record.propertyAddress ?? `${record.city}, Madhya Pradesh`,
    khasraNo: record.khasraNo ?? `As per ULB / RoR reference ${record.issueTransactionNo}`,
    village: record.village ?? record.city,
    tehsil: record.tehsil ?? record.city,
    district: record.district ?? record.city,
    totalLandAreaSqM: (record.totalLandAreaSqM ?? record.issuedArea).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    landUse: record.landUse ?? 'As per MP TDR Policy, 2017 & ULB record',
    zoneSector: record.zoneSector ?? 'As per Master Plan / ULB zoning',
    permissibleFsi: record.permissibleFsi ?? 'As per applicable bye-laws',
    baseFsiConsumed: record.baseFsiConsumed ?? '—',
    additionalTdrLine: record.additionalTdrPermissible ?? `${record.issuedArea.toLocaleString('en-IN')} Sq.m. (eligible component)`,
    certificateNo: record.certificateNo,
    issueDateFormatted: formatCertificateIssueDate(record.issueDate),
    issueTransactionNo: record.issueTransactionNo,
    applicationId: record.applicationId,
    tdrValueFormula,
    totalTdrGranted: fmtSq2(totalTdrNum),
    totalTdrNumeric: totalTdrNum,
    totalTdrWords: sqmGrantedWords(Math.round(totalTdrNum)),
    validUptoFormatted: certificateValidUpto(record.issueDate, 5),
    summaryAreaLabel: fmtSq2(landBasis),
    summaryTdrFactor: fmtSq2(formulaFactor),
    summaryTotalTdr: fmtSq2(totalTdrNum),
    balanceArea: fmtSq2(record.balanceArea),
    balanceTdrSqm: fmtSq2(remainingTdrNum),
    utilizedPct: `${pct}%`,
    transferredTdrSqm: fmtSq2(transferredTdrNum),
    transferRestriction: 'Subject to MP TDR Policy, 2017, departmental orders & ULB conditions.',
    verificationLine: `TCP portal / registry · Application ${record.applicationId ?? record.issueTransactionNo}`,
    marketValueSqm,
  }
}

/** Deterministic pseudo SHA-256 hex for demo display (not cryptographic). */
export function demoSha256Hex(seed: string): string {
  const s = `${seed}|DRC-DEMO`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let hex = ''
  for (let i = 0; i < 8; i++) {
    h = Math.imul(h ^ (h >>> 15), h | 1)
    hex += (h >>> 0).toString(16).padStart(8, '0')
  }
  return hex.slice(0, 64)
}

