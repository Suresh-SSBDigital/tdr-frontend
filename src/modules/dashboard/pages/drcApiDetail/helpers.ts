import type { CertificateRecord } from '../../data/certificateLedgerData'
import type { DrcDetailResponse } from './types'

export const shellClass = 'mx-auto max-w-6xl space-y-6'
export const cardShell =
  'overflow-hidden rounded-2xl border border-[#d6e4ff] bg-gradient-to-br from-[#f8fbff] via-white to-[#f0f7ff] shadow-[0_8px_28px_-16px_rgba(29,57,196,0.22),0_2px_12px_-6px_rgba(15,23,42,0.08)]'
export const primaryBtnClass =
  'inline-flex items-center gap-2 rounded-xl border border-[#adc6ff] bg-white px-4 py-2.5 text-sm font-semibold text-[#1d39c4] shadow-sm transition hover:border-[#597ef7] hover:bg-[#f0f5ff] hover:text-[#10239e]'
export const ghostBtnClass =
  'inline-flex items-center gap-2 rounded-xl border border-[#d6e4ff] bg-white/90 px-4 py-2.5 text-sm font-medium text-[#355070] shadow-sm transition hover:border-[#597ef7] hover:text-[#1d39c4]'
export const previewBtnClass =
  'inline-flex items-center gap-2 rounded-xl border border-[#adc6ff] bg-[#f0f5ff] px-4 py-2.5 text-sm font-semibold text-[#1d39c4] shadow-sm transition hover:border-[#597ef7] hover:bg-white'
export const downloadFileBtnClass =
  'inline-flex items-center gap-2 rounded-xl border border-[#95de64] bg-[#f6ffed] px-4 py-2.5 text-sm font-semibold text-[#237804] shadow-sm transition enabled:hover:border-[#73d13d] enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-55'

export const detailTableHeadRow =
  'border-b border-[#d6e4ff] bg-gradient-to-r from-[#e8f0ff] to-[#f0f7ff] text-xs font-semibold uppercase tracking-wide text-[#1d39c4]'
export const detailTableBodyRow =
  'border-b border-[#eef4ff] bg-white/60 text-[#2f3f5c] last:border-0 even:bg-[#fafcff]'

/** DrcCertificateSheet expects DD-MM-YYYY for date parsing. */
export function toCertificateIssueDate(raw?: string): string {
  if (!raw?.trim()) {
    const t = new Date()
    return `${String(t.getDate()).padStart(2, '0')}-${String(t.getMonth() + 1).padStart(2, '0')}-${t.getFullYear()}`
  }
  const d = new Date(raw)
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
  }
  return raw.trim()
}

export function stableCertificateSno(...parts: string[]) {
  const s = parts.filter(Boolean).join('|')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0
  return (h % 99_999) + 1
}

/** API numbers may be strings; ignore NaN / non-positive for “first positive area” picks. */
function coercePositiveNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, '').trim())
    if (Number.isFinite(n) && n > 0) return n
  }
  return 0
}

function coerceFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, '').trim())
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/** Land basis for issued DRC area (sq.m): land fields, root original_total_area, API `issued_land_area_sqm`, or sum of plots. */
export function issuedLandAreaSqMFromDrc(drc: NonNullable<DrcDetailResponse['drc']>): number {
  const land = drc.land as { proposed_area?: unknown; total_area?: unknown; original_total_area?: unknown } | undefined
  const root = drc as { original_total_area?: unknown; issued_land_area_sqm?: unknown; total_area?: unknown }

  const direct =
    coercePositiveNumber(land?.proposed_area) ||
    coercePositiveNumber(land?.total_area) ||
    coercePositiveNumber(land?.original_total_area) ||
    coercePositiveNumber(root.original_total_area) ||
    coercePositiveNumber(root.issued_land_area_sqm) ||
    coercePositiveNumber(root.total_area)

  if (direct > 0) return direct

  const plots = drc.plots
  if (!Array.isArray(plots) || plots.length === 0) return 0

  let sum = 0
  for (const p of plots) {
    const row = p as { registry_area?: unknown; proposed_area?: unknown }
    sum += coercePositiveNumber(row.registry_area) || coercePositiveNumber(row.proposed_area)
  }
  return sum > 0 ? sum : 0
}

export function certificateRecordFromDrcApi(
  drc: NonNullable<DrcDetailResponse['drc']>,
  detail: DrcDetailResponse | null,
): CertificateRecord {
  const owner = drc.owner
  const proj = drc.project
  const land = drc.land
  const appId = drc.application_id ?? ''
  const registryDrcId = (proj?.drc_id ?? detail?.drc_id ?? '').trim()

  const landSq = issuedLandAreaSqMFromDrc(drc)

  const totalTdr = coerceFiniteNumber(drc.total_tdr_value) ?? 0

  const remStored = coerceFiniteNumber(drc.remaining_tdr_value)
  const rawRemainingTdr =
    remStored !== undefined
      ? remStored
      : totalTdr > 0
        ? totalTdr
        : landSq

  let issuedArea: number
  let balanceArea: number
  let tdrFactor: number

  if (totalTdr > 0 && landSq > 0) {
    issuedArea = landSq
    tdrFactor = totalTdr / landSq
    const remTdr = Math.max(0, Math.min(rawRemainingTdr, totalTdr))
    balanceArea = totalTdr > 0 ? (remTdr / totalTdr) * landSq : landSq
  } else if (totalTdr > 0) {
    issuedArea = totalTdr
    tdrFactor = 1
    balanceArea = Math.max(0, Math.min(rawRemainingTdr, totalTdr))
  } else {
    issuedArea = landSq
    tdrFactor = 1
    balanceArea = Math.max(0, Math.min(rawRemainingTdr, landSq))
  }

  const remVal = coerceFiniteNumber(drc.remaining_tdr_value)
  const registryRemainingTdr =
    remVal !== undefined
      ? Math.max(0, totalTdr > 0 ? Math.min(remVal, totalTdr) : remVal)
      : totalTdr > 0
        ? totalTdr
        : undefined

  const utilVal = coerceFiniteNumber(drc.utilized_tdr_value)
  const registryUtilizedTdr =
    utilVal !== undefined
      ? Math.max(0, totalTdr > 0 ? Math.min(utilVal, totalTdr) : utilVal)
      : totalTdr > 0 && registryRemainingTdr !== undefined
        ? Math.max(0, totalTdr - registryRemainingTdr)
        : undefined

  const registryTransferredTdr =
    coerceFiniteNumber(drc.transferred_tdr_value) ?? coerceFiniteNumber(drc.transfer_tdr_value)

  const issueRaw =
    proj?.drc_generation_dt ?? proj?.govt_order_dt ?? (typeof drc.createdAt === 'string' ? drc.createdAt : undefined)

  const certNo = proj?.drc_certificate_no ?? detail?.drc_id ?? (appId ? `DRC/${appId}` : 'DRC')

  return {
    sno: stableCertificateSno(registryDrcId, certNo, appId),
    name: owner?.name ?? '—',
    city: proj?.district ?? '—',
    issuedArea,
    balanceArea,
    marketValue: coerceFiniteNumber(land?.value_tdr) ?? 0,
    issueDate: toCertificateIssueDate(issueRaw),
    certificateNo: certNo,
    issueTransactionNo: drc.rid ?? drc.tdrApplicationId ?? '—',
    applicationId: appId || undefined,
    holderSamagraId: owner?.samagra_id || undefined,
    mobileNo: owner?.mobile,
    propertyAddress: owner?.address,
    khasraNo: land?.khasra_no,
    village: proj?.village,
    tehsil: proj?.tehsil,
    district: proj?.district,
    totalLandAreaSqM:
      coercePositiveNumber(land?.total_area) ||
      coercePositiveNumber(land?.proposed_area) ||
      (landSq > 0 ? landSq : undefined),
    landUse: proj?.project_name ? `Project: ${proj.project_name}` : undefined,
    zoneSector: proj?.implement_agency ? `${proj.implement_agency}` : undefined,
    tdrFactor,
    ...(totalTdr > 0
      ? {
          totalTdrGrantedSqm: totalTdr,
          remainingTdrSqm: registryRemainingTdr,
          utilizedTdrSqm: registryUtilizedTdr,
          transferredTdrSqm: registryTransferredTdr,
        }
      : {}),
  }
}

export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (s) => s.toUpperCase())
}

export function formatValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/
    if (isoDateOnly.test(trimmed)) {
      const maybeDate = new Date(trimmed)
      if (!Number.isNaN(maybeDate.getTime())) {
        return maybeDate.toLocaleString('en-IN')
      }
    }
    return value
  }
  return JSON.stringify(value)
}

export function isSensitiveHashField(key: string): boolean {
  const normalized = key.toLowerCase()
  return normalized.includes('hash') || normalized === '__v'
}
