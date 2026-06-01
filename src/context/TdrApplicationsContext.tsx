import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { type TdrApplicationRecord } from '../modules/dashboard/data/tdrApplicationsData'
import { apiUrl } from '../api/http'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

function randomTx() {
  return `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}…${Math.floor(Math.random() * 900 + 100)}`
}

interface TdrApplicationsContextValue {
  applications: TdrApplicationRecord[]
  isLoading: boolean
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
  generateDrc: (id: string) => void
}

const TdrApplicationsContext = createContext<TdrApplicationsContextValue | null>(null)

type BackendHistoryStatus =
  | 'CREATED'
  | 'READY_FOR_DRC'
  | 'DRC_GENERATED'
  | 'UTILIZATION_FINALIZED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'

interface BackendBlockchainHistoryItem {
  txId?: string
  timestamp?: string
  value?: {
    status?: string
    txId?: string
    hash?: string
    lastAction?: string
    updatedAt?: string
  }
}

interface BackendHistoryApplication {
  application_id?: string
  tdrApplicationId?: string
  rid?: string
  samagra_id?: string
  owner_name?: string
  district?: string
  tehsil?: string
  status?: BackendHistoryStatus | string
  total_tdr_value?: number
  transfer_tdr_value?: number
  utilized_tdr_value?: number
  remaining_tdr_value?: number
  total_area?: number
  proposed_area?: number
  utilized_area?: number
  remaining_area?: number
  transferred_area?: number
  createdAt?: string
  updatedAt?: string
  blockchain_history?: BackendBlockchainHistoryItem[]
}

interface BackendHistoryResponse {
  success?: boolean
  applications?: BackendHistoryApplication[]
}

function toApplicationStatus(status: string | undefined): TdrApplicationRecord['status'] {
  switch ((status ?? '').toUpperCase()) {
    case 'CREATED':
      return 'Draft'
    case 'SUBMITTED':
      return 'Pending'
    case 'READY_FOR_DRC':
    case 'UNDER_REVIEW':
      return 'Under Review'
    case 'DRC_GENERATED':
    case 'UTILIZATION_FINALIZED':
      return 'DRC Issued'
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Rejected'
    default:
      return 'Pending'
  }
}

function toCurrentLevel(status: string | undefined): string {
  const raw = status?.trim()
  if (!raw) return 'Workflow status unavailable'
  return raw
    .split('_')
    .map((part) => `${part.charAt(0)}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

function toAppliedOn(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10)
  return iso.slice(0, 10)
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return undefined
}

function mapHistoryAppToRecord(
  app: BackendHistoryApplication,
): TdrApplicationRecord {
  const id =
    app.application_id ??
    app.tdrApplicationId ??
    `TDR-${Date.now()}`

  const status = toApplicationStatus(app.status)

  const history = app.blockchain_history ?? []

  const latestHistory = history[history.length - 1]

  const raw = app as Record<string, unknown>

  // =========================
  // AREA VALUES
  // =========================

  const totalArea =
    pickNumber(app.total_area, raw.total_area) ?? 0

  const proposedArea =
    pickNumber(app.proposed_area, raw.proposed_area) ?? 0

  const transferredArea =
    pickNumber(app.transferred_area, raw.transferred_area) ?? 0

  const utilizedArea =
    pickNumber(app.utilized_area, raw.utilized_area) ?? 0

  // FRONTEND CALCULATED REMAINING AREA
  const remainingArea = Math.max(
    0,
    totalArea- (proposedArea + transferredArea + utilizedArea),
  )
console.log(remainingArea,"remainingArea");
console.log(proposedArea,"proposedArea");
console.log(transferredArea,"transferredArea");
console.log(utilizedArea,"utilizedArea");
  // =========================
  // TDR VALUES
  // =========================

  const totalTdr =
    pickNumber(
      app.total_tdr_value,
      raw.total_tdr_value,
    ) ?? 0

  const transferredTdr =
    pickNumber(
      app.transfer_tdr_value,
      raw.transfer_tdr_value,
      raw.transferred_tdr_value,
      raw.transferTdrValue,
    ) ?? 0

  const utilizedTdr =
    pickNumber(
      app.utilized_tdr_value,
      raw.utilized_tdr_value,
    ) ?? 0

  // FRONTEND CALCULATED REMAINING TDR
  const remainingTdr = Math.max(
    0,
    totalTdr - transferredTdr - utilizedTdr,
  )

  const rid = app.rid?.trim()

  const ownerSamagra =
    typeof app.samagra_id === 'string'
      ? app.samagra_id.trim()
      : ''

  return {
    id,

    ...(rid ? { rid } : {}),

    applicantName: app.owner_name ?? 'N/A',

    district: app.district ?? 'N/A',

    tehsil: app.tehsil ?? '-',

    khasraNo: app.rid ?? '-',

    landAreaSqM: totalArea,

    proposedAreaSqM: proposedArea,

    issuedAreaSqM: proposedArea,

    totalAreaSqM: totalArea,

    transferredAreaSqM: transferredArea,

    utilizedAreaSqM: utilizedArea,

    remainingAreaSqM: remainingArea,

    tdrAppId: app.tdrApplicationId ?? '-',

    tdrValueCr: totalTdr,

    transferredTdrValue: transferredTdr,

    utilizedTdrValue: utilizedTdr,

    remainingTdrValue: remainingTdr,

    status,

    currentLevel: toCurrentLevel(app.status),

    appliedOn: toAppliedOn(app.createdAt),

    samagraId: ownerSamagra || '-',

    mobile: '-',

    address: '-',

    landUse: 'N/A',

    village: app.district ?? '-',

    documents: {
      form3: 'N/A',
      mutation: 'N/A',
      landCertificate: 'N/A',
    },

    timeline: {
      dataEntry: {
        label: 'Data Entry',
        status:
          status === 'Draft'
            ? 'in_progress'
            : 'completed',
        date: app.createdAt
          ? new Date(app.createdAt).toLocaleString('en-IN')
          : undefined,
      },

      officerVerification: {
        label: 'Officer Verification',
        status:
          status === 'Draft' || status === 'Pending'
            ? 'pending'
            : 'completed',
        date: app.updatedAt
          ? new Date(app.updatedAt).toLocaleString('en-IN')
          : undefined,
      },

      authorityApproval: {
        label: 'Authority Approval',
        status:
          status === 'Rejected'
            ? 'rejected'
            : status === 'DRC Issued' ||
              status === 'Approved'
              ? 'completed'
              : 'pending',

        date: app.updatedAt
          ? new Date(app.updatedAt).toLocaleString('en-IN')
          : undefined,
      },
    },

    blockchain:
      latestHistory?.value?.hash &&
        latestHistory.value.txId
        ? {
          hash: latestHistory.value.hash,
          status:
            latestHistory.value.status ??
            'Recorded',
          txId: latestHistory.value.txId,
        }
        : null,

    officerActivityLog: history.map((h, idx) => ({
      id: `${id}-${h.txId ?? idx}`,

      at: h.timestamp
        ? new Date(h.timestamp).toLocaleString('en-IN')
        : 'N/A',

      actorName: 'Blockchain Service',

      actorRole: 'System',

      department: 'TDR Ledger',

      action:
        h.value?.lastAction ??
        'Blockchain update',

      fromStatus: h.value?.status ?? '—',

      toStatus: h.value?.status ?? '—',

      remarks: h.value?.hash
        ? `Hash: ${h.value.hash}`
        : undefined,

      channel: 'On-chain',
    })),
  }
}

export function TdrApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<TdrApplicationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadApplications = async () => {
      setIsLoading(true)
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (API_KEY) {
          headers['x-api-key'] = API_KEY
        }

        const res = await fetch(apiUrl('/api/tdr/history/applications'), { headers })
        if (!res.ok) return
        const data = (await res.json()) as BackendHistoryResponse
        const apiRows = data.applications ?? []
        if (!active || apiRows.length === 0) return
        setApplications(apiRows.map(mapHistoryAppToRecord))
      } catch {
        // Leave list empty when API is unavailable.
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadApplications()
    return () => {
      active = false
    }
  }, [])

  const approveApplication = useCallback((id: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        if (app.status === 'Rejected' || app.status === 'DRC Issued') return app
        return {
          ...app,
          status: 'Approved' as const,
          workflowStageId: 'drc_certificate',
          currentLevel: 'L3 — Approved · DRC / certificate generation pending',
          timeline: {
            ...app.timeline,
            dataEntry: { ...app.timeline.dataEntry, status: 'completed' as const },
            officerVerification: {
              ...app.timeline.officerVerification,
              status: 'completed' as const,
              date: app.timeline.officerVerification.date ?? new Date().toLocaleString('en-IN'),
            },
            authorityApproval: {
              ...app.timeline.authorityApproval,
              status: 'completed' as const,
              date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              remark: 'Approved via portal',
            },
          },
        }
      }),
    )
  }, [])

  const rejectApplication = useCallback((id: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        if (app.status === 'DRC Issued') return app
        return {
          ...app,
          status: 'Rejected' as const,
          workflowStageId: 'directorate_jd',
          currentLevel: 'Closed — rejected (Directorate JD)',
          timeline: {
            ...app.timeline,
            authorityApproval: {
              ...app.timeline.authorityApproval,
              status: 'rejected' as const,
              date: new Date().toLocaleString('en-IN'),
              remark: 'Rejected via portal',
            },
          },
        }
      }),
    )
  }, [])

  const generateDrc = useCallback((id: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app
        if (app.status === 'DRC Issued' || app.status !== 'Approved') return app
        const txId = `TX-DRC-${Date.now().toString(36).toUpperCase().slice(-8)}`
        return {
          ...app,
          status: 'DRC Issued' as const,
          workflowStageId: 'tdr_transfer_utilization',
          currentLevel: 'Completed — DRC issued; transfer / utilization open',
          drcIssuedOn: new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          blockchain: {
            hash: randomTx(),
            status: 'Anchored — Verified',
            txId,
          },
        }
      }),
    )
  }, [])

  const value = useMemo(
    () => ({ applications, isLoading, approveApplication, rejectApplication, generateDrc }),
    [applications, isLoading, approveApplication, rejectApplication, generateDrc],
  )

  return <TdrApplicationsContext.Provider value={value}>{children}</TdrApplicationsContext.Provider>
}

export function useTdrApplications() {
  const ctx = useContext(TdrApplicationsContext)
  if (!ctx) {
    throw new Error('useTdrApplications must be used within TdrApplicationsProvider')
  }
  return ctx
}
