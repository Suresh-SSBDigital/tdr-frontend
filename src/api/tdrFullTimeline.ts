import { apiUrl } from './http'

/** Response shape from `GET /api/tdr/:applicationId/full?samagra_id=...`. */
export type TdrFullSnapshot = {
  success?: boolean
  application_id?: string
  rid?: string
  tdr?: {
    rid?: string
    /** Current holder on the TDR document — used to resolve OWN-* id to display name when ids match */
    owner?: {
      owner_id?: string
      name?: string
      samagra_id?: string
    }
    transfers?: Array<{
      trn_id?: string
      owner_from?: string
      owner_to?: string
      trn_value_tdr?: number
      remaining_value_tdr?: number
      trn_date?: string
      status?: string
    }>
    utilizations?: Array<{
      utilization_id?: string
      utilized_by?: string
      utilized_value_tdr?: number
      before_utilization_balance?: number
      after_utilization_balance?: number
      utilization_purpose?: string
      utilization_date?: string
      status?: string
    }>
  }
}

export type TimelineRow = {
  stepType: 'TRANSFER' | 'UTILIZATION'
  refId: string
  /** Identifier / Samagra / ref from API */
  from: string
  /** Identifier / Samagra / ref from API */
  to: string
  /** Human-readable name when API sends it (Mixed / external fields) */
  fromName?: string
  /** Human-readable name — transferee / recipient for transfers */
  toName?: string
  amount?: number
  before?: number
  after?: number
  beforeArea?: number
  amountArea?: number
  afterArea?: number
  notes: string
  at?: string
  status?: string
  order: number
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function pickFirstNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number' && !Number.isNaN(v)) return v
    if (typeof v === 'string' && v.trim()) {
      const parsed = Number(v)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return undefined
}

/** Single-line label: `OWN-MP-… — Full Name` when name is known and differs from id. */
export function formatOwnerIdWithName(id: string, name?: string): string {
  const i = id?.trim() || '—'
  const n = name?.trim()
  if (!n || n === i) return i
  return `${i} — ${n}`
}

function enrichTimelineRows(rows: TimelineRow[], data: TdrFullSnapshot | null): TimelineRow[] {
  const tdr = data?.tdr as { owner?: { owner_id?: string; name?: string } } | undefined
  const ownerId = tdr?.owner?.owner_id?.trim()
  const ownerName = tdr?.owner?.name?.trim()

  const nameById = new Map<string, string>()
  for (const r of rows) {
    const fk = r.from?.trim()
    const tk = r.to?.trim()
    if (fk && fk !== '-' && r.fromName) nameById.set(fk, r.fromName)
    if (tk && tk !== '-' && tk !== 'Consumed' && r.toName) nameById.set(tk, r.toName)
  }

  return rows.map((r) => {
    const fk = r.from?.trim() ?? ''
    const tk = r.to?.trim() ?? ''
    if (r.stepType === 'UTILIZATION') {
      let fromName = r.fromName ?? (fk && fk !== '-' ? nameById.get(fk) : undefined)
      if (!fromName && ownerId && ownerName && fk === ownerId) fromName = ownerName
      return { ...r, fromName }
    }
    let fromName = r.fromName ?? (fk && fk !== '-' ? nameById.get(fk) : undefined)
    let toName = r.toName ?? (tk && tk !== '-' ? nameById.get(tk) : undefined)
    if (!fromName && ownerId && ownerName && fk === ownerId) fromName = ownerName
    if (!toName && ownerId && ownerName && tk === ownerId) toName = ownerName
    return { ...r, fromName, toName }
  })
}

export function buildTimelineRows(data: TdrFullSnapshot | null): TimelineRow[] {
  const transfers = data?.tdr?.transfers ?? []
  const utilizations = data?.tdr?.utilizations ?? []
  const merged = [
    ...transfers.map((t, idx) => {
      const raw = t as Record<string, unknown>
      const amount = pickFirstNumber(raw, [
        'trn_value_tdr',
        'transfer_value_tdr',
        'transferred_value_tdr',
        'value_tdr',
        'amount_tdr',
      ])
      const after = pickFirstNumber(raw, [
        'remaining_value_tdr',
        'remaining_tdr_value',
        'post_transfer_balance',
        'balance_after_transfer',
      ])
      const before =
        pickFirstNumber(raw, [
          'before_transfer_balance',
          'pre_transfer_balance',
          'balance_before_transfer',
          'opening_balance_tdr',
        ]) ??
        (after != null && amount != null ? after + amount : undefined)
      const fromName = pickFirstString(raw, [
        'owner_from_name',
        'ownerFromName',
        'from_owner_name',
        'transferor_name',
        'sender_name',
      ])
      const toName = pickFirstString(raw, [
        'owner_to_name',
        'ownerToName',
        'to_owner_name',
        'recipient_name',
        'receiver_name',
        'transferee_name',
        'beneficiary_name',
        'new_owner_name',
      ])
      const amountArea = pickFirstNumber(raw, [
        'transferred_area',
        'area_transferred',
        'trn_area',
        'transfer_area',
      ])
      const afterArea = pickFirstNumber(raw, [
        'remaining_area',
        'remaining_area_tdr',
        'post_transfer_area',
        'after_transfer_area',
      ])
      const beforeArea =
        pickFirstNumber(raw, [
          'before_transfer_area',
          'pre_transfer_area',
          'opening_area',
          'previous_area',
        ]) ?? (afterArea != null && amountArea != null ? afterArea + amountArea : undefined)

      return {
        stepType: 'TRANSFER' as const,
        refId: t.trn_id ?? `transfer-${idx + 1}`,
        from: t.owner_from ?? '-',
        to: t.owner_to ?? '-',
        fromName,
        toName,
        amount,
        before,
        after,
        beforeArea,
        amountArea,
        afterArea,
        notes: 'Owner to owner transfer',
        at: t.trn_date,
        status: t.status,
        order: idx,
      }
    }),
    ...utilizations.map((u, idx) => {
      const raw = u as Record<string, unknown>
      const amount = pickFirstNumber(raw, [
        'utilized_value_tdr',
        'utilization_value_tdr',
        'value_tdr',
        'amount_tdr',
      ])
      const before = pickFirstNumber(raw, [
        'before_utilization_balance',
        'before_balance_tdr',
        'pre_utilization_balance',
      ])
      const after = pickFirstNumber(raw, [
        'after_utilization_balance',
        'after_balance_tdr',
        'post_utilization_balance',
        'remaining_value_tdr',
      ])
      const fromName = pickFirstString(raw, [
        'utilized_by_name',
        'utilizedByName',
        'consumer_name',
        'utilizer_name',
        'agency_name',
        'beneficiary_name',
      ])
      const amountArea = pickFirstNumber(raw, [
        'utilized_area',
        'generated_utilized_area',
        'utilization_area',
      ])
      const beforeArea = pickFirstNumber(raw, [
        'before_utilization_area',
        'pre_utilization_area',
        'previous_area',
      ])
      const afterArea = pickFirstNumber(raw, [
        'after_utilization_area',
        'remaining_area',
        'post_utilization_area',
      ])

      return {
        stepType: 'UTILIZATION' as const,
        refId: u.utilization_id ?? `utilization-${idx + 1}`,
        from: u.utilized_by ?? '-',
        to: 'Consumed',
        fromName,
        toName: undefined,
        amount,
        before,
        after,
        beforeArea,
        amountArea,
        afterArea,
        notes: u.utilization_purpose ?? 'TDR utilization',
        at: u.utilization_date,
        status: u.status,
        order: idx,
      }
    }),
  ]
  merged.sort((a, b) => {
    const ta = a.at ? new Date(a.at).getTime() : 0
    const tb = b.at ? new Date(b.at).getTime() : 0
    if (ta !== tb) return ta - tb
    if (a.stepType !== b.stepType) return a.stepType === 'TRANSFER' ? -1 : 1
    return a.order - b.order
  })
  return enrichTimelineRows(merged, data)
}

export async function resolveSamagraIdForApplication(
  applicationId: string,
  apiKey: string,
): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey
  const res = await fetch(apiUrl('/api/tdr/history/applications'), { headers })
  if (!res.ok) return ''
  const data = (await res.json()) as {
    applications?: Array<{ application_id?: string; samagra_id?: string }>
  }
  const row = data.applications?.find((a) => a.application_id === applicationId)
  return row?.samagra_id?.trim() ?? ''
}

/**
 * Loads full TDR from `GET /api/tdr/:applicationId/full?samagra_id=...`.
 * When `samagraIdHint` is empty, tries `/api/tdr/history/applications` to find `samagra_id` for this application.
 * `ridHint` is only used to return `resolvedRid` for UI links (optional).
 */
export async function fetchTdrFullSnapshot(
  applicationId: string,
  ridHint: string,
  samagraIdHint: string,
  apiKey: string,
): Promise<{ ok: true; data: TdrFullSnapshot; resolvedRid: string } | { ok: false; error: string; status?: number }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey

  let samagraId = samagraIdHint.trim()
  if (!samagraId) {
    samagraId = await resolveSamagraIdForApplication(applicationId, apiKey)
  }
  if (!samagraId) {
    return {
      ok: false,
      error:
        'Samagra ID is required to load this TDR. Open the page from the applications list, or add ?samagra_id=… to the URL.',
    }
  }

  let finalRid = ridHint.trim()
  if (!finalRid) {
    const hRes = await fetch(apiUrl(`/api/tdr/${encodeURIComponent(applicationId)}/blockchain/history`), { headers })
    if (hRes.ok) {
      const hData = (await hRes.json()) as {
        history?: Array<{ value?: { rid?: string } }>
      }
      finalRid =
        hData.history?.[hData.history.length - 1]?.value?.rid?.trim() ??
        hData.history?.find((x) => x.value?.rid?.trim())?.value?.rid?.trim() ??
        ''
    }
  }

  const qs = new URLSearchParams({ samagra_id: samagraId })
  const path = `/api/tdr/${encodeURIComponent(applicationId)}/full?${qs.toString()}`
  const res = await fetch(apiUrl(path), { headers })
  if (!res.ok) {
    return { ok: false, error: `Unable to load TDR snapshot (HTTP ${res.status}).`, status: res.status }
  }
  const payload = (await res.json()) as TdrFullSnapshot
  return { ok: true, data: payload, resolvedRid: finalRid }
}
