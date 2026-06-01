import type { TdrApplicationRecord } from '../data/tdrApplicationsData'

export function formatAreaSqM(value: number | undefined | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

/** Display areas from API-mapped record (no client-side recalculation). */
export function resolveApplicationAreas(record: TdrApplicationRecord) {
  return {
    total: record.totalAreaSqM ?? record.landAreaSqM ?? 0,
    proposed: record.proposedAreaSqM ?? 0,
    remaining: record.remainingAreaSqM ?? 0,
    transferred: record.transferredAreaSqM ?? 0,
    utilized: record.utilizedAreaSqM ?? 0,
  }
}
