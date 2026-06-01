import { FiClock, FiDatabase, FiRefreshCw } from 'react-icons/fi'
import type { FullResponse, TransferRow, UtilizationRow } from './types'

export const card = 'rounded-[14px] border border-[#e7ebf1] bg-white shadow-[0_3px_14px_-10px_rgba(15,23,42,0.28)]'
export const th =
  'border-b border-[#edf0f5] px-3 py-3 text-center text-xs font-semibold tracking-wide text-[#1d39c4] bg-[#f5f7ff]'
export const td = 'border-b border-[#f2f4f8] px-3 py-3 text-sm text-[#2f3640]'

export function d(v?: string) {
  if (!v) return '-'
  const dt = new Date(v)
  if (Number.isNaN(dt.getTime())) return v
  return dt.toLocaleString('en-IN')
}

export function n(v?: number, suffix = '') {
  if (v == null) return '-'
  return `${v.toLocaleString('en-IN')}${suffix}`
}

export function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return undefined
}

export function statusBadge(status?: string) {
  const normalized = (status ?? '').toUpperCase()
  if (normalized === 'APPROVED') return 'bg-[#e9f9ee] text-[#237804] border border-[#b7eb8f]'
  if (normalized === 'REJECTED') return 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]'
  if (normalized === 'PENDING') return 'bg-[#e6f4ff] text-[#0958d9] border border-[#91caff]'
  return 'bg-[#f5f5f5] text-[#595959] border border-[#d9d9d9]'
}

export function toTransferRows(full: FullResponse | null): TransferRow[] {
  const transfers = full?.tdr?.transfers ?? []
  return transfers.map((t, i) => {
    const transferValue = pickNumber(
      t.trn_value_tdr,
      t.transfer_value_tdr,
      t.transferred_value_tdr,
      t.value_tdr,
    )
    const remaining = pickNumber(
      t.remaining_value_tdr,
      t.remaining_tdr_value,
      t.balance_after_transfer,
      t.post_transfer_balance,
    )
    const beforeBalance =
      pickNumber(
        t.before_transfer_balance,
        t.pre_transfer_balance,
        t.balance_before_transfer,
        t.opening_balance_tdr,
      ) ?? (remaining != null && transferValue != null ? remaining + transferValue : undefined)

    // Prefer direct backend keys first (so "before" derivation is consistent with "post" remaining)
    const usedTransferAreaSqM = pickNumber(
      t.transferred_area_sq_m,
      t.transferred_area,
      t.transfer_area_sq_m,
      t.transfer_area,
      t.trn_area_sq_m,
      t.trn_area,
    )

    const remainingAreaSqM = pickNumber(
      t.remaining_area_sq_m,
      t.remaining_area,
      t.after_transfer_area_sq_m,
      t.balance_after_transfer_area_sq_m,
      t.post_transfer_remaining_area_sq_m,
      t.post_transfer_remaining_area,
    )

    const beforeTransferAreaSqM =
      pickNumber(
        t.before_transfer_area,
        t.pre_transfer_area,
        t.opening_transfer_area,
        t.before_transfer_area_sq_m,
        t.pre_transfer_area_sq_m,
        t.opening_transfer_area_sq_m,
      ) ??
      (usedTransferAreaSqM != null && remainingAreaSqM != null
        ? usedTransferAreaSqM + remainingAreaSqM
        : undefined)

    return {
      srNo: i + 1,
      trnId: t.trn_id ?? `trn-${i + 1}`,
      ownerFrom: t.owner_from ?? '-',
      ownerTo: t.owner_to ?? '-',
      transferValue,
      beforeBalance,
      remaining,
      beforeTransferAreaSqM,
      usedTransferAreaSqM,
      remainingAreaSqM,
      date: t.trn_date,
      status: t.status,
    }
  })
}

export function toUtilizationRows(full: FullResponse | null): UtilizationRow[] {
  const rows = full?.tdr?.utilizations ?? []
  return rows.map((u, i) => {
    // Backend might return utilization area fields (sq.m). These are optional, so we access them defensively.
    const anyU = u as unknown as Record<string, unknown>

    const usedUtilizationAreaSqM = pickNumber(
      anyU.utilized_area_sq_m,
      anyU.utilization_area_sq_m,
      anyU.utilized_area,
      anyU.utilization_area,
    )

    const remainingAreaSqM = pickNumber(
      anyU.remaining_area_sq_m,
      anyU.remaining_area,
      anyU.after_utilization_area_sq_m,
      anyU.after_utilization_remaining_area_sq_m,
      anyU.post_utilization_remaining_area_sq_m,
      anyU.post_utilization_remaining_area,
    )

    const beforeUtilizationAreaSqM =
      pickNumber(
        anyU.before_utilization_area,
        anyU.pre_utilization_area,
        anyU.opening_utilization_area,
        anyU.before_utilization_area_sq_m,
        anyU.pre_utilization_area_sq_m,
        anyU.opening_utilization_area_sq_m,
      ) ??
      (usedUtilizationAreaSqM != null && remainingAreaSqM != null
        ? usedUtilizationAreaSqM + remainingAreaSqM
        : undefined)

    return {
      srNo: i + 1,
      utilizationId: u.utilization_id ?? `util-${i + 1}`,
      utilizedBy: u.utilized_by ?? '-',
      utilizedValue: u.utilized_value_tdr,
      beforeBalance: u.before_utilization_balance,
      afterBalance: u.after_utilization_balance,
      purpose: u.utilization_purpose ?? '-',
      beforeUtilizationAreaSqM,
      usedUtilizationAreaSqM,
      remainingAreaSqM,
      date: u.utilization_date,
      status: u.status,
    }
  })
}

export function buildSummary(full: FullResponse | null) {
  const tdr = full?.tdr
  return [
    {
      label: 'Total TDR Value',
      value: n(tdr?.total_tdr_value),
      icon: <FiDatabase className="h-4 w-4 text-[#c28b00]" />,
      tone: 'text-[#ad6800]',
      bg: 'bg-[#fff7e6]',
      border: 'border-[#ffe7ba]',
    },
    {
      label: 'Transfer TDR Value',
      value: n(
        pickNumber(
          tdr?.transfer_tdr_value,
          full?.transfer_tdr_value,
          (tdr?.transfers ?? []).reduce((sum, t) => sum + (pickNumber(t.trn_value_tdr, t.transfer_value_tdr) ?? 0), 0),
        ),
      ),
      icon: <FiRefreshCw className="h-4 w-4 text-[#722ed1]" />,
      tone: 'text-[#531dab]',
      bg: 'bg-[#f9f0ff]',
      border: 'border-[#efdbff]',
    },
    {
      label: 'Utilized TDR Value',
      value: n(tdr?.utilized_tdr_value),
      icon: <FiRefreshCw className="h-4 w-4 text-[#0958d9]" />,
      tone: 'text-[#0958d9]',
      bg: 'bg-[#e6f4ff]',
      border: 'border-[#d6e4ff]',
    },
    {
      label: 'Remaining TDR Value',
      value: n(tdr?.remaining_tdr_value),
      icon: <FiClock className="h-4 w-4 text-[#cf1322]" />,
      tone: 'text-[#cf1322]',
      bg: 'bg-[#fff1f0]',
      border: 'border-[#ffa39e]',
    },
  ]
}
