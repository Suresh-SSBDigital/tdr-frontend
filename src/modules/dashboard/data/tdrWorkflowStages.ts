import type { TdrApplicationRecord, TimelineStep, TimelineStepStatus } from './tdrApplicationsData'

/**
 * End-to-end TDR lifecycle aligned with the statutory TCP workflow
 * (login / agency registration → district → directorate → commissioner → publication → agreement → DRC → utilization).
 * Mirrors the “status tracking / trm_application_status” style officer movement across gates.
 */
export type TdrWorkflowPhase =
  | 'intake'
  | 'district'
  | 'directorate'
  | 'commissioner'
  | 'publication'
  | 'agreement'
  | 'final'
  | 'certificate'
  | 'post_certificate'

export interface TdrWorkflowStageDef {
  id: string
  /** 0-based order in the full chain (submit → transfer) */
  order: number
  label: string
  shortLabel: string
  /** Who typically holds the file at this gate (officer role movement) */
  officerAtGate: string
  phase: TdrWorkflowPhase
  /** Shown in diagram as tied to central status tracking */
  statusTracking?: boolean
}

export const TDR_WORKFLOW_STAGES: readonly TdrWorkflowStageDef[] = [
  {
    id: 'login_agency',
    order: 0,
    label: 'User / Agency login',
    shortLabel: 'Login',
    officerAtGate: 'Portal authentication',
    phase: 'intake',
  },
  {
    id: 'agency_registration',
    order: 1,
    label: 'Implementing agency registration',
    shortLabel: 'Agency reg.',
    officerAtGate: 'ULB / Agency onboarding desk',
    phase: 'intake',
  },
  {
    id: 'tdr_request_entry',
    order: 2,
    label: 'TDR request entry',
    shortLabel: 'Request entry',
    officerAtGate: 'Applicant / implementing agency',
    phase: 'intake',
  },
  {
    id: 'form1_generation',
    order: 3,
    label: 'Form-1 generation',
    shortLabel: 'Form-1',
    officerAtGate: 'Data entry / system',
    phase: 'intake',
  },
  {
    id: 'district_draftsman',
    order: 4,
    label: 'District Draftsman check',
    shortLabel: 'Dist. Draftsman',
    officerAtGate: 'District Draftsman',
    phase: 'district',
  },
  {
    id: 'district_ad',
    order: 5,
    label: 'District AD check',
    shortLabel: 'Dist. AD',
    officerAtGate: 'Assistant Director (District)',
    phase: 'district',
  },
  {
    id: 'district_jd',
    order: 6,
    label: 'District JD check',
    shortLabel: 'Dist. JD',
    officerAtGate: 'Joint Director (District)',
    phase: 'district',
  },
  {
    id: 'directorate_dm',
    order: 7,
    label: 'Directorate DM check',
    shortLabel: 'Dir. DM',
    officerAtGate: 'Deputy Director (Directorate)',
    phase: 'directorate',
    statusTracking: true,
  },
  {
    id: 'directorate_ad',
    order: 8,
    label: 'Directorate AD check',
    shortLabel: 'Dir. AD',
    officerAtGate: 'Assistant Director (Directorate)',
    phase: 'directorate',
    statusTracking: true,
  },
  {
    id: 'directorate_jd',
    order: 9,
    label: 'Directorate JD check',
    shortLabel: 'Dir. JD',
    officerAtGate: 'Joint Director (Directorate)',
    phase: 'directorate',
    statusTracking: true,
  },
  {
    id: 'commissioner_initial',
    order: 10,
    label: 'Commissioner — initial approval',
    shortLabel: 'Comm. (initial)',
    officerAtGate: 'Commissioner, TCP / Authority',
    phase: 'commissioner',
    statusTracking: true,
  },
  {
    id: 'newspaper_publication',
    order: 11,
    label: 'Newspaper publication',
    shortLabel: 'Publication',
    officerAtGate: 'Publication desk / agency',
    phase: 'publication',
  },
  {
    id: 'objection_period',
    order: 12,
    label: '15-day objection period',
    shortLabel: 'Objections',
    officerAtGate: 'Objection cell / monitoring',
    phase: 'publication',
    statusTracking: true,
  },
  {
    id: 'agency_agreement_return',
    order: 13,
    label: 'Return to agency — agreement stage',
    shortLabel: 'Agency return',
    officerAtGate: 'Implementing agency',
    phase: 'agreement',
  },
  {
    id: 'owner_beneficiary_agreement',
    order: 14,
    label: 'Agreement with owner / beneficiary',
    shortLabel: 'Agreement',
    officerAtGate: 'Agreement verification officer',
    phase: 'agreement',
  },
  {
    id: 'district_reverification',
    order: 15,
    label: 'District re-verification',
    shortLabel: 'Dist. re-verify',
    officerAtGate: 'District JD / verification team',
    phase: 'final',
  },
  {
    id: 'commissioner_final',
    order: 16,
    label: 'Commissioner — final approval',
    shortLabel: 'Comm. (final)',
    officerAtGate: 'Commissioner, TCP / Authority',
    phase: 'final',
  },
  {
    id: 'drc_certificate',
    order: 17,
    label: 'DRC / TDR certificate generation',
    shortLabel: 'DRC issued',
    officerAtGate: 'Certificate / DRC issuing authority',
    phase: 'certificate',
  },
  {
    id: 'tdr_transfer_utilization',
    order: 18,
    label: 'TDR transfer / utilization',
    shortLabel: 'Transfer',
    officerAtGate: 'Registry / utilization desk',
    phase: 'post_certificate',
  },
] as const

export type TdrWorkflowStageId = (typeof TDR_WORKFLOW_STAGES)[number]['id']

const stageById = new Map(TDR_WORKFLOW_STAGES.map((s) => [s.id, s]))

export function getWorkflowStageById(id: string): TdrWorkflowStageDef | undefined {
  return stageById.get(id)
}

export function getWorkflowStageIndex(id: string): number {
  const s = stageById.get(id)
  return s?.order ?? 0
}

export function resolveWorkflowStageId(app: { status: string; workflowStageId?: string }): string {
  if (app.workflowStageId) return app.workflowStageId
  switch (app.status) {
    case 'Draft':
      return 'tdr_request_entry'
    case 'Pending':
      return 'district_draftsman'
    case 'Under Review':
      return 'directorate_dm'
    case 'Approved':
      return 'drc_certificate'
    case 'Rejected':
      return 'directorate_jd'
    case 'DRC Issued':
      return 'tdr_transfer_utilization'
    default:
      return 'form1_generation'
  }
}

/** Progress toward DRC certificate (steps 0–17). */
export function getWorkflowProgressToDrc(currentStageId: string) {
  const idxInFull = getWorkflowStageIndex(currentStageId)
  const drcOrder = TDR_WORKFLOW_STAGES.find((s) => s.id === 'drc_certificate')?.order ?? 17
  const clamped = Math.min(idxInFull, drcOrder)
  const stepsTotal = drcOrder + 1
  const pct = stepsTotal > 1 ? Math.round((clamped / drcOrder) * 100) : 0
  return {
    currentStepNumber: Math.min(clamped + 1, stepsTotal),
    stepsTotal,
    percentTowardDrc: Math.min(100, pct),
    currentStageOrder: idxInFull,
  }
}

const DRC_CERT_ORDER = TDR_WORKFLOW_STAGES.find((s) => s.id === 'drc_certificate')?.order ?? 17

/** Sparse dates from this application’s summary timeline (full gate list uses statutory stages). */
function statutoryGateDate(stageId: string, app: TdrApplicationRecord): string | undefined {
  const { timeline } = app
  switch (stageId) {
    case 'form1_generation':
      return timeline.dataEntry.date
    case 'district_jd':
      return timeline.officerVerification.date
    case 'directorate_dm':
    case 'directorate_ad':
      return timeline.officerVerification.date
    case 'directorate_jd':
      return timeline.authorityApproval.date
    case 'commissioner_initial':
    case 'commissioner_final':
      return timeline.authorityApproval.date
    case 'drc_certificate':
      return app.drcIssuedOn ?? undefined
    case 'tdr_transfer_utilization':
      return app.drcIssuedOn
    default:
      return undefined
  }
}

function gateStatusForOrder(stageOrder: number, currentIdx: number, app: TdrApplicationRecord): TimelineStepStatus {
  if (stageOrder < currentIdx) return 'completed'
  if (stageOrder > currentIdx) return 'pending'
  if (app.status === 'Rejected') return 'rejected'
  if (app.status === 'DRC Issued') return 'completed'
  return 'in_progress'
}

/** Fee step is modeled after commissioner final clearance and before DRC generation in this demo. */
function feeRemittanceStep(app: TdrApplicationRecord, currentIdx: number): TimelineStep {
  const fs = app.details?.feeStatus?.toLowerCase() ?? ''
  const feeRecordedPaid = fs.includes('received') || fs.includes('paid') || fs.includes('cleared')

  let status: TimelineStepStatus
  if (app.status === 'DRC Issued') status = 'completed'
  else if (feeRecordedPaid && currentIdx >= 15) status = 'completed'
  else if (app.status === 'Approved' && currentIdx >= DRC_CERT_ORDER) status = feeRecordedPaid ? 'completed' : 'in_progress'
  else if (currentIdx >= DRC_CERT_ORDER) status = 'completed'
  else status = 'pending'

  const remarkParts = app.details
    ? [`${app.details.feeStatus}`, app.details.paymentRef ? `Ref ${app.details.paymentRef}` : null].filter(Boolean)
    : []
  return {
    label: 'Fee remittance & GRAS confirmation',
    status,
    officer: 'Treasury / ULB accounts desk',
    remark:
      remarkParts.length > 0 ? remarkParts.join(' · ') : 'Government receipt / bank reconciliation before DRC issuance.',
    date: app.details?.lastUpdatedOn,
  }
}

/**
 * Full statutory gate sequence for the approval timeline (same ordering as `TDR_WORKFLOW_STAGES`),
 * plus one demo row for fee settlement before certificate generation.
 */
export function buildStatutoryApprovalTimeline(app: TdrApplicationRecord): TimelineStep[] {
  const wfId = resolveWorkflowStageId(app)
  const currentIdx = getWorkflowStageIndex(wfId)
  const rows: TimelineStep[] = []

  for (const stage of TDR_WORKFLOW_STAGES) {
    let remark: string | undefined
    if (stage.statusTracking) remark = 'Mirrors central status / audit table'
    if (stage.id === 'tdr_transfer_utilization' && app.blockchain?.txId) {
      const tx = `Anchored · ${app.blockchain.txId}`
      remark = remark ? `${remark} · ${tx}` : tx
    }

    rows.push({
      label: stage.label,
      status: gateStatusForOrder(stage.order, currentIdx, app),
      officer: stage.officerAtGate,
      date: statutoryGateDate(stage.id, app),
      remark,
    })

    if (stage.id === 'commissioner_final') {
      rows.push(feeRemittanceStep(app, currentIdx))
    }
  }

  return rows
}

export function phaseLabel(phase: TdrWorkflowPhase): string {
  const map: Record<TdrWorkflowPhase, string> = {
    intake: 'Intake & Form-1',
    district: 'District level',
    directorate: 'Directorate level',
    commissioner: 'Commissioner',
    publication: 'Publication & objections',
    agreement: 'Agreement',
    final: 'Final verification',
    certificate: 'DRC / Certificate',
    post_certificate: 'Post DRC',
  }
  return map[phase]
}
