import type {
  DepartmentStatusApi,
  DrcApiComposite,
  DrcModelApi,
  Form6LedgerRowApi,
  OwnerModelApi,
} from '../types/drcApiContracts'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function commonApplicationBody(applicationId: string) {
  return {
    application_id: applicationId,
    applicationid: applicationId,
    p_application_id: applicationId,
    ApplicationId: applicationId,
  }
}

async function postJson(url: string, body: object): Promise<unknown> {
  const res = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) })
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function unwrapArray<T extends object>(raw: unknown): T[] {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw !== 'object') return []
  const o = raw as Record<string, unknown>
  for (const k of ['data', 'Data', 'result', 'Result', 'items', 'Items', 'rows', 'Rows', 'list', 'List']) {
    const v = o[k]
    if (Array.isArray(v)) return v as T[]
  }
  return []
}

function unwrapObject<T extends object>(raw: unknown): T | null {
  if (raw == null || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  for (const k of ['data', 'Data', 'result', 'Result']) {
    const v = o[k]
    if (v != null && typeof v === 'object' && !Array.isArray(v)) return v as T
  }
  return raw as T
}

function pickDrcForApplication(list: DrcModelApi[], applicationId: string): DrcModelApi | null {
  const id = applicationId.trim().toLowerCase()
  return list.find((d) => String(d.application_id ?? d.applicationId ?? '').toLowerCase() === id) ?? list[0] ?? null
}

export async function fetchDrcCompositeForApplication(applicationId: string): Promise<DrcApiComposite> {
  const body = commonApplicationBody(applicationId)

  const results = await Promise.allSettled([
    postJson('/api/Agency/GetAgencyApplication', body),
    postJson('/api/Agency/GetForm6Leger', body),
    postJson('/api/User/GetDRCList', { ...body, querytype: 'LIST' }),
    postJson('/api/User/GetDRCOwnerDetail', body),
    postJson('/api/Department/GetApplicationStatus', body),
    postJson('/api/DataSharing/GetProvisionalForm11Data', body),
  ])

  let hadResponse = false
  const get = (i: number) => (results[i]?.status === 'fulfilled' ? results[i].value : null)

  const agencyRaw = get(0)
  if (agencyRaw != null) hadResponse = true

  const form6Raw = get(1)
  const form6Ledger = unwrapArray<Form6LedgerRowApi>(form6Raw)
  if (form6Raw != null) hadResponse = true

  const listRaw = get(2)
  const drcList = unwrapArray<DrcModelApi>(listRaw)
  if (listRaw != null) hadResponse = true

  const ownerRaw = get(3)
  const ownerDetail = unwrapObject<OwnerModelApi>(ownerRaw)
  if (ownerRaw != null) hadResponse = true

  const statusRaw = get(4)
  const applicationStatus = (unwrapObject<DepartmentStatusApi>(statusRaw) ?? statusRaw) as DepartmentStatusApi | unknown
  if (statusRaw != null) hadResponse = true

  const provRaw = get(5)
  const provisionalForm11 = (unwrapObject<Record<string, unknown>>(provRaw) ?? provRaw) as unknown
  if (provRaw != null) hadResponse = true

  const drc = pickDrcForApplication(drcList, applicationId)

  return {
    agencyApplication: agencyRaw,
    form6Ledger,
    drcList: drc ? [drc] : drcList,
    ownerDetail,
    applicationStatus,
    provisionalForm11,
    hadResponse,
  }
}
