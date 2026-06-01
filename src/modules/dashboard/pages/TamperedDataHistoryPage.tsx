import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiAlertTriangle, FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface AlertDetailSnapshot {
  alertId: string
  certificateId: string
  applicationId: string
  userName: string
  userId: string
  recordType: string
  tamperType: string
  severity: 'High' | 'Medium' | 'Low'
  status: 'Detected' | 'Under Review' | 'Resolved'
  detectedOn: string
  detectedBy: string
  blockchainStatus: 'Mismatch Detected' | 'Matched'
  remarks: string
  changedField: string
  originalArea: string
  currentArea: string
  surveyNumber: string
  khasraNumber: string
  landType: string
  location: string
  txHash: string
  blockNumber: string
  timestamp: string
}

interface TimelineRow {
  date: string
  title: string
  description: string
  actorTag: string
  tone: 'danger' | 'warning' | 'info' | 'success'
}

type ChangeSource = 'Off-chain registry' | 'On-chain (expected)' | 'Document store' | 'System'

interface ChangeLogRow {
  id: string
  changedOn: string
  changedBy: string
  field: string
  from: string
  to: string
  source: ChangeSource
  module?: string
  ipAddress?: string
  device?: string
  remarks?: string
}

interface AuditStepRow {
  id: string
  step: string
  when: string
  who: string
  where: string
  detail: string
  outcome: 'ok' | 'changed' | 'detected' | 'review'
  compareField?: string
  compareFrom?: string
  compareTo?: string
  detailSource?: ChangeSource
  detailModule?: string
  detailIp?: string
  detailDevice?: string
  detailRemark?: string
}
type TabId = 'overview' | 'comparison' | 'trace' | 'history' | 'related' | 'documents'

const DATA_BY_RECORD: Record<string, AlertDetailSnapshot> = {
  'APP-2025-47180': {
    alertId: 'ALT-2026-0008',
    certificateId: 'DRC-2026-000125',
    applicationId: 'APP-2025-47180',
    userName: 'Ramesh Kumar',
    userId: 'USR-2026-0456',
    recordType: 'Land Details',
    tamperType: 'Data Modified',
    severity: 'High',
    status: 'Detected',
    detectedOn: '05 May 2026, 11:45 AM',
    detectedBy: 'Blockchain Validation Engine',
    blockchainStatus: 'Mismatch Detected',
    remarks: 'Land area value was modified from original record.',
    changedField: 'Land Area',
    originalArea: '1000.00 sq.m',
    currentArea: '1500.00 sq.m',
    surveyNumber: '123/2',
    khasraNumber: '456',
    landType: 'Agricultural',
    location: 'Village Rampur, District Gaya',
    txHash: '0x9f32afb2c64a7e9f8a1b2c3d4e5f67890abcd1234',
    blockNumber: '105681',
    timestamp: '05 May 2026, 10:32:45 AM',
  },
  'APP-2026-45140': {
    alertId: 'ALT-2026-0007',
    certificateId: 'DRC-2026-000124',
    applicationId: 'APP-2026-45140',
    userName: 'Anil Patidar',
    userId: 'USR-4419',
    recordType: 'Owner Details',
    tamperType: 'Value Changed',
    severity: 'Medium',
    status: 'Under Review',
    detectedOn: '05 May 2026, 09:45 AM',
    detectedBy: 'Ownership Validation Engine',
    blockchainStatus: 'Mismatch Detected',
    remarks: 'Owner linkage mismatch found between on-chain and current record.',
    changedField: 'Owner Name',
    originalArea: 'Anil Kumar Patidar',
    currentArea: 'Anil K. Patidar',
    surveyNumber: '210/1',
    khasraNumber: '211/2',
    landType: 'Residential',
    location: 'Village Kolar, District Bhopal',
    txHash: '0x4ad22be9fbd4a2f8e90129d6a871cc0eabc45677',
    blockNumber: '105679',
    timestamp: '05 May 2026, 09:31:18 AM',
  },
  'APP-2024-39812': {
    alertId: 'ALT-2026-0006',
    certificateId: 'DRC-2024-007700',
    applicationId: 'APP-2024-39812',
    userName: 'Vasu Jhawar',
    userId: 'USR-2355',
    recordType: 'Area Details',
    tamperType: 'Data Modified',
    severity: 'Low',
    status: 'Resolved',
    detectedOn: '04 May 2026, 06:05 PM',
    detectedBy: 'Historic Chain Reconciler',
    blockchainStatus: 'Matched',
    remarks: 'Historic hash mismatch corrected and reconciled.',
    changedField: 'Historic Tx Hash',
    originalArea: '0xEDIT39812A',
    currentArea: '0xEDIT39812A',
    surveyNumber: '98/4',
    khasraNumber: '99/1',
    landType: 'Commercial',
    location: 'Village Ujjain, District Ujjain',
    txHash: '0x7b4512ea11ea2d79fca2237cbf04dc27ab114011',
    blockNumber: '104210',
    timestamp: '04 May 2026, 05:42:09 PM',
  },
  'APP-2025-47001': {
    alertId: 'ALT-2026-0005',
    certificateId: 'DRC-2025-000119',
    applicationId: 'APP-2025-47001',
    userName: 'Pooja Verma',
    userId: 'USR-8842',
    recordType: 'Land Details',
    tamperType: 'File Tampered',
    severity: 'Medium',
    status: 'Under Review',
    detectedOn: '04 May 2026, 03:10 PM',
    detectedBy: 'Document Signature Validator',
    blockchainStatus: 'Mismatch Detected',
    remarks: 'Document checksum differs from blockchain notarized digest.',
    changedField: 'Supporting Document Hash',
    originalArea: 'SHA256:a13f...9cde',
    currentArea: 'SHA256:bb90...11fa',
    surveyNumber: '155/1',
    khasraNumber: '156/3',
    landType: 'Residential',
    location: 'Village Karond, District Bhopal',
    txHash: '0x2f8821aa0ed8b99cf5108e4f4eac7766cb8ee10d',
    blockNumber: '105544',
    timestamp: '04 May 2026, 02:55:54 PM',
  },
}

const TIMELINE_BY_RECORD: Record<string, TimelineRow[]> = {
  'APP-2025-47180': [
    {
      date: '05 May 2026, 11:45 AM',
      title: 'Tampering Detected',
      description: 'System detected data mismatch in Land Area field.',
      actorTag: 'System',
      tone: 'danger',
    },
    {
      date: '05 May 2026, 10:32 AM',
      title: 'Record Modified',
      description: 'Land area updated from 1000.00 sq.m to 1500.00 sq.m.',
      actorTag: 'Ramesh Kumar (USR-2026-0456)',
      tone: 'warning',
    },
    {
      date: '03 May 2026, 02:15 PM',
      title: 'Record Approved',
      description: 'Record approved and written to blockchain.',
      actorTag: 'Authority (AUTH-2026-00123)',
      tone: 'info',
    },
    {
      date: '01 May 2026, 09:10 AM',
      title: 'Record Created',
      description: 'Original record submitted.',
      actorTag: 'Ramesh Kumar (USR-2026-0456)',
      tone: 'success',
    },
  ],
  'APP-2026-45140': [
    {
      date: '05 May 2026, 09:45 AM',
      title: 'Owner Mismatch Detected',
      description: 'System found mismatch in owner linkage value.',
      actorTag: 'System',
      tone: 'warning',
    },
    {
      date: '05 May 2026, 09:31 AM',
      title: 'Record Modified',
      description: 'Owner value updated in off-chain registry.',
      actorTag: 'Transfer Desk',
      tone: 'info',
    },
    {
      date: '04 May 2026, 05:00 PM',
      title: 'Record Approved',
      description: 'Ownership mapping approved by officer.',
      actorTag: 'Authority',
      tone: 'success',
    },
  ],
  'APP-2024-39812': [
    {
      date: '04 May 2026, 06:05 PM',
      title: 'Historic Hash Reconciled',
      description: 'Historic mismatch corrected and marked resolved.',
      actorTag: 'Audit Engine',
      tone: 'success',
    },
    {
      date: '04 May 2026, 05:22 PM',
      title: 'Historic Mismatch Found',
      description: 'Historic edit hash did not match expected chain entry.',
      actorTag: 'System',
      tone: 'warning',
    },
  ],
  'APP-2025-47001': [
    {
      date: '04 May 2026, 03:10 PM',
      title: 'Document Tamper Alert',
      description: 'Supporting document hash mismatch detected.',
      actorTag: 'System',
      tone: 'danger',
    },
    {
      date: '04 May 2026, 02:55 PM',
      title: 'Document Uploaded',
      description: 'Updated document uploaded in portal.',
      actorTag: 'Pooja Verma',
      tone: 'info',
    },
    {
      date: '03 May 2026, 11:12 AM',
      title: 'Record Created',
      description: 'Base record initially created.',
      actorTag: 'Portal',
      tone: 'success',
    },
  ],
}

const CHANGELOG_BY_RECORD: Record<string, ChangeLogRow[]> = {
  'APP-2025-47180': [
    {
      id: 'CHG-47180-01',
      changedOn: '05 May 2026, 10:32 AM',
      changedBy: 'Ramesh Kumar (USR-2026-0456)',
      field: 'Land Area',
      from: '1000.00 sq.m',
      to: '1500.00 sq.m',
      source: 'Off-chain registry',
      remarks: 'Manual edit recorded in land module.',
    },
    {
      id: 'CHG-47180-02',
      changedOn: '05 May 2026, 10:33 AM',
      changedBy: 'System',
      field: 'Blockchain Validation',
      from: 'Matched',
      to: 'Mismatch Detected',
      source: 'System',
      remarks: 'Computed hash mismatch from chain anchor.',
    },
  ],
  'APP-2026-45140': [
    {
      id: 'CHG-45140-01',
      changedOn: '05 May 2026, 09:31 AM',
      changedBy: 'Transfer Desk',
      field: 'Owner Name',
      from: 'Anil Kumar Patidar',
      to: 'Anil K. Patidar',
      source: 'Off-chain registry',
      module: 'Ownership Registry',
      ipAddress: '10.44.12.91',
      device: 'Desk-TRF-07',
      remarks: 'Owner value updated in off-chain registry.',
    },
    {
      id: 'CHG-45140-02',
      changedOn: '05 May 2026, 09:45 AM',
      changedBy: 'Ownership Validation Engine',
      field: 'Owner Linkage',
      from: 'Matched',
      to: 'Mismatch Detected',
      source: 'System',
      module: 'Ownership Validation',
      ipAddress: '172.16.8.15',
      device: 'validator-node-2',
      remarks: 'Linkage mismatch between on-chain and off-chain owner mapping.',
    },
  ],
  'APP-2024-39812': [
    {
      id: 'CHG-39812-01',
      changedOn: '04 May 2026, 05:22 PM',
      changedBy: 'System',
      field: 'Historic Tx Hash',
      from: '0xEDIT39812A',
      to: '0xEDIT39812A',
      source: 'On-chain (expected)',
      remarks: 'Mismatch found in historic chain entry.',
    },
    {
      id: 'CHG-39812-02',
      changedOn: '04 May 2026, 06:05 PM',
      changedBy: 'Audit Engine',
      field: 'Historic Reconciliation',
      from: 'Under Review',
      to: 'Resolved',
      source: 'System',
      remarks: 'Marked resolved after reconciliation.',
    },
  ],
  'APP-2025-47001': [
    {
      id: 'CHG-47001-01',
      changedOn: '04 May 2026, 02:55 PM',
      changedBy: 'Pooja Verma',
      field: 'Supporting Document Hash',
      from: 'SHA256:a13f...9cde',
      to: 'SHA256:bb90...11fa',
      source: 'Document store',
      remarks: 'Updated document uploaded in portal.',
    },
    {
      id: 'CHG-47001-02',
      changedOn: '04 May 2026, 03:10 PM',
      changedBy: 'System',
      field: 'Document Signature Validation',
      from: 'Matched',
      to: 'Mismatch Detected',
      source: 'System',
      remarks: 'Checksum differs from blockchain notarized digest.',
    },
  ],
}

const TAB_ITEMS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'comparison', label: 'Data Comparison' },
  // { id: 'trace', label: 'Blockchain Trace' },
  { id: 'history', label: 'Change History' },
  { id: 'related', label: 'User Tamper Records' },
  { id: 'documents', label: 'Documents' },
]

function statusTone(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('detected') || s.includes('mismatch')) return 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'
  if (s.includes('review')) return 'border-[#ffe58f] bg-[#fffbe6] text-[#ad6800]'
  return 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
}

function timelineDot(tone: TimelineRow['tone']): string {
  if (tone === 'danger') return 'bg-[#ff4d4f]'
  if (tone === 'warning') return 'bg-[#faad14]'
  if (tone === 'info') return 'bg-[#1890ff]'
  return 'bg-[#52c41a]'
}

function sourceTone(source: ChangeSource): string {
  if (source === 'Off-chain registry') return 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]'
  if (source === 'On-chain (expected)') return 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
  if (source === 'Document store') return 'border-[#ffd591] bg-[#fff7e6] text-[#ad6800]'
  return 'border-[#d9d9d9] bg-[#fafafa] text-[#595959]'
}

function stepTone(outcome: AuditStepRow['outcome']): string {
  if (outcome === 'ok') return 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
  if (outcome === 'changed') return 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]'
  if (outcome === 'detected') return 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'
  return 'border-[#ffe58f] bg-[#fffbe6] text-[#ad6800]'
}

function parseLongDate(raw: string): number {
  // Example: "05 May 2026, 09:31 AM"
  const m = String(raw ?? '').match(/^(\d{2})\s+([A-Za-z]{3})\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/)
  if (!m) return 0
  const [, dd, mon, yyyy, hh, mm, ap] = m
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  const month = months[mon] ?? 0
  let h = Number(hh)
  if (ap === 'PM' && h < 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return new Date(Number(yyyy), month, Number(dd), h, Number(mm)).getTime()
}

export default function TamperedDataHistoryPage() {
  const { recordId } = useParams()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [changeQuery, setChangeQuery] = useState('')
  const [changeSort, setChangeSort] = useState<'field_az' | 'field_za' | 'date_new' | 'date_old'>('date_new')
  const [openStepId, setOpenStepId] = useState<string | null>(null)
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null)
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const key = recordId ? decodeURIComponent(recordId) : ''
  const snap = DATA_BY_RECORD[key] ?? {
    alertId: 'ALT-2026-XXXX',
    certificateId: 'DRC-XXXX',
    applicationId: key || 'N/A',
    userName: 'Unknown User',
    userId: 'N/A',
    recordType: 'Unknown',
    tamperType: 'Unknown',
    severity: 'Medium',
    status: 'Under Review',
    detectedOn: 'N/A',
    detectedBy: 'N/A',
    blockchainStatus: 'Mismatch Detected',
    remarks: 'No dataset found for this record.',
    changedField: 'Unknown',
    originalArea: 'N/A',
    currentArea: 'N/A',
    surveyNumber: 'N/A',
    khasraNumber: 'N/A',
    landType: 'N/A',
    location: 'N/A',
    txHash: 'N/A',
    blockNumber: 'N/A',
    timestamp: 'N/A',
  }
  const timeline = TIMELINE_BY_RECORD[key] ?? []
  const changelogBase = CHANGELOG_BY_RECORD[key] ?? []
  const changelog = useMemo(() => {
    const q = changeQuery.trim().toLowerCase()
    let list = changelogBase.filter((c) => {
      if (!q) return true
      return (
        c.field.toLowerCase().includes(q) ||
        c.changedBy.toLowerCase().includes(q) ||
        c.from.toLowerCase().includes(q) ||
        c.to.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q) ||
        (c.remarks ? c.remarks.toLowerCase().includes(q) : false)
      )
    })
    list = [...list].sort((a, b) => {
      if (changeSort === 'field_az') return a.field.localeCompare(b.field)
      if (changeSort === 'field_za') return b.field.localeCompare(a.field)
      if (changeSort === 'date_new') return parseLongDate(b.changedOn) - parseLongDate(a.changedOn)
      return parseLongDate(a.changedOn) - parseLongDate(b.changedOn)
    })
    return list
  }, [changelogBase, changeQuery, changeSort])
  const tamperComparisons = useMemo(() => {
    return [...changelogBase]
      .filter((c) => c.from !== c.to || c.to.toLowerCase().includes('mismatch'))
      .sort((a, b) => parseLongDate(b.changedOn) - parseLongDate(a.changedOn))
  }, [changelogBase])
  const changeSummary = useMemo(() => {
    const sortedByDate = [...changelogBase].sort((a, b) => parseLongDate(a.changedOn) - parseLongDate(b.changedOn))
    const first = sortedByDate[0] ?? null
    const latest = sortedByDate[sortedByDate.length - 1] ?? null
    const uniqueActors = new Set(changelogBase.map((c) => c.changedBy)).size
    const uniqueFields = new Set(changelogBase.map((c) => c.field)).size
    const mutatedRows = changelogBase.filter((c) => c.from !== c.to).length
    return { first, latest, uniqueActors, uniqueFields, mutatedRows }
  }, [changelogBase])
  const auditSteps = useMemo<AuditStepRow[]>(() => {
    const sortedChanges = [...changelogBase].sort((a, b) => parseLongDate(a.changedOn) - parseLongDate(b.changedOn))
    const firstChange = sortedChanges[0]
    const latestChange = sortedChanges[sortedChanges.length - 1]
    const latestMismatch = tamperComparisons[0]
    const out: AuditStepRow[] = [
      {
        id: 'step-1',
        step: '1. Baseline On-Chain Snapshot',
        when: snap.timestamp,
        who: 'Blockchain Anchor',
        where: `Block ${snap.blockNumber}`,
        detail: `Expected baseline saved for ${snap.changedField}.`,
        outcome: 'ok',
      },
      {
        id: 'step-2',
        step: '2. Off-Chain Update Captured',
        when: firstChange?.changedOn ?? 'N/A',
        who: firstChange?.changedBy ?? 'N/A',
        where: firstChange?.module ?? firstChange?.source ?? 'N/A',
        detail: firstChange ? `${firstChange.field}: ${firstChange.from} → ${firstChange.to}` : 'No change rows available.',
        outcome: 'changed',
        compareField: firstChange?.field,
        compareFrom: firstChange?.from,
        compareTo: firstChange?.to,
        detailSource: firstChange?.source,
        detailModule: firstChange?.module,
        detailIp: firstChange?.ipAddress,
        detailDevice: firstChange?.device,
        detailRemark: firstChange?.remarks,
      },
      {
        id: 'step-3',
        step: '3. Validation / Reconciliation Run',
        when: snap.detectedOn,
        who: snap.detectedBy,
        where: 'Validation Engine',
        detail: `Compared on-chain baseline against latest off-chain state for ${snap.applicationId}.`,
        outcome: snap.blockchainStatus === 'Matched' ? 'ok' : 'detected',
      },
      {
        id: 'step-4',
        step: '4. Tamper Detection Decision',
        when: snap.detectedOn,
        who: 'Tamper Detection System',
        where: snap.recordType,
        detail:
          snap.blockchainStatus === 'Matched'
            ? 'No active tamper mismatch after comparison.'
            : `Mismatch detected in ${snap.changedField}.`,
        outcome: snap.blockchainStatus === 'Matched' ? 'ok' : 'detected',
        compareField: latestMismatch?.field ?? snap.changedField,
        compareFrom: latestMismatch?.from ?? snap.originalArea,
        compareTo: latestMismatch?.to ?? snap.currentArea,
        detailSource: latestMismatch?.source,
        detailModule: latestMismatch?.module,
        detailIp: latestMismatch?.ipAddress,
        detailDevice: latestMismatch?.device,
        detailRemark: latestMismatch?.remarks ?? snap.remarks,
      },
      {
        id: 'step-5',
        step: '5. Current Review Status',
        when: latestChange?.changedOn ?? snap.detectedOn,
        who: latestChange?.changedBy ?? snap.detectedBy,
        where: latestChange?.module ?? latestChange?.source ?? 'Review Desk',
        detail: `Case is currently "${snap.status}". ${snap.remarks}`,
        outcome: snap.status === 'Resolved' ? 'ok' : 'review',
        detailSource: latestChange?.source,
        detailModule: latestChange?.module,
        detailIp: latestChange?.ipAddress,
        detailDevice: latestChange?.device,
        detailRemark: latestChange?.remarks ?? snap.remarks,
      },
    ]
    return out
  }, [changelogBase, snap, tamperComparisons])
  const userTamperRecords = useMemo(() => {
    const rows = Object.values(DATA_BY_RECORD)
      .filter((row) => row.userId === snap.userId)
      .sort((a, b) => parseLongDate(b.detectedOn) - parseLongDate(a.detectedOn))
    const total = rows.length
    const detectedCount = rows.filter((row) => row.status === 'Detected').length
    const reviewCount = rows.filter((row) => row.status === 'Under Review').length
    const resolvedCount = rows.filter((row) => row.status === 'Resolved').length
    return { rows, total, detectedCount, reviewCount, resolvedCount }
  }, [snap.userId])
  const documents = useMemo(
    () => [
      { id: 'DOC-01', name: 'Land Survey Report', file: `${snap.applicationId}-survey.pdf`, status: 'Verified' },
      { id: 'DOC-02', name: 'Transfer Deed', file: `${snap.applicationId}-transfer.pdf`, status: 'Tampered' },
      { id: 'DOC-03', name: 'Owner KYC', file: `${snap.applicationId}-kyc.pdf`, status: 'Under Review' },
    ],
    [snap.applicationId],
  )

  const resolveStepFromChange = (row: ChangeLogRow): 'step-2' | 'step-4' => {
    const text = `${row.field} ${row.from} ${row.to} ${row.remarks ?? ''}`.toLowerCase()
    if (text.includes('mismatch') || text.includes('tamper') || text.includes('validation')) return 'step-4'
    return 'step-2'
  }

  const jumpToStep = (stepId: 'step-2' | 'step-4') => {
    setOpenStepId(stepId)
    setFocusedStepId(stepId)
    const target = stepRefs.current[stepId]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => {
      setFocusedStepId((prev) => (prev === stepId ? null : prev))
    }, 1800)
  }

  return (
    <div className='space-y-4'>
      <section className='rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm'>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <p className='text-xs text-[#8c8c8c]'>Tamper Alerts / Alert Details</p>
          <Link
            to='/dashboard/tampered-data'
            className='inline-flex items-center rounded border border-[#d9d9d9] px-3 py-1.5 text-xs font-medium text-[#262626] hover:bg-[#fafafa]'
          >
            Back to Alerts
          </Link>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='text-2xl font-semibold text-[#262626]'>Tamper Alert Details</h1>
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTone(snap.status)}`}>
            {snap.status}
          </span>
        </div>
        <p className='mt-1 text-sm text-[#8c8c8c]'>Detailed view of tampered or suspicious record.</p>

        <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'>
          <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
            <p className='text-xs text-[#8c8c8c]'>Alert ID</p>
            <p className='mt-1 text-sm font-semibold text-[#262626]'>{snap.alertId}</p>
            <p className='text-xs text-[#8c8c8c]'>Detected on {snap.detectedOn}</p>
          </div>
          <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
            <p className='text-xs text-[#8c8c8c]'>Certificate ID</p>
            <p className='mt-1 text-sm font-semibold text-[#262626]'>{snap.certificateId}</p>
            <p className='text-xs text-[#8c8c8c]'>Application ID {snap.applicationId}</p>
          </div>
          <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
            <p className='text-xs text-[#8c8c8c]'>User Name</p>
            <p className='mt-1 text-sm font-semibold text-[#262626]'>{snap.userName}</p>
            <p className='text-xs text-[#8c8c8c]'>User ID {snap.userId}</p>
          </div>
          <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
            <p className='text-xs text-[#8c8c8c]'>Record Type</p>
            <p className='mt-1 text-sm font-semibold text-[#262626]'>{snap.recordType}</p>
            <p className='text-xs text-[#8c8c8c]'>Tamper Type {snap.tamperType}</p>
          </div>
          <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
            <p className='text-xs text-[#8c8c8c]'>Severity</p>
            <p className='mt-1 text-sm font-semibold text-[#a8071a]'>{snap.severity}</p>
            <p className='text-xs text-[#8c8c8c]'>Status {snap.status}</p>
          </div>
        </div>
      </section>

      <section className='rounded-xl border border-[#e8e8e8] bg-white p-0 shadow-sm'>
        <div className='flex flex-wrap gap-1 border-b border-[#f0f0f0] px-3 py-2'>
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`rounded px-2.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#ff4d4f] text-[#ff4d4f]'
                  : 'text-[#595959] hover:bg-[#fafafa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={`grid grid-cols-1 gap-4 p-4 ${
            activeTab === 'history' ? '' : 'xl:grid-cols-3'
          }`}
        >
          <div className='space-y-4 xl:col-span-2'>
            {activeTab === 'overview' ? (
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <div className='rounded-lg border border-[#f0f0f0] p-3'>
                <h3 className='mb-2 text-sm font-semibold text-[#262626]'>Alert Overview</h3>
                <div className='space-y-1 text-sm'>
                  <p><span className='text-[#8c8c8c]'>Detected On: </span>{snap.detectedOn}</p>
                  <p><span className='text-[#8c8c8c]'>Detected By: </span>{snap.detectedBy}</p>
                  <p><span className='text-[#8c8c8c]'>Tamper Type: </span>{snap.tamperType}</p>
                  <p><span className='text-[#8c8c8c]'>Severity: </span><span className='text-[#a8071a]'>{snap.severity}</span></p>
                  <p><span className='text-[#8c8c8c]'>Blockchain Status: </span><span className='text-[#a8071a]'>{snap.blockchainStatus}</span></p>
                  <p><span className='text-[#8c8c8c]'>Remarks: </span>{snap.remarks}</p>
                </div>
              </div>
              <div className='rounded-lg border border-[#ffccc7] bg-[#fff7f7] p-3'>
                <h3 className='mb-2 inline-flex items-center gap-1 text-sm font-semibold text-[#a8071a]'>
                  <FiAlertTriangle className='h-4 w-4' /> Tamper Summary
                </h3>
                <p className='text-sm text-[#262626]'>Mismatch found in {snap.changedField} field</p>
                <div className='mt-2 space-y-1 text-sm'>
                  <p><span className='text-[#8c8c8c]'>Original Value: </span><strong className='text-[#237804]'>{snap.originalArea}</strong></p>
                  <p><span className='text-[#8c8c8c]'>Current Value: </span><strong className='text-[#a8071a]'>{snap.currentArea}</strong></p>
                  <p><span className='text-[#8c8c8c]'>Difference: </span><strong className='text-[#a8071a]'>Expected vs Current mismatch</strong></p>
                </div>
              </div>
            </div>
            ) : null}

            {activeTab === 'comparison' || activeTab === 'overview' ? (
            <div className='rounded-lg border border-[#f0f0f0] p-3'>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Data Comparison</h3>
              <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                <div className='rounded-md border border-[#b7eb8f] bg-[#f6ffed] p-3'>
                  <p className='text-xs font-semibold text-[#237804]'>Original Data (On Chain)</p>
                  <p className='mt-1 text-sm'>Survey Number: {snap.surveyNumber}</p>
                  <p className='text-sm'>Khasra Number: {snap.khasraNumber}</p>
                  <p className='text-sm text-[#237804]'>Land Area: {snap.originalArea}</p>
                  <p className='text-sm'>Land Type: {snap.landType}</p>
                  <p className='text-sm'>Location: {snap.location}</p>
                </div>
                <div className='rounded-md border border-[#ffccc7] bg-[#fff1f0] p-3'>
                  <p className='text-xs font-semibold text-[#a8071a]'>Current Data (Off Chain)</p>
                  <p className='mt-1 text-sm'>Survey Number: {snap.surveyNumber}</p>
                  <p className='text-sm'>Khasra Number: {snap.khasraNumber}</p>
                  <p className='text-sm text-[#a8071a]'>Land Area: {snap.currentArea}</p>
                  <p className='text-sm'>Land Type: {snap.landType}</p>
                  <p className='text-sm'>Location: {snap.location}</p>
                </div>
              </div>
            </div>
            ) : null}

            {/* {activeTab === 'trace' || activeTab === 'overview' ? (
            <div className='rounded-lg border border-[#f0f0f0] p-3'>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Blockchain Trace</h3>
              <div className='mb-3 grid grid-cols-1 gap-2 md:grid-cols-4'>
                <div className='rounded border border-[#d9d9d9] bg-[#fafafa] p-2 text-center text-xs'>Block #105678<br />Previous Hash<br />0010...3f5d</div>
                <div className='rounded border border-[#91d5ff] bg-[#e6f7ff] p-2 text-center text-xs'>Block #105679<br />Tx Hash<br />0x8d7...9bcd</div>
                <div className='rounded border border-[#d9d9d9] bg-[#fafafa] p-2 text-center text-xs'>Block #105680<br />Tx Hash<br />0x76b...7ef1</div>
                <div className='rounded border border-[#ffccc7] bg-[#fff1f0] p-2 text-center text-xs text-[#a8071a]'>Block #105681 (Tamper)<br />Tx Hash<br />0x932...ab21</div>
              </div>
              <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                <div className='text-sm'>
                  <p><span className='text-[#8c8c8c]'>Transaction Hash: </span><span className='font-mono text-xs'>{snap.txHash}</span></p>
                  <p><span className='text-[#8c8c8c]'>Block Number: </span>{snap.blockNumber}</p>
                  <p><span className='text-[#8c8c8c]'>Timestamp: </span>{snap.timestamp}</p>
                </div>
                <div className='text-sm'>
                  <p><span className='text-[#8c8c8c]'>Smart Contract: </span>DRCManagement.sol</p>
                  <p><span className='text-[#8c8c8c]'>Network: </span>TDR Private Chain</p>
                  <p><span className='text-[#8c8c8c]'>Validation Status: </span><span className='font-semibold text-[#a8071a]'>Mismatch Detected</span></p>
                </div>
              </div>
              <button className='mt-3 inline-flex items-center gap-1 rounded border border-[#1890ff] px-2 py-1 text-xs font-medium text-[#1890ff] hover:bg-[#e6f7ff]'>
                View on Blockchain Explorer <FiExternalLink className='h-3.5 w-3.5' />
              </button>
            </div>
            ) : null} */}

            {activeTab === 'related' ? (
              <div className='rounded-lg border border-[#f0f0f0] p-3'>
                <h3 className='mb-3 text-sm font-semibold text-[#262626]'>User Tamper Records</h3>
                <div className='mb-3 rounded-lg border border-[#dbe7ff] bg-[#f8fbff] p-3'>
                  <p className='text-sm font-semibold text-[#1e293b]'>
                    {snap.userName} ({snap.userId}) ke tampered records: {userTamperRecords.total}
                  </p>
                  <div className='mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3'>
                    <div className='rounded border border-[#ffccc7] bg-[#fff1f0] px-2 py-1.5 text-xs text-[#a8071a]'>
                      Detected: <span className='font-semibold'>{userTamperRecords.detectedCount}</span>
                    </div>
                    <div className='rounded border border-[#ffe58f] bg-[#fffbe6] px-2 py-1.5 text-xs text-[#ad6800]'>
                      Under Review: <span className='font-semibold'>{userTamperRecords.reviewCount}</span>
                    </div>
                    <div className='rounded border border-[#b7eb8f] bg-[#f6ffed] px-2 py-1.5 text-xs text-[#237804]'>
                      Resolved: <span className='font-semibold'>{userTamperRecords.resolvedCount}</span>
                    </div>
                  </div>
                </div>
                <div className='space-y-2'>
                  {userTamperRecords.rows.length === 0 ? (
                    <p className='text-sm text-[#8c8c8c]'>Is user ke liye koi tamper record nahi mila.</p>
                  ) : (
                    userTamperRecords.rows.map((row) => (
                      <div key={row.alertId} className='rounded border border-[#f0f0f0] bg-[#fafafa] px-3 py-2 text-sm'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                          <p className='font-medium text-[#262626]'>{row.applicationId}</p>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTone(row.status)}`}>
                            {row.status}
                          </span>
                        </div>
                        <p className='text-xs text-[#8c8c8c]'>
                          Alert: {row.alertId} | Certificate: {row.certificateId}
                        </p>
                        <p className='text-xs text-[#595959]'>
                          Field: {row.changedField} | Tamper Type: {row.tamperType}
                        </p>
                        <p className='text-xs text-[#8c8c8c]'>Detected On: {row.detectedOn}</p>
                        <div className='mt-2'>
                          <Link
                            to={`/dashboard/tampered-data/${encodeURIComponent(row.applicationId)}/history`}
                            className='inline-flex items-center gap-1 rounded border border-[#2563eb] bg-white px-2 py-1 text-xs font-semibold text-[#1d4ed8] hover:bg-[#eff6ff]'
                          >
                            Open Record <FiArrowRight className='h-3.5 w-3.5' />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {activeTab === 'documents' ? (
              <div className='rounded-lg border border-[#f0f0f0] p-3'>
                <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Documents</h3>
                <div className='overflow-x-auto rounded border border-[#f0f0f0]'>
                  <table className='w-full min-w-[700px] border-collapse'>
                    <thead>
                      <tr className='bg-[#fafafa] text-xs text-[#595959]'>
                        <th className='px-3 py-2 text-left'>Document</th>
                        <th className='px-3 py-2 text-left'>File</th>
                        <th className='px-3 py-2 text-left'>Status</th>
                        <th className='px-3 py-2 text-left'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className='border-t border-[#f0f0f0] text-sm'>
                          <td className='px-3 py-2'>{doc.name}</td>
                          <td className='px-3 py-2 font-mono text-xs'>{doc.file}</td>
                          <td className='px-3 py-2'>{doc.status}</td>
                          <td className='px-3 py-2'>
                            <button className='rounded border border-[#1890ff] px-2 py-1 text-xs text-[#1890ff] hover:bg-[#e6f7ff]'>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

          </div>

          <div className='space-y-4'>
            {activeTab === 'history' ? (
              <div className='rounded-lg border border-[#f0f0f0] p-3'>
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                  <div>
                    <h3 className='text-sm font-semibold text-[#262626]'>Changes History (A to Z)</h3>
                    <p className='mt-0.5 text-xs text-[#8c8c8c]'>Shows exactly what changed, where it changed, who changed it, and when.</p>
                  </div>
                  <span className='inline-flex rounded-full border border-[#d9d9d9] bg-[#fafafa] px-2 py-0.5 text-xs font-semibold text-[#595959]'>
                    {changelog.length} changes
                  </span>
                </div>

                <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5'>
                  <div className='rounded-md border border-[#f0f0f0] bg-[#fafafa] p-2.5'>
                    <p className='text-[11px] text-[#8c8c8c]'>Total change entries</p>
                    <p className='mt-0.5 text-sm font-semibold text-[#262626]'>{changelogBase.length}</p>
                  </div>
                  <div className='rounded-md border border-[#f0f0f0] bg-[#fafafa] p-2.5'>
                    <p className='text-[11px] text-[#8c8c8c]'>Changed fields</p>
                    <p className='mt-0.5 text-sm font-semibold text-[#262626]'>{changeSummary.uniqueFields}</p>
                  </div>
                  <div className='rounded-md border border-[#f0f0f0] bg-[#fafafa] p-2.5'>
                    <p className='text-[11px] text-[#8c8c8c]'>Actors involved</p>
                    <p className='mt-0.5 text-sm font-semibold text-[#262626]'>{changeSummary.uniqueActors}</p>
                  </div>
                  <div className='rounded-md border border-[#ffccc7] bg-[#fff1f0] p-2.5'>
                    <p className='text-[11px] text-[#8c8c8c]'>A→B value mutations</p>
                    <p className='mt-0.5 text-sm font-semibold text-[#a8071a]'>{changeSummary.mutatedRows}</p>
                  </div>
                  <div className='rounded-md border border-[#f0f0f0] bg-[#fafafa] p-2.5'>
                    <p className='text-[11px] text-[#8c8c8c]'>Latest change</p>
                    <p className='mt-0.5 text-xs font-semibold text-[#262626]'>{changeSummary.latest?.changedOn ?? 'N/A'}</p>
                  </div>
                </div>
              
                <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  <input
                    value={changeQuery}
                    onChange={(e) => setChangeQuery(e.target.value)}
                    placeholder='Search field, user, value, source…'
                    className='w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-sm text-[#262626] shadow-sm placeholder:text-[#bfbfbf] focus:border-[#1890ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20'
                  />
                  <select
                    value={changeSort}
                    onChange={(e) => setChangeSort(e.target.value as typeof changeSort)}
                    className='w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-sm text-[#262626] shadow-sm focus:border-[#1890ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20'
                  >
                    <option value='field_az'>Field (A → Z)</option>
                    <option value='field_za'>Field (Z → A)</option>
                    <option value='date_new'>Date (Newest first)</option>
                    <option value='date_old'>Date (Oldest first)</option>
                  </select>
                </div>

                <div className='overflow-x-auto rounded-lg border border-[#f0f0f0]'>
                  <table className='min-w-[1320px] w-full border-collapse'>
                    <thead>
                      <tr className='bg-[#fafafa] text-xs font-semibold uppercase tracking-wide text-[#595959]'>
                        <th className='px-3 py-2 text-left'>Sr No.</th>
                        <th className='px-3 py-2 text-left'>Changed on</th>
                        <th className='px-3 py-2 text-left'>Where changed</th>
                        <th className='px-3 py-2 text-left'>Field</th>
                        <th className='px-3 py-2 text-left'>From (old)</th>
                        <th className='px-3 py-2 text-left'>To (new)</th>
                        <th className='px-3 py-2 text-left'>Changed by</th>
                        <th className='px-3 py-2 text-left'>Source</th>
                        <th className='px-3 py-2 text-left'>IP / Device</th>
                        <th className='px-3 py-2 text-left'>Reason / Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changelog.length === 0 ? (
                        <tr>
                          <td colSpan={10} className='px-4 py-10 text-center text-sm text-[#8c8c8c]'>
                            No change rows found for current filters.
                          </td>
                        </tr>
                      ) : (
                        changelog.map((c, idx) => (
                          <tr
                            key={c.id}
                            onClick={() => jumpToStep(resolveStepFromChange(c))}
                            className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'} cursor-pointer hover:bg-[#f5faff]`}
                          >
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#262626]'>{idx + 1}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#262626]'>{c.changedOn}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#262626]'>{c.module ?? c.source}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm font-semibold text-[#262626]'>{c.field}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#237804]'>{c.from}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#a8071a]'>{c.to}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#262626]'>{c.changedBy}</td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#595959]'>
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${sourceTone(c.source)}`}>
                                {c.source}
                              </span>
                            </td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-xs text-[#595959] font-mono'>
                              {c.ipAddress ?? 'N/A'}{c.device ? ` | ${c.device}` : ''}
                            </td>
                            <td className='border-t border-[#f0f0f0] px-3 py-2 text-sm text-[#595959]'>
                              <div className='flex items-center justify-between gap-2'>
                                <span>{c.remarks ?? '—'}</span>
                                <button
                                  type='button'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    jumpToStep(resolveStepFromChange(c))
                                  }}
                                  className='shrink-0 rounded border border-[#2563eb] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#1d4ed8] hover:bg-[#eff6ff]'
                                >
                                  Jump to step
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className='mt-3 rounded-xl border border-[#dbeafe] bg-gradient-to-br from-[#f8fbff] via-white to-[#f4f9ff] p-4'>
                  <h4 className='mb-3 text-sm font-semibold text-[#1f2937]'>Step-by-step tamper detection flow</h4>
                  <div className='space-y-4'>
                    {auditSteps.map((step, idx) => (
                      <div
                        key={step.id}
                        ref={(el) => {
                          stepRefs.current[step.id] = el
                        }}
                        className='relative pl-12'
                      >
                        <span
                          className={`absolute left-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${stepTone(step.outcome)}`}
                        >
                          {idx + 1}
                        </span>
                        {idx < auditSteps.length - 1 ? (
                          <span className='absolute left-[15px] top-8 h-[calc(100%+10px)] w-0.5 bg-gradient-to-b from-[#93c5fd] to-[#dbeafe]' />
                        ) : null}
                        <div
                          className={`rounded-lg border bg-white p-3 shadow-sm transition ${
                            focusedStepId === step.id ? 'border-[#2563eb] ring-2 ring-[#bfdbfe]' : 'border-[#e2e8f0]'
                          }`}
                        >
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <p className='text-sm font-semibold text-[#1f2937]'>{step.step}</p>
                            <div className='flex items-center gap-2'>
                              {(step.outcome === 'changed' || step.outcome === 'detected' || step.outcome === 'review') ? (
                                <button
                                  type='button'
                                  onClick={() => setOpenStepId((prev) => (prev === step.id ? null : step.id))}
                                  className='inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-white px-2 py-1 text-[11px] font-medium text-[#262626] hover:border-[#1890ff] hover:text-[#1890ff]'
                                >
                                  {openStepId === step.id ? 'Hide details' : 'View details'}
                                  {openStepId === step.id ? <FiChevronUp className='h-3.5 w-3.5' /> : <FiChevronDown className='h-3.5 w-3.5' />}
                                </button>
                              ) : null}
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${stepTone(step.outcome)}`}
                              >
                                {step.outcome.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className='mt-1 text-xs leading-relaxed text-[#475569]'>{step.detail}</p>
                          {openStepId === step.id && (step.outcome === 'changed' || step.outcome === 'detected') && step.compareFrom && step.compareTo ? (
                            <div className='mt-2 rounded-md border border-[#ffccc7] bg-[#fff7f7] p-2'>
                              <p className='text-[11px] font-semibold text-[#a8071a]'>
                                {step.compareField ?? 'Changed value'} comparison
                              </p>
                              <div className='mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                                <div className='rounded border border-[#b7eb8f] bg-[#f6ffed] p-2'>
                                  <p className='text-[10px] font-semibold uppercase tracking-wide text-[#237804]'>Previous data</p>
                                  <p className='mt-1 text-xs font-medium text-[#1f2937] break-words'>{step.compareFrom}</p>
                                </div>
                                <div className='rounded border border-[#ffccc7] bg-[#fff1f0] p-2'>
                                  <p className='text-[10px] font-semibold uppercase tracking-wide text-[#a8071a]'>Current data</p>
                                  <p className='mt-1 text-xs font-medium text-[#1f2937] break-words'>{step.compareTo}</p>
                                </div>
                              </div>
                              <div className='mt-2 grid grid-cols-1 gap-1 text-[11px] text-[#595959] sm:grid-cols-2'>
                                <p><span className='font-medium text-[#8c8c8c]'>Source:</span> {step.detailSource ?? 'N/A'}</p>
                                <p><span className='font-medium text-[#8c8c8c]'>Module:</span> {step.detailModule ?? step.where}</p>
                                <p><span className='font-medium text-[#8c8c8c]'>IP:</span> <span className='font-mono'>{step.detailIp ?? 'N/A'}</span></p>
                                <p><span className='font-medium text-[#8c8c8c]'>Device:</span> <span className='font-mono'>{step.detailDevice ?? 'N/A'}</span></p>
                              </div>
                              <p className='mt-1 text-[11px] text-[#595959]'>
                                <span className='font-medium text-[#8c8c8c]'>Remark:</span> {step.detailRemark ?? '—'}
                              </p>
                            </div>
                          ) : null}
                          {openStepId === step.id && step.outcome === 'review' ? (
                            <div className='mt-2 rounded-md border border-[#ffe58f] bg-[#fffbe6] p-2'>
                              <p className='text-[11px] font-semibold text-[#ad6800]'>Review action details</p>
                              <p className='mt-1 text-xs text-[#595959]'>
                                Current case status is <span className='font-semibold'>{snap.status}</span>. Next action is handled by review desk based on this detection trail.
                              </p>
                              <div className='mt-2 grid grid-cols-1 gap-1 text-[11px] text-[#595959] sm:grid-cols-2'>
                                <p><span className='font-medium text-[#8c8c8c]'>Source:</span> {step.detailSource ?? 'N/A'}</p>
                                <p><span className='font-medium text-[#8c8c8c]'>Module:</span> {step.detailModule ?? step.where}</p>
                                <p><span className='font-medium text-[#8c8c8c]'>IP:</span> <span className='font-mono'>{step.detailIp ?? 'N/A'}</span></p>
                                <p><span className='font-medium text-[#8c8c8c]'>Device:</span> <span className='font-mono'>{step.detailDevice ?? 'N/A'}</span></p>
                              </div>
                              <p className='mt-1 text-[11px] text-[#595959]'>
                                <span className='font-medium text-[#8c8c8c]'>Remark:</span> {step.detailRemark ?? snap.remarks}
                              </p>
                            </div>
                          ) : null}
                          <p className='mt-1 text-[11px] text-[#64748b]'>
                            <span className='font-medium'>When:</span> {step.when}
                            {'  |  '}
                            <span className='font-medium'>Who:</span> {step.who}
                            {'  |  '}
                            <span className='font-medium'>Where:</span> {step.where}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-3 rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-3'>
                  <p className='text-xs font-semibold text-[#595959]'>Notes</p>
                  <p className='mt-1 text-xs text-[#8c8c8c]'>
                    Old/New values are shown exactly as stored. For blockchain mismatches, “From” represents on-chain expected value and “To” represents current off-chain value.
                  </p>
                </div>
              </div>
            ) : null}

            {(activeTab === 'overview') ? (
              <div className='rounded-lg border border-[#f0f0f0] p-3'>
                <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Event Timeline</h3>
                <div className='space-y-3'>
                  {timeline.length === 0 ? (
                    <p className='text-sm text-[#8c8c8c]'>No timeline found.</p>
                  ) : (
                    timeline.map((row, idx) => (
                      <div key={`${row.date}-${idx}`} className='relative pl-6'>
                        <span className={`absolute left-0 top-1 inline-flex h-3 w-3 rounded-full ${timelineDot(row.tone)}`} />
                        {idx < timeline.length - 1 ? <span className='absolute left-[5px] top-5 h-[calc(100%+6px)] w-px bg-[#d9d9d9]' /> : null}
                        <p className='text-xs text-[#8c8c8c]'>{row.date}</p>
                        <p className='text-sm font-semibold text-[#262626]'>{row.title}</p>
                        <p className='text-xs text-[#595959]'>{row.description}</p>
                        <p className='mt-0.5 inline-flex rounded border border-[#d9d9d9] bg-[#fafafa] px-1.5 py-0.5 text-[10px] text-[#595959]'>{row.actorTag}</p>
                      </div>
                    ))
                  )}
                </div>
                <button className='mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1890ff] hover:underline'>
                  View Full Timeline <FiArrowRight className='h-3.5 w-3.5' />
                </button>
              </div>
            ) : null}

            <div className='rounded-lg border border-[#f0f0f0] p-3'>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Current Tracking Status</h3>
              <div className='space-y-2 text-sm text-[#262626]'>
                <p><span className='text-[#8c8c8c]'>Current Status: </span>{snap.status}</p>
                <p><span className='text-[#8c8c8c]'>Severity: </span>{snap.severity}</p>
                <p><span className='text-[#8c8c8c]'>Blockchain Validation: </span>{snap.blockchainStatus}</p>
                <p><span className='text-[#8c8c8c]'>Detected By: </span>{snap.detectedBy}</p>
                <p><span className='text-[#8c8c8c]'>Latest Remark: </span>{snap.remarks}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className='text-center text-xs text-[#8c8c8c]'>© 2026 TDR Blockchain System. All rights reserved.</p>
    </div>
  )
}
