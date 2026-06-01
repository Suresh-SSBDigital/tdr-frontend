import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiDownload, FiExternalLink, FiFileText, FiMapPin, FiShield, FiUser, FiXCircle } from 'react-icons/fi'
import { getBlockchainTxExplorerUrl } from '../../../helpers/blockchainExplorer'
import {
  buildLedgerData,
  type CertificateRecord,
  getCertificatesForSamagraId,
  getCertificateByApplicationId,
  getCertificateBySno,
  parseCertificateIssueDate,
  type BlockchainHistoryNode,
} from '../data/certificateLedgerData'
import { PageHeader } from '../components'

type TabId = 'overview' | 'land' | 'ownership' | 'transfer' | 'blockchain' | 'documents' | 'history'
type HistoryEventType = 'START' | 'TRANSFER' | 'UTILIZATION'

const TAB_ITEMS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'land', label: 'Land Details' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'History' },
]

const card = 'rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_10px_30px_rgba(11,61,145,0.08)]'
const label = 'text-xs font-medium text-[#6b7280]'
const value = 'mt-1 text-sm font-semibold text-[#1f2937]'
const th = 'border border-[#d6e4ff] bg-[#f5f9ff] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#334155]'
const td = 'border border-[#dbe7ff] px-3 py-2.5 text-sm text-[#1f2937] align-top'
const NA = 'Not Available'

function flattenHistory(nodes: BlockchainHistoryNode[], level = 0): Array<BlockchainHistoryNode & { level: number }> {
  return nodes.flatMap((n) => [{ ...n, level }, ...(n.children ? flattenHistory(n.children, level + 1) : [])])
}

function computeCurrentHash(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `0x${h.toString(16).toUpperCase().padStart(8, '0')}SIM`
}

function show(v: unknown): string {
  if (v == null) return NA
  const s = String(v).trim()
  return s.length > 0 ? s : NA
}

function shortHash(hash: string): string {
  if (!hash || hash.length < 14) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

function parseDisplayDateToSortTs(raw: string): number {
  const normalized = String(raw ?? '').trim()
  const m = normalized.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?$/)
  if (!m) return 0
  const [, dd, mm, yyyy, hh = '00', min = '00'] = m
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min)).getTime()
}

function hasValue(v: unknown): boolean {
  return v !== null && v !== undefined && String(v).trim() !== ''
}

export default function CertificateLedgerPage() {
  const { applicationId, sno } = useParams()
  const [tab, setTab] = useState<TabId>('overview')
  const [verifyResult, setVerifyResult] = useState<'verified' | 'tampered' | null>(null)
  const [activeDoc, setActiveDoc] = useState<{ name: string; file: string } | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null)
  const [expandedHistoryEventId, setExpandedHistoryEventId] = useState<string | null>(null)

  const record = useMemo(() => {
    if (applicationId) return getCertificateByApplicationId(decodeURIComponent(applicationId))
    const n = Number(sno)
    return getCertificateBySno(Number.isNaN(n) ? -1 : n)
  }, [applicationId, sno])

  const ledger = useMemo(() => (record ? buildLedgerData(record) : null), [record])
  const history = useMemo(() => (ledger ? flattenHistory(ledger.historyTree) : []), [ledger])

  if (!ledger) {
    return (
      <div className={card}>
        <PageHeader title='View Ledger' subtitle='Record not found for the selected certificate/application.' />
        <Link to='/dashboard/certificates' className='text-sm font-medium text-[#1890ff] hover:underline'>
          Back to DRC Certificates
        </Link>
      </div>
    )
  }

  const r = ledger.summary
  const txUrl = getBlockchainTxExplorerUrl(ledger.blockchainTxHash)
  const currentHash = computeCurrentHash(`${r.certificateNo}|${r.applicationId}|${r.issuedArea}|${r.balanceArea}|${r.name}`)

  const lastUpdated = history[history.length - 1]?.timestamp ?? r.issueDate
  const holderChain = r.holderSamagraId ? getCertificatesForSamagraId(r.holderSamagraId) : [r]
  const holderChainByDate = [...holderChain].sort(
    (a, b) => parseCertificateIssueDate(a.issueDate) - parseCertificateIssueDate(b.issueDate),
  )
  const firstDrc = holderChainByDate[0] ?? r
  const currentDrc = holderChainByDate[holderChainByDate.length - 1] ?? r
  const fallbackPool: CertificateRecord[] = [r, currentDrc, ...holderChainByDate]
  const pickFromChain = <T,>(selector: (rec: CertificateRecord) => T): T | null => {
    for (const rec of fallbackPool) {
      const v = selector(rec)
      if (hasValue(v)) return v
    }
    return null
  }
  const resolvedDistrict = (pickFromChain((rec) => rec.district) as string | null) ?? r.city
  const resolvedTehsil = pickFromChain((rec) => rec.tehsil)
  const resolvedVillage = pickFromChain((rec) => rec.village)
  const resolvedAddress = pickFromChain((rec) => rec.propertyAddress)
  const resolvedKhasra = pickFromChain((rec) => rec.khasraNo)
  const resolvedZoneSector = pickFromChain((rec) => rec.zoneSector)
  const resolvedLandUse = pickFromChain((rec) => rec.landUse)
  const resolvedPermissibleFsi = pickFromChain((rec) => rec.permissibleFsi)
  const resolvedBaseFsiConsumed = pickFromChain((rec) => rec.baseFsiConsumed)
  const resolvedAdditionalTdrPermissible = pickFromChain((rec) => rec.additionalTdrPermissible)
  const resolvedFatherOrHusbandName = pickFromChain((rec) => rec.fatherOrHusbandName)
  const resolvedMobileNo = pickFromChain((rec) => rec.mobileNo)
  const resolvedLandSqM = (pickFromChain((rec) => rec.totalLandAreaSqM) as number | null) ?? r.issuedArea
  const landSqm = resolvedLandSqM
  const hectare = (landSqm / 10000).toFixed(4)
  const transferType = ledger.saleTransferDetails.length > 0 ? 'Sale / Transfer' : 'Not transferred yet'
  const ownershipStatus = r.parentApplicationId ? 'Transferred (chain-linked)' : 'Active'
  const utilizedSqm = Math.max(r.issuedArea - r.balanceArea, 0)
  const utilizedPct = r.issuedArea > 0 ? ((utilizedSqm / r.issuedArea) * 100).toFixed(1) : '0.0'
  const certificateStatus: 'Issued' | 'Pending' | 'Approved' | 'Draft' = !r.issueDate
    ? 'Draft'
    : utilizedSqm > 0
      ? 'Issued'
      : ledger.blockchainVerified
        ? 'Approved'
        : 'Pending'
  const certificateStatusClass =
    certificateStatus === 'Issued'
      ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
      : certificateStatus === 'Pending'
        ? 'border-[#ffe58f] bg-[#fffbe6] text-[#ad6800]'
        : certificateStatus === 'Approved'
          ? 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]'
          : 'border-[#d9d9d9] bg-[#fafafa] text-[#595959]'
  const miniTimeline = history.slice(-5).reverse()
  const transferCount = ledger.saleTransferDetails.length
  const utilizationCount = ledger.utilizationDetails.length
  const flowStages: Array<{ key: string; label: string; done: boolean; hint: string }> = [
    {
      key: 'issuance',
      label: 'Certificate Issued',
      done: Boolean(r.issueDate),
      hint: show(r.issueDate),
    },
    {
      key: 'anchored',
      label: 'Blockchain Anchored',
      done: ledger.blockchainVerified,
      hint: `Block ${ledger.blockNumber}`,
    },
    {
      key: 'transfer',
      label: 'Transfer Processed',
      done: transferCount > 0,
      hint: transferCount > 0 ? `${transferCount} transfer record(s)` : 'No transfer yet',
    },
    {
      key: 'utilization',
      label: 'Utilization Updated',
      done: utilizationCount > 0 || utilizedSqm > 0,
      hint:
        utilizationCount > 0
          ? `${utilizationCount} utilization record(s)`
          : `${utilizedSqm.toLocaleString('en-IN')} sq.m consumed`,
    },
  ]
  const transferRows = useMemo(
    () =>
      ledger.saleTransferDetails.map((tx, idx) => ({
        transferId: `TR-${String(r.sno).padStart(4, '0')}-${idx + 1}`,
        date: tx.transactionDate,
        dateTime: `${tx.transactionDate} 10:${String(20 + idx).padStart(2, '0')}`,
        fromOwner: tx.holderName,
        toOwner: tx.counterpartyName ?? 'Unknown Receiver',
        transferredAmount: tx.issuedArea,
        remainingAfter: tx.balanceArea,
        status: tx.status === 'Pending' ? 'Pending' : 'Success',
        txHash: tx.chainTxHash ?? ledger.blockchainTxHash,
        block: tx.chainBlock ?? ledger.blockNumber,
        txNo: tx.transactionNo,
        previousBalance: tx.balanceArea + tx.issuedArea,
      })),
    [ledger, r.sno],
  )
  const selectedTransfer = useMemo(
    () => transferRows.find((x) => x.transferId === selectedTransferId) ?? null,
    [selectedTransferId, transferRows],
  )
  const originalDrcValue = r.issuedArea
  const totalTransferred = transferRows.reduce((sum, row) => sum + row.transferredAmount, 0)
  const totalUtilizedFromRecords =
    ledger.utilizationDetails.length > 0
      ? ledger.utilizationDetails.reduce((sum, row) => sum + row.issuedArea, 0)
      : utilizedSqm
  const currentRemainingLive = Math.max(originalDrcValue - totalUtilizedFromRecords - totalTransferred, 0)
  const currentOwnerAfterTransfer =
    transferRows.length > 0 ? transferRows[transferRows.length - 1].toOwner : r.name
  const historyMaintenanceRows = useMemo(() => {
    const issuance = ledger.issuedDetails.map((tx) => ({
      eventType: 'ISSUANCE' as const,
      date: tx.transactionDate,
      fromParty: 'TDR Authority',
      toParty: tx.holderName,
      qty: tx.issuedArea,
      balance: tx.balanceArea,
      txNo: tx.transactionNo,
      txHash: tx.chainTxHash,
      block: tx.chainBlock,
      status: tx.status ?? 'Completed',
      remarks: 'Initial certificate credit',
    }))
    const transfer = ledger.saleTransferDetails.map((tx) => ({
      eventType: 'TRANSFER' as const,
      date: tx.transactionDate,
      fromParty: tx.holderName,
      toParty: tx.counterpartyName ?? 'Transfer buyer not captured',
      qty: tx.issuedArea,
      balance: tx.balanceArea,
      txNo: tx.transactionNo,
      txHash: tx.chainTxHash,
      block: tx.chainBlock,
      status: tx.status ?? 'Completed',
      remarks: 'DRC transfer debit entry',
    }))
    const utilization = ledger.utilizationDetails.map((tx) => ({
      eventType: 'UTILIZATION' as const,
      date: tx.transactionDate,
      fromParty: tx.holderName,
      toParty: tx.counterpartyName ?? 'Utilization authority',
      qty: tx.issuedArea,
      balance: tx.balanceArea,
      txNo: tx.transactionNo,
      txHash: tx.chainTxHash,
      block: tx.chainBlock,
      status: tx.status ?? 'Completed',
      remarks: 'Utilization consumption entry',
    }))
    return [...issuance, ...transfer, ...utilization].sort((a, b) => parseDisplayDateToSortTs(a.date) - parseDisplayDateToSortTs(b.date))
  }, [ledger])
  const ownershipLandHistoryRows = useMemo(() => {
    const transferEntries = transferRows.map((row, idx) => ({
      id: `own-tr-${idx + 1}`,
      date: row.date,
      action: 'TRANSFER' as const,
      fromParty: row.fromOwner,
      toParty: row.toOwner,
      movedArea: row.transferredAmount,
      utilizedArea: 0,
      sourceBalanceAfter: row.remainingAfter,
      destinationBalanceAfter: row.transferredAmount,
      txHash: row.txHash,
      block: row.block,
    }))
    const utilizationEntries = ledger.utilizationDetails.map((row, idx) => ({
      id: `own-ut-${idx + 1}`,
      date: row.transactionDate,
      action: 'UTILIZATION' as const,
      fromParty: row.holderName,
      toParty: row.counterpartyName ?? 'Utilized in project',
      movedArea: 0,
      utilizedArea: row.issuedArea,
      sourceBalanceAfter: row.balanceArea,
      destinationBalanceAfter: 0,
      txHash: row.chainTxHash ?? ledger.blockchainTxHash,
      block: row.chainBlock ?? ledger.blockNumber,
    }))
    return [...transferEntries, ...utilizationEntries].sort((a, b) => parseDisplayDateToSortTs(a.date) - parseDisplayDateToSortTs(b.date))
  }, [ledger, transferRows])
  const valueFlowRows = useMemo(
    () =>
      historyMaintenanceRows.map((row, idx) => ({
        seq: idx + 1,
        date: row.date,
        eventType: row.eventType,
        from: row.fromParty,
        to: row.toParty,
        transferred: row.eventType === 'TRANSFER' ? row.qty : 0,
        utilized: row.eventType === 'UTILIZATION' ? row.qty : 0,
        remaining: row.balance,
        txNo: row.txNo,
        txHash: row.txHash,
        block: row.block,
        remarks: row.remarks,
      })),
    [historyMaintenanceRows],
  )
  const drillDownHistoryRows = useMemo(() => {
    if (r.sno === 21) {
      return [
        {
          id: 's21-start',
          step: 0,
          date: '01-04-2026 09:10',
          type: 'START' as HistoryEventType,
          from: 'TDR Authority',
          to: 'Anil Patidar',
          qty: 0,
          balance: 5000,
          txNo: 'TX-START-21',
          txHash: '0xS21START5000',
          block: 21001,
          remarks: 'Initial DRC credit created.',
          details: ['Start Value: 5,000 sq.m', 'Holder: Anil Patidar', 'Status: Blockchain verified'],
        },
        {
          id: 's21-t1',
          step: 1,
          date: '03-04-2026 11:20',
          type: 'TRANSFER' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Rakesh Chouhan',
          qty: 800,
          balance: 4200,
          txNo: 'TX-TR-21-01',
          txHash: '0xS21TR01A1',
          block: 21011,
          remarks: 'Transfer cycle 1.',
          details: ['Transferred: 800 sq.m', 'Remaining after transfer: 4,200 sq.m', 'Receiver: Rakesh Chouhan'],
        },
        {
          id: 's21-t2',
          step: 2,
          date: '06-04-2026 14:05',
          type: 'TRANSFER' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Sunita Sharma',
          qty: 600,
          balance: 3600,
          txNo: 'TX-TR-21-02',
          txHash: '0xS21TR02B2',
          block: 21019,
          remarks: 'Transfer cycle 2.',
          details: ['Transferred: 600 sq.m', 'Remaining after transfer: 3,600 sq.m', 'Receiver: Sunita Sharma'],
        },
        {
          id: 's21-t3',
          step: 3,
          date: '09-04-2026 17:45',
          type: 'TRANSFER' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Kavita Sen',
          qty: 400,
          balance: 3200,
          txNo: 'TX-TR-21-03',
          txHash: '0xS21TR03C3',
          block: 21026,
          remarks: 'Transfer cycle 3.',
          details: ['Transferred: 400 sq.m', 'Remaining after transfer: 3,200 sq.m', 'Receiver: Kavita Sen'],
        },
        {
          id: 's21-u1',
          step: 4,
          date: '12-04-2026 10:30',
          type: 'UTILIZATION' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Project-A',
          qty: 300,
          balance: 2900,
          txNo: 'TX-UT-21-01',
          txHash: '0xS21UT01D4',
          block: 21033,
          remarks: 'Utilization cycle 1.',
          details: ['Utilized: 300 sq.m', 'Remaining after utilization: 2,900 sq.m', 'Used for Project-A'],
        },
        {
          id: 's21-u2',
          step: 5,
          date: '15-04-2026 12:12',
          type: 'UTILIZATION' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Project-B',
          qty: 350,
          balance: 2550,
          txNo: 'TX-UT-21-02',
          txHash: '0xS21UT02E5',
          block: 21040,
          remarks: 'Utilization cycle 2.',
          details: ['Utilized: 350 sq.m', 'Remaining after utilization: 2,550 sq.m', 'Used for Project-B'],
        },
        {
          id: 's21-u3',
          step: 6,
          date: '18-04-2026 15:05',
          type: 'UTILIZATION' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Project-C',
          qty: 250,
          balance: 2300,
          txNo: 'TX-UT-21-03',
          txHash: '0xS21UT03F6',
          block: 21048,
          remarks: 'Utilization cycle 3.',
          details: ['Utilized: 250 sq.m', 'Remaining after utilization: 2,300 sq.m', 'Used for Project-C'],
        },
        {
          id: 's21-u4',
          step: 7,
          date: '21-04-2026 09:50',
          type: 'UTILIZATION' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Project-D',
          qty: 200,
          balance: 2100,
          txNo: 'TX-UT-21-04',
          txHash: '0xS21UT04G7',
          block: 21056,
          remarks: 'Utilization cycle 4.',
          details: ['Utilized: 200 sq.m', 'Remaining after utilization: 2,100 sq.m', 'Used for Project-D'],
        },
        {
          id: 's21-u5',
          step: 8,
          date: '24-04-2026 16:20',
          type: 'UTILIZATION' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Project-E',
          qty: 300,
          balance: 1800,
          txNo: 'TX-UT-21-05',
          txHash: '0xS21UT05H8',
          block: 21064,
          remarks: 'Utilization cycle 5.',
          details: ['Utilized: 300 sq.m', 'Remaining after utilization: 1,800 sq.m', 'Used for Project-E'],
        },
        {
          id: 's21-t4',
          step: 9,
          date: '27-04-2026 13:40',
          type: 'TRANSFER' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Meera Joshi',
          qty: 500,
          balance: 1300,
          txNo: 'TX-TR-21-04',
          txHash: '0xS21TR04I9',
          block: 21072,
          remarks: 'Post-utilization transfer 1.',
          details: ['Transferred: 500 sq.m', 'Remaining after transfer: 1,300 sq.m', 'Receiver: Meera Joshi'],
        },
        {
          id: 's21-t5',
          step: 10,
          date: '30-04-2026 18:10',
          type: 'TRANSFER' as HistoryEventType,
          from: 'Anil Patidar',
          to: 'Vikram Singh',
          qty: 300,
          balance: 1000,
          txNo: 'TX-TR-21-05',
          txHash: '0xS21TR05J0',
          block: 21080,
          remarks: 'Post-utilization transfer 2.',
          details: ['Transferred: 300 sq.m', 'Remaining after transfer: 1,000 sq.m', 'Receiver: Vikram Singh'],
        },
      ]
    }

    const initialBalance = r.issuedArea
    return valueFlowRows.map((row, idx) => ({
      id: `evt-${row.seq}`,
      step: row.seq,
      date: show(row.date),
      type: (row.eventType === 'TRANSFER' ? 'TRANSFER' : row.eventType === 'UTILIZATION' ? 'UTILIZATION' : 'START') as HistoryEventType,
      from: show(row.from),
      to: show(row.to),
      qty: row.eventType === 'TRANSFER' ? row.transferred : row.eventType === 'UTILIZATION' ? row.utilized : 0,
      balance: row.remaining,
      txNo: show(row.txNo),
      txHash: show(row.txHash),
      block: show(row.block),
      remarks: show(row.remarks),
      details: [
        `Start Value: ${idx === 0 ? initialBalance.toLocaleString('en-IN') : valueFlowRows[idx - 1]!.remaining.toLocaleString('en-IN')} sq.m`,
        `Moved Value: ${row.eventType === 'TRANSFER' ? row.transferred.toLocaleString('en-IN') : row.utilized.toLocaleString('en-IN')} sq.m`,
        `Remaining: ${row.remaining.toLocaleString('en-IN')} sq.m`,
      ],
    }))
  }, [r.issuedArea, r.sno, valueFlowRows])
  const ownershipDisplayRows = useMemo(() => {
    if (r.sno === 21) {
      return drillDownHistoryRows
        .filter((row) => row.type !== 'START')
        .map((row) => ({
          id: row.id,
          date: row.date,
          action: row.type,
          fromParty: row.from,
          toParty: row.to,
          movedArea: row.type === 'TRANSFER' ? row.qty : 0,
          utilizedArea: row.type === 'UTILIZATION' ? row.qty : 0,
          sourceBalanceAfter: row.balance,
          destinationBalanceAfter: row.type === 'TRANSFER' ? row.qty : 0,
          txHash: row.txHash,
          block: row.block,
        }))
    }
    return ownershipLandHistoryRows
  }, [drillDownHistoryRows, ownershipLandHistoryRows, r.sno])
  const ownerRemainingSummary = useMemo(() => {
    const latest = ownershipDisplayRows[ownershipDisplayRows.length - 1]
    const currentRemaining = latest ? latest.sourceBalanceAfter : r.balanceArea
    const totalTransferredByOwner = ownershipDisplayRows.reduce((sum, row) => sum + row.movedArea, 0)
    const totalUtilizedByOwner = ownershipDisplayRows.reduce((sum, row) => sum + row.utilizedArea, 0)
    return {
      currentRemaining,
      totalTransferredByOwner,
      totalUtilizedByOwner,
      ownershipPercent: r.issuedArea > 0 ? ((currentRemaining / r.issuedArea) * 100).toFixed(1) : '0.0',
      lastUpdatedOn: latest?.date ?? show(r.issueDate),
    }
  }, [ownershipDisplayRows, r.balanceArea, r.issuedArea, r.issueDate])
  const landMovementRows = useMemo(
    () =>
      drillDownHistoryRows.map((row, idx) => ({
        id: row.id,
        seq: idx,
        date: row.date,
        action: row.type,
        actor: row.from,
        target: row.to,
        transferred: row.type === 'TRANSFER' ? row.qty : 0,
        utilized: row.type === 'UTILIZATION' ? row.qty : 0,
        remaining: row.balance,
        txNo: row.txNo,
        txHash: row.txHash,
        block: row.block,
      })),
    [drillDownHistoryRows],
  )

  const verificationBadge =
    verifyResult === null
      ? null
      : verifyResult === 'verified'
        ? { txt: 'Verified', cls: 'bg-[#f6ffed] text-[#237804] border-[#b7eb8f]', icon: <FiCheckCircle className='h-4 w-4' /> }
        : { txt: 'Tampered', cls: 'bg-[#fff1f0] text-[#a8071a] border-[#ffccc7]', icon: <FiXCircle className='h-4 w-4' /> }

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-[#c7dcff] bg-gradient-to-r from-[#0b3d91] via-[#1554bf] to-[#1f6feb] p-5 text-white shadow-[0_12px_30px_rgba(15,63,150,0.35)]'>
        <h1 className='text-xl font-semibold md:text-2xl'>DRC Certificate Ledger</h1>
        <p className='mt-1 text-sm text-[#dbeafe]'>
          {`Certificate ${r.certificateNo} · Application ${show(r.applicationId)} · ${show(resolvedDistrict)}`}
        </p>
        <p className='mt-2 text-xs font-medium text-[#dbeafe]'>
          Verified ownership, land and blockchain trail in one place.
        </p>
      </div>

      <section className={card}>
        <div className='flex flex-wrap gap-2 border-b border-[#dbe7ff] pb-3'>
          {TAB_ITEMS.map((t) => (
            <button
              key={t.id}
              type='button'
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-[#1f6feb] text-white shadow-[0_6px_16px_rgba(31,111,235,0.35)]'
                  : 'text-[#475569] hover:bg-[#eff6ff] hover:text-[#0b3d91]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div className='mt-5 space-y-5'>
            <div className='rounded-2xl border border-[#cfe0ff] bg-gradient-to-r from-[#eef5ff] via-[#f7fbff] to-white p-4 shadow-[0_8px_22px_rgba(15,63,150,0.08)]'>
              <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.08em] text-[#4b5f89]'>DRC lifecycle flow</p>
                <span className='rounded-full border border-[#cfe0ff] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#335286]'>
                  Real-time stage overview
                </span>
              </div>
              <div className='mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4'>
                {flowStages.map((stage) => (
                  <div
                    key={stage.key}
                    className={`rounded-xl border px-3 py-2.5 ${
                      stage.done
                        ? 'border-[#b7eb8f] bg-[#f6ffed] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
                        : 'border-[#dbe7ff] bg-white'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${stage.done ? 'text-[#237804]' : 'text-[#595959]'}`}>{stage.label}</p>
                    <p className='mt-1 text-xs text-[#8c8c8c]'>{stage.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_22px_rgba(15,63,150,0.06)]'>
              <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                <h3 className='text-sm font-semibold text-[#1e293b]'>DRC Evolution (First vs Current)</h3>
                <span className='rounded-full border border-[#cfe0ff] bg-[#f5f9ff] px-2 py-0.5 text-xs font-medium text-[#335286]'>
                  Holder chain records: {holderChain.length}
                </span>
              </div>
              <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                <div className='rounded-lg border border-[#91d5ff] bg-[#f0faff] p-3'>
                  <p className={label}>First DRC in chain</p>
                  <p className={`${value} font-mono`}>{firstDrc.certificateNo}</p>
                  <p className='mt-1 text-xs text-[#595959]'>
                    Issued: {show(firstDrc.issueDate)} | Area: {firstDrc.issuedArea.toLocaleString('en-IN')} sq.m
                  </p>
                </div>
                <div className='rounded-lg border border-[#b7eb8f] bg-[#f6ffed] p-3'>
                  <p className={label}>Current latest DRC</p>
                  <p className={`${value} font-mono`}>{currentDrc.certificateNo}</p>
                  <p className='mt-1 text-xs text-[#595959]'>
                    Issued: {show(currentDrc.issueDate)} | Balance: {currentDrc.balanceArea.toLocaleString('en-IN')} sq.m
                  </p>
                </div>
              </div>
              <div className='mt-3 overflow-x-auto rounded-xl border border-[#dbe7ff]'>
                <table className='min-w-[760px] w-full border-collapse'>
                  <thead>
                    <tr>
                      <th className={th}>S.No</th>
                      <th className={th}>Certificate</th>
                      <th className={th}>Issue Date</th>
                      <th className={th}>Issued (sq.m)</th>
                      <th className={th}>Balance (sq.m)</th>
                      <th className={th}>Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holderChainByDate.map((c, idx) => (
                      <tr key={c.sno} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fbff]'}>
                        <td className={td}>{c.sno}</td>
                        <td className={`${td} font-mono`}>{c.certificateNo}</td>
                        <td className={td}>{show(c.issueDate)}</td>
                        <td className={td}>{c.issuedArea.toLocaleString('en-IN')}</td>
                        <td className={td}>{c.balanceArea.toLocaleString('en-IN')}</td>
                        <td className={td}>
                          <Link to={`/dashboard/certificates/${c.sno}`} className='text-sm font-semibold text-[#1d4ed8] hover:underline'>
                            View ledger
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'>
              <div className='rounded-xl border border-[#d9e9ff] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                <p className={label}>Certificate Status</p>
                <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${certificateStatusClass}`}>{certificateStatus}</span>
              </div>
              <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                <p className={label}>Owner Name</p>
                <p className={value}>{show(r.name)}</p>
              </div>
              <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                <p className={label}>Land Area</p>
                <p className={value}>{landSqm.toLocaleString('en-IN')} sq.m / {hectare} ha</p>
              </div>
              <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                <p className={label}>Location</p>
                <p className={value}>{show(resolvedVillage)}, {show(resolvedDistrict)}</p>
              </div>
              <div className='rounded-xl border border-[#b7eb8f] bg-[#fcfffa] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(35,120,4,0.12)]'>
                <p className={label}>Blockchain Status</p>
                <p className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${ledger.blockchainVerified ? 'text-[#237804]' : 'text-[#a8071a]'}`}>
                  {ledger.blockchainVerified ? <FiCheckCircle className='h-4 w-4' /> : <FiXCircle className='h-4 w-4' />}
                  {ledger.blockchainVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <div className='space-y-4'>
                <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                  <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiFileText className='h-4 w-4 text-[#2563eb]' /> Basic Information</h3>
                  <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div><p className={label}>DRC / Certificate ID</p><p className={`${value} font-mono`}>{r.certificateNo}</p></div>
                    <div><p className={label}>Application ID</p><p className={`${value} font-mono`}>{show(r.applicationId)}</p></div>
                    <div><p className={label}>Issue Date</p><p className={value}>{show(r.issueDate)}</p></div>
                    <div><p className={label}>Last Updated Date</p><p className={value}>{show(lastUpdated)}</p></div>
                  </div>
                </div>
                <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                  <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiMapPin className='h-4 w-4 text-[#2563eb]' /> Land Information</h3>
                  <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div><p className={label}>Land ID</p><p className={`${value} font-mono`}>LAND-{r.sno}</p></div>
                    <div><p className={label}>Survey / Khasra Number</p><p className={value}>{show(resolvedKhasra)}</p></div>
                    <div><p className={label}>Plot Number</p><p className={value}>{show(resolvedZoneSector)}</p></div>
                    <div><p className={label}>Land Type</p><p className={value}>{show(resolvedLandUse)}</p></div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                  <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiMapPin className='h-4 w-4 text-[#2563eb]' /> Location Details</h3>
                  <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div><p className={label}>State</p><p className={value}>Madhya Pradesh</p></div>
                    <div><p className={label}>District</p><p className={value}>{show(resolvedDistrict)}</p></div>
                    <div><p className={label}>Tehsil</p><p className={value}>{show(resolvedTehsil)}</p></div>
                    <div><p className={label}>Village</p><p className={value}>{show(resolvedVillage)}</p></div>
                    <div className='sm:col-span-2'><p className={label}>Full Address</p><p className={value}>{show(resolvedAddress)}</p></div>
                  </div>
                </div>
                <div className='rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:shadow-[0_8px_18px_rgba(13,71,161,0.12)]'>
                  <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiUser className='h-4 w-4 text-[#2563eb]' /> Ownership Details</h3>
                  <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div><p className={label}>Owner Name(s)</p><p className={value}>{show(r.name)}</p></div>
                    <div><p className={label}>Ownership Type</p><p className={value}>Single</p></div>
                    <div><p className={label}>Share Percentage</p><p className={value}>100%</p></div>
                    <div><p className={label}>Ownership Status</p><p className={value}>{ownershipStatus}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-[#cfe0ff] bg-gradient-to-br from-white to-[#f8fbff] p-4 shadow-[0_10px_22px_rgba(15,63,150,0.08)] transition hover:shadow-[0_14px_26px_rgba(15,63,150,0.14)]'>
              <div className='mb-4 rounded-xl border border-[#dbe7ff] bg-white p-4'>
                <h3 className='mb-3 text-sm font-semibold text-[#1e293b]'>Land Record History (Ownership Side)</h3>
                {ownershipDisplayRows.length === 0 ? (
                  <p className='text-sm text-[#8c8c8c]'>No ownership-side transfer/utilization history available.</p>
                ) : (
                  <div className='overflow-x-auto rounded-lg border border-[#d9d9d9]'>
                    <table className='min-w-[1240px] w-full border-collapse'>
                      <thead>
                        <tr>
                          <th className={th}>Date</th>
                          <th className={th}>Action</th>
                          <th className={th}>From (Source Side)</th>
                          <th className={th}>To (Destination Side)</th>
                          <th className={th}>Transferred (sq.m)</th>
                          <th className={th}>Utilized (sq.m)</th>
                          <th className={th}>Source Balance After</th>
                          <th className={th}>Destination Balance After</th>
                          <th className={th}>Blockchain Tx Hash</th>
                          <th className={th}>Block</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownershipDisplayRows.map((row, idx) => (
                          <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'}>
                            <td className={td}>{show(row.date)}</td>
                            <td className={td}>
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                  row.action === 'TRANSFER'
                                    ? 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]'
                                    : 'border-[#ffd591] bg-[#fff7e6] text-[#ad6800]'
                                }`}
                              >
                                {row.action}
                              </span>
                            </td>
                            <td className={td}>{show(row.fromParty)}</td>
                            <td className={td}>{show(row.toParty)}</td>
                            <td className={td}>{row.movedArea.toLocaleString('en-IN')}</td>
                            <td className={td}>{row.utilizedArea.toLocaleString('en-IN')}</td>
                            <td className={td}>{row.sourceBalanceAfter.toLocaleString('en-IN')}</td>
                            <td className={td}>{row.destinationBalanceAfter.toLocaleString('en-IN')}</td>
                            <td className={`${td} font-mono text-xs break-all`}>{show(row.txHash)}</td>
                            <td className={td}>{show(row.block)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiShield className='h-4 w-4 text-[#2563eb]' /> Blockchain Snapshot</h3>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${ledger.blockchainVerified ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]' : 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'}`}>
                  {ledger.blockchainVerified ? 'Verified' : 'Tampered'}
                </span>
              </div>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5'>
                <div><p className={label}>Transaction Hash</p><p className={`${value} font-mono text-xs`}>{shortHash(ledger.blockchainTxHash)}</p></div>
                <div><p className={label}>Block Number</p><p className={value}>{ledger.blockNumber}</p></div>
                <div><p className={label}>Network Name</p><p className={value}>Hyperledger Fabric</p></div>
                <div><p className={label}>Smart Contract</p><p className={value}>TDRLedgerContract</p></div>
                <div><p className={label}>Validation</p><p className={value}>{ledger.blockchainVerified ? 'Verified' : 'Tampered'}</p></div>
              </div>
              <div className='mt-3'>
                <button
                  type='button'
                  onClick={() => setVerifyResult(ledger.blockchainTxHash.slice(0, 6) === currentHash.slice(0, 6) ? 'verified' : 'tampered')}
                  className='inline-flex items-center gap-2 rounded-md border border-[#2563eb] bg-[#eff6ff] px-3 py-1.5 text-sm font-semibold text-[#1d4ed8] hover:bg-[#dbeafe]'
                >
                  <FiShield className='h-4 w-4' /> Verify on Blockchain
                </button>
                {verificationBadge ? <span className={`ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${verificationBadge.cls}`}>{verificationBadge.icon}{verificationBadge.txt}</span> : null}
              </div>
            </div>

            <div className='rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_22px_rgba(15,63,150,0.06)] transition hover:shadow-[0_12px_24px_rgba(15,63,150,0.12)]'>
              <h3 className='mb-3 text-sm font-semibold text-[#1e293b]'>Recent Activity</h3>
              <div className='space-y-2'>
                {miniTimeline.length === 0 ? (
                  <p className='text-sm text-[#8c8c8c]'>No recent activities available.</p>
                ) : (
                  miniTimeline.map((h, idx) => (
                    <div key={`mini-${h.id}-${idx}`} className='flex items-start justify-between rounded-lg border border-[#dbe7ff] bg-[#f8fbff] px-3 py-2'>
                      <div className='flex items-start gap-2'>
                        <span className='mt-0.5 text-[#52c41a]'><FiCheckCircle className='h-4 w-4' /></span>
                        <div>
                          <p className='text-sm font-medium text-[#262626]'>{h.label}</p>
                          <p className='text-xs text-[#8c8c8c]'>{h.actor}</p>
                        </div>
                      </div>
                      <p className='text-xs text-[#8c8c8c]'>{h.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'land' ? (
          <div className='mt-5 space-y-4'>
            <div className='rounded-2xl border border-[#cfe0ff] bg-gradient-to-r from-[#f7fbff] to-white p-4 shadow-[0_8px_20px_rgba(15,63,150,0.08)]'>
              <h3 className='mb-3 text-sm font-semibold text-[#1e293b]'>Land Movement History (DRC 5,000 Breakup)</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                <div className='rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3'>
                  <p className={label}>Initial DRC Land</p>
                  <p className={value}>{r.issuedArea.toLocaleString('en-IN')} sq.m</p>
                </div>
                <div className='rounded-lg border border-[#91d5ff] bg-[#e6f7ff] p-3'>
                  <p className={label}>Total Transferred</p>
                  <p className={`${value} text-[#0050b3]`}>
                    {landMovementRows.reduce((sum, row) => sum + row.transferred, 0).toLocaleString('en-IN')} sq.m
                  </p>
                </div>
                <div className='rounded-lg border border-[#ffd591] bg-[#fff7e6] p-3'>
                  <p className={label}>Total Utilized</p>
                  <p className={`${value} text-[#ad6800]`}>
                    {landMovementRows.reduce((sum, row) => sum + row.utilized, 0).toLocaleString('en-IN')} sq.m
                  </p>
                </div>
                <div className='rounded-lg border border-[#b7eb8f] bg-[#f6ffed] p-3'>
                  <p className={label}>Current Remaining</p>
                  <p className={`${value} text-[#237804]`}>{r.balanceArea.toLocaleString('en-IN')} sq.m</p>
                </div>
              </div>

              <div className='mt-3 overflow-x-auto rounded-lg border border-[#d9d9d9]'>
                <table className='min-w-[1260px] w-full border-collapse'>
                  <thead>
                    <tr>
                      <th className={th}>Step</th>
                      <th className={th}>Date</th>
                      <th className={th}>Action</th>
                      <th className={th}>By (Kisne)</th>
                      <th className={th}>To / Use (Kaha/Kisko)</th>
                      <th className={th}>Transferred</th>
                      <th className={th}>Utilized</th>
                      <th className={th}>Remaining Land</th>
                      <th className={th}>Txn No</th>
                      <th className={th}>Blockchain Hash</th>
                      <th className={th}>Block</th>
                    </tr>
                  </thead>
                  <tbody>
                    {landMovementRows.map((row, idx) => (
                      <tr key={`land-move-${row.id}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'}>
                        <td className={td}>{row.seq}</td>
                        <td className={td}>{row.date}</td>
                        <td className={td}>
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                              row.action === 'START'
                                ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
                                : row.action === 'TRANSFER'
                                  ? 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]'
                                  : 'border-[#ffd591] bg-[#fff7e6] text-[#ad6800]'
                            }`}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className={td}>{row.actor}</td>
                        <td className={td}>{row.target}</td>
                        <td className={td}>{row.transferred.toLocaleString('en-IN')} sq.m</td>
                        <td className={td}>{row.utilized.toLocaleString('en-IN')} sq.m</td>
                        <td className={`${td} font-semibold`}>{row.remaining.toLocaleString('en-IN')} sq.m</td>
                        <td className={`${td} font-mono`}>{row.txNo}</td>
                        <td className={`${td} font-mono text-xs break-all`}>{row.txHash}</td>
                        <td className={td}>{row.block}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <div className='rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_20px_rgba(15,63,150,0.08)]'>
              <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiMapPin className='h-4 w-4 text-[#2563eb]' /> Land Details</h3>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div><p className={label}>Land ID</p><p className={`${value} font-mono`}>LAND-{r.sno}</p></div>
                <div><p className={label}>Survey / Khasra Number</p><p className={value}>{show(resolvedKhasra)}</p></div>
                <div><p className={label}>Plot Number</p><p className={value}>{show(resolvedZoneSector)}</p></div>
                <div><p className={label}>Area (sq.m)</p><p className={value}>{landSqm.toLocaleString('en-IN')}</p></div>
                <div><p className={label}>Area (hectare)</p><p className={value}>{hectare}</p></div>
                <div><p className={label}>Land Type</p><p className={value}>{show(resolvedLandUse)}</p></div>
                <div><p className={label}>Issued TDR Area (sq.m)</p><p className={value}>{r.issuedArea.toLocaleString('en-IN')}</p></div>
                <div><p className={label}>Available Balance Area (sq.m)</p><p className={value}>{r.balanceArea.toLocaleString('en-IN')}</p></div>
                <div><p className={label}>Utilized Area (sq.m)</p><p className={value}>{utilizedSqm.toLocaleString('en-IN')}</p></div>
                <div><p className={label}>Utilization Percentage</p><p className={value}>{utilizedPct}%</p></div>
                <div><p className={label}>Permissible FSI</p><p className={value}>{show(resolvedPermissibleFsi)}</p></div>
                <div><p className={label}>Base FSI Consumed</p><p className={value}>{show(resolvedBaseFsiConsumed)}</p></div>
                <div className='sm:col-span-2'><p className={label}>Additional TDR Permissible</p><p className={value}>{show(resolvedAdditionalTdrPermissible)}</p></div>
                <div><p className={label}>TDR Factor</p><p className={value}>{show(r.tdrFactor)}</p></div>
                <div><p className={label}>Market Value (per sq.m)</p><p className={value}>Rs. {r.marketValue.toLocaleString('en-IN')}</p></div>
              </div>
            </div>
            <div className='rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_20px_rgba(15,63,150,0.08)]'>
              <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiMapPin className='h-4 w-4 text-[#2563eb]' /> Location Details</h3>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div><p className={label}>State</p><p className={value}>Madhya Pradesh</p></div>
                <div><p className={label}>District</p><p className={value}>{show(resolvedDistrict)}</p></div>
                <div><p className={label}>Tehsil / Block</p><p className={value}>{show(resolvedTehsil)}</p></div>
                <div><p className={label}>Village / Ward</p><p className={value}>{show(resolvedVillage)}</p></div>
                <div className='sm:col-span-2'><p className={label}>Full Address</p><p className={value}>{show(resolvedAddress)}</p></div>
              </div>
            </div>
            <div className='rounded-2xl border border-[#cfe0ff] bg-gradient-to-r from-[#f7fbff] to-white p-4 shadow-[0_8px_20px_rgba(15,63,150,0.08)] lg:col-span-2'>
              <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiShield className='h-4 w-4 text-[#2563eb]' /> Land Status</h3>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div><p className={label}>Current Status</p><p className={value}>{r.balanceArea > 0 ? 'Free / Active' : 'Utilized / Closed'}</p></div>
                <div><p className={label}>Encumbrance Details</p><p className={value}>{resolvedBaseFsiConsumed ? `No active legal hold; Base FSI consumed: ${resolvedBaseFsiConsumed}` : NA}</p></div>
                <div><p className={label}>Govt Acquisition Status</p><p className={value}>Processed under TDR workflow</p></div>
              </div>
            </div>
            </div>
          </div>
        ) : null}

        {tab === 'ownership' ? (
          <div className='mt-5 space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <div className='rounded-xl border border-[#dbe7ff] bg-white p-3'>
                <p className={label}>Owner</p>
                <p className='mt-1 text-sm font-semibold text-[#1e293b]'>{show(r.name)}</p>
              </div>
              <div className='rounded-xl border border-[#cfe0ff] bg-[#f5f9ff] p-3'>
                <p className={label}>Ownership Type</p>
                <p className='mt-1 text-sm font-semibold text-[#1d4ed8]'>Single</p>
              </div>
              <div className='rounded-xl border border-[#b7eb8f] bg-[#f6ffed] p-3'>
                <p className={label}>Current Ownership Remaining</p>
                <p className='mt-1 text-sm font-semibold text-[#237804]'>{ownerRemainingSummary.currentRemaining.toLocaleString('en-IN')} sq.m</p>
              </div>
              <div className='rounded-xl border border-[#dbe7ff] bg-white p-3'>
                <p className={label}>Ownership % Remaining</p>
                <p className='mt-1 text-sm font-semibold text-[#1e293b]'>{ownerRemainingSummary.ownershipPercent}%</p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <div className='rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_20px_rgba(15,63,150,0.08)]'>
              <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiUser className='h-4 w-4 text-[#2563eb]' /> Ownership Details</h3>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div><p className={label}>Owner Name(s)</p><p className={value}>{show(r.name)}</p></div>
                <div><p className={label}>Father/Husband Name</p><p className={value}>{show(resolvedFatherOrHusbandName)}</p></div>
                <div><p className={label}>Ownership Type</p><p className={value}>Single</p></div>
                <div><p className={label}>Share Percentage</p><p className={value}>100%</p></div>
                <div><p className={label}>Ownership Status</p><p className={value}>{ownershipStatus}</p></div>
                <div><p className={label}>Contact</p><p className={value}>{show(resolvedMobileNo)}</p></div>
                <div><p className={label}>Holder Samagra ID</p><p className={`${value} font-mono`}>{show(r.holderSamagraId)}</p></div>
                <div><p className={label}>Primary City</p><p className={value}>{show(r.city)}</p></div>
                <div><p className={label}>Transferred by Owner (Total)</p><p className={value}>{ownerRemainingSummary.totalTransferredByOwner.toLocaleString('en-IN')} sq.m</p></div>
                <div><p className={label}>Utilized by Owner (Total)</p><p className={value}>{ownerRemainingSummary.totalUtilizedByOwner.toLocaleString('en-IN')} sq.m</p></div>
                <div><p className={label}>Ownership Status</p><p className={value}>{ownershipStatus}</p></div>
                <div><p className={label}>Last Ownership Update</p><p className={value}>{ownerRemainingSummary.lastUpdatedOn}</p></div>
              </div>
            </div>
            <div className='rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_20px_rgba(15,63,150,0.08)]'>
              <h3 className='inline-flex items-center gap-2 text-sm font-semibold text-[#1e293b]'><FiFileText className='h-4 w-4 text-[#2563eb]' /> Registration / Transfer Details</h3>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div><p className={label}>Previous Owner Name</p><p className={value}>{r.parentApplicationId ? 'From previous DRC in chain' : NA}</p></div>
                <div><p className={label}>Transfer Type</p><p className={value}>{transferType}</p></div>
                <div><p className={label}>Parent Application ID</p><p className={`${value} font-mono`}>{show(r.parentApplicationId)}</p></div>
                <div><p className={label}>Linked Application ID</p><p className={`${value} font-mono`}>{show(r.applicationId)}</p></div>
                <div><p className={label}>Issue Transaction No</p><p className={`${value} font-mono`}>{show(r.issueTransactionNo)}</p></div>
                <div><p className={label}>Transfer Entries</p><p className={value}>{ledger.saleTransferDetails.length}</p></div>
                <div><p className={label}>Utilized Area (sq.m)</p><p className={value}>{utilizedSqm.toLocaleString('en-IN')}</p></div>
                <div><p className={label}>Remaining Balance (sq.m)</p><p className={value}>{r.balanceArea.toLocaleString('en-IN')}</p></div>
              </div>
            </div>
            </div>
          </div>
        ) : null}

        {tab === 'transfer' ? (
          <div className='mt-4 space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <div className='rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3'>
                <p className={label}>Original DRC Value</p>
                <p className={value}>{originalDrcValue.toLocaleString('en-IN')} sq.m</p>
              </div>
              <div className='rounded-lg border border-[#ffd591] bg-[#fff7e6] p-3'>
                <p className={label}>Total Utilized</p>
                <p className={`${value} text-[#ad6800]`}>{totalUtilizedFromRecords.toLocaleString('en-IN')} sq.m</p>
              </div>
              <div className='rounded-lg border border-[#91d5ff] bg-[#e6f7ff] p-3'>
                <p className={label}>Total Transferred</p>
                <p className={`${value} text-[#0050b3]`}>{totalTransferred.toLocaleString('en-IN')} sq.m</p>
              </div>
              <div className='rounded-lg border border-[#b7eb8f] bg-[#f6ffed] p-3'>
                <p className={label}>Current Remaining Balance (LIVE)</p>
                <p className={`${value} font-bold text-[#237804]`}>{currentRemainingLive.toLocaleString('en-IN')} sq.m</p>
              </div>
            </div>

            <div className={card}>
              <div className='mb-3 flex items-center justify-between gap-2'>
                <h3 className='text-sm font-semibold text-[#262626]'>Transfer Summary</h3>
                <span className='rounded-full border border-[#d9f7be] bg-[#f6ffed] px-2 py-0.5 text-xs font-semibold text-[#237804]'>
                  Latest Remaining: {transferRows.length > 0 ? transferRows[transferRows.length - 1].remainingAfter.toLocaleString('en-IN') : r.balanceArea.toLocaleString('en-IN')} sq.m
                </span>
              </div>
              {transferRows.length === 0 ? (
                <p className='text-sm text-[#8c8c8c]'>No transfer records available.</p>
              ) : (
                <div className='overflow-x-auto rounded-lg border border-[#d9d9d9]'>
                  <table className='min-w-[1100px] w-full border-collapse'>
                    <thead>
                      <tr>
                        <th className={th}>Transfer ID</th>
                        <th className={th}>Date</th>
                        <th className={th}>From Owner</th>
                        <th className={th}>To Owner</th>
                        <th className={th}>Transferred Amount</th>
                        <th className={th}>Remaining Balance</th>
                        <th className={th}>Status</th>
                        <th className={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferRows.map((row, idx) => (
                        <tr
                          key={row.transferId}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'} cursor-pointer hover:bg-[#f0faff]`}
                          onClick={() => setSelectedTransferId(row.transferId)}
                        >
                          <td className={`${td} font-mono`}>{row.transferId}</td>
                          <td className={td}>{row.date}</td>
                          <td className={td}>{row.fromOwner}</td>
                          <td className={`${td} text-[#1890ff] underline`}>{row.toOwner}</td>
                          <td className={td}>{row.transferredAmount.toLocaleString('en-IN')} sq.m</td>
                          <td className={`${td} font-semibold`}>{row.remainingAfter.toLocaleString('en-IN')} sq.m</td>
                          <td className={td}>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${row.status === 'Success' ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]' : 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className={td}>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTransferId(row.transferId)
                              }}
                              className='rounded border border-[#1890ff] px-2 py-1 text-xs font-medium text-[#1890ff] hover:bg-[#e6f7ff]'
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={card}>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Value Change Timeline</h3>
              <div className='space-y-2'>
                {transferRows.length === 0 ? (
                  <p className='text-sm text-[#8c8c8c]'>No transfer timeline entries yet.</p>
                ) : (
                  transferRows.map((row) => (
                    <div key={`timeline-${row.transferId}`} className='rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 py-2'>
                      <p className='text-sm text-[#262626]'>
                        <strong>[{row.date}]</strong> Transferred {row.transferredAmount.toLocaleString('en-IN')} from {row.fromOwner} to {row.toOwner}
                      </p>
                      <p className='text-xs text-[#595959]'>Balance: {row.previousBalance.toLocaleString('en-IN')} {'->'} {row.remainingAfter.toLocaleString('en-IN')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedTransfer ? (
              <div className='fixed inset-0 z-50 flex items-center justify-end bg-black/40 p-0' role='dialog' aria-modal='true' onClick={() => setSelectedTransferId(null)}>
                <div
                  className='h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl transition-all duration-300 ease-out'
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='mb-4 flex items-start justify-between border-b border-[#f0f0f0] pb-3'>
                    <div>
                      <p className='text-base font-semibold text-[#262626]'>Transfer Detail View</p>
                      <p className='text-xs text-[#8c8c8c]'>Transfer ID: {selectedTransfer.transferId}</p>
                    </div>
                    <button type='button' className='rounded border border-[#d9d9d9] px-2 py-1 text-xs text-[#595959]' onClick={() => setSelectedTransferId(null)}>Close</button>
                  </div>

                  <div className='space-y-4'>
                    <div className={card}>
                      <h4 className='text-sm font-semibold text-[#262626]'>Transfer Information</h4>
                      <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        <div><p className={label}>Transfer ID</p><p className={`${value} font-mono`}>{selectedTransfer.transferId}</p></div>
                        <div><p className={label}>Date & Time</p><p className={value}>{selectedTransfer.dateTime}</p></div>
                        <div><p className={label}>Transaction Hash</p><a className={`${value} block font-mono text-xs text-[#1890ff] hover:underline`} target='_blank' rel='noopener noreferrer' href={getBlockchainTxExplorerUrl(selectedTransfer.txHash) ?? '#'}>{selectedTransfer.txHash}</a></div>
                        <div><p className={label}>Block Number</p><p className={value}>{selectedTransfer.block}</p></div>
                        <div><p className={label}>Smart Contract</p><p className={value}>TDRLedgerContract</p></div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                      <div className={card}>
                        <h4 className='text-sm font-semibold text-[#262626]'>Sender Details</h4>
                        <div className='mt-3 space-y-2'>
                          <p className='text-sm text-[#262626]'><span className={label}>From Owner</span><br />{selectedTransfer.fromOwner}</p>
                          <p className='text-sm text-[#262626]'><span className={label}>Ownership Type</span><br />Existing</p>
                          <p className='text-sm text-[#262626]'><span className={label}>Previous Balance</span><br />{selectedTransfer.previousBalance.toLocaleString('en-IN')} sq.m</p>
                        </div>
                      </div>
                      <div className={card}>
                        <h4 className='text-sm font-semibold text-[#262626]'>Receiver Details</h4>
                        <div className='mt-3 space-y-2'>
                          <p className='text-sm text-[#262626]'><span className={label}>To Owner</span><br />{selectedTransfer.toOwner}</p>
                          <p className='text-sm text-[#262626]'><span className={label}>Father / Organization</span><br />{show(resolvedFatherOrHusbandName) === NA ? `${selectedTransfer.toOwner} Holdings` : show(resolvedFatherOrHusbandName)}</p>
                          <p className='text-sm text-[#262626]'><span className={label}>Address</span><br />{show(resolvedAddress)}</p>
                          <p className='text-sm text-[#262626]'><span className={label}>Ownership Type</span><br />{r.parentApplicationId ? 'Existing' : 'New'}</p>
                          <p className='text-sm text-[#262626]'><span className={label}>Wallet / User ID</span><br /><span className='font-mono text-xs'>{`WALLET-${String(r.applicationId ?? r.sno).replace(/[^a-zA-Z0-9]/g, '')}`}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className={card}>
                      <h4 className='text-sm font-semibold text-[#262626]'>Transfer Value Details</h4>
                      <p className='mt-2 text-sm text-[#262626]'>
                        <strong>{selectedTransfer.previousBalance.toLocaleString('en-IN')}</strong> {'->'} <strong>{selectedTransfer.transferredAmount.toLocaleString('en-IN')}</strong> {'->'} <strong>{selectedTransfer.remainingAfter.toLocaleString('en-IN')}</strong>
                      </p>
                      <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                        <div><p className={label}>Transferred Amount</p><p className={value}>{selectedTransfer.transferredAmount.toLocaleString('en-IN')} sq.m</p></div>
                        <div><p className={label}>Previous Balance</p><p className={value}>{selectedTransfer.previousBalance.toLocaleString('en-IN')} sq.m</p></div>
                        <div><p className={label}>New Balance</p><p className={`${value} font-semibold`}>{selectedTransfer.remainingAfter.toLocaleString('en-IN')} sq.m</p></div>
                      </div>
                    </div>

                    <div className={card}>
                      <h4 className='text-sm font-semibold text-[#262626]'>Ownership Update</h4>
                      <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        <div><p className={label}>Current Owner After Transfer</p><p className={value}>{currentOwnerAfterTransfer}</p></div>
                        <div><p className={label}>Ownership Share Distribution</p><p className={value}>{`${((selectedTransfer.transferredAmount / Math.max(1, selectedTransfer.previousBalance)) * 100).toFixed(1)}% transferred`}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'blockchain' ? (
          <div className='mt-4 space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <div className='rounded-lg border border-[#d9f7be] bg-[#f6ffed] p-3'>
                <p className={label}>Overall Chain Status</p>
                <p className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${ledger.blockchainVerified ? 'text-[#237804]' : 'text-[#a8071a]'}`}>
                  {ledger.blockchainVerified ? <FiCheckCircle className='h-4 w-4' /> : <FiXCircle className='h-4 w-4' />}
                  {ledger.blockchainVerified ? 'Verified' : 'Tampered'}
                </p>
              </div>
              <div className='rounded-lg border border-[#bae7ff] bg-[#e6f7ff] p-3'>
                <p className={label}>Connected Anchors</p>
                <p className='mt-1 text-sm font-semibold text-[#0050b3]'>
                  {1 + (ledger.transferAnchor ? 1 : 0) + (utilizationCount > 0 ? 1 : 0)}
                </p>
              </div>
              <div className='rounded-lg border border-[#ffd591] bg-[#fff7e6] p-3'>
                <p className={label}>Latest Block (known)</p>
                <p className='mt-1 text-sm font-semibold text-[#ad6800]'>
                  {ledger.transferAnchor ? ledger.transferAnchor.blockNumber : ledger.blockNumber}
                </p>
              </div>
              <div className='rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3'>
                <p className={label}>Transfer Chain Status</p>
                <p className='mt-1 text-sm font-semibold text-[#262626]'>
                  {ledger.transferAnchor ? `Connected (${transferCount} transfer)` : 'No transfer anchor'}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5'>
              <div className='lg:col-span-2'><p className={label}>Transaction Hash</p><p className={`${value} break-all font-mono text-xs`}>{ledger.blockchainTxHash}</p></div>
              <div><p className={label}>Block Number</p><p className={`${value} font-mono`}>{ledger.blockNumber}</p></div>
              <div><p className={label}>Smart Contract</p><p className={value}>TDRLedgerContract</p></div>
              <div><p className={label}>Network</p><p className={value}>Hyperledger Fabric</p></div>
            </div>

            <div className='overflow-x-auto rounded-lg border border-[#d9d9d9]'>
              <table className='min-w-[920px] w-full border-collapse'>
                <thead>
                  <tr>
                    <th className={th}>Event</th>
                    <th className={th}>Linked Data</th>
                    <th className={th}>Tx Hash</th>
                    <th className={th}>Block</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='bg-white'>
                    <td className={td}>Issuance Anchor</td>
                    <td className={td}>Certificate {r.certificateNo} | App {show(r.applicationId)}</td>
                    <td className={`${td} font-mono text-xs break-all`}>{ledger.blockchainTxHash}</td>
                    <td className={td}>{ledger.blockNumber}</td>
                    <td className={td}><span className='inline-flex rounded-full border border-[#b7eb8f] bg-[#f6ffed] px-2 py-0.5 text-xs font-semibold text-[#237804]'>Confirmed</span></td>
                  </tr>
                  <tr className='bg-[#fcfcff]'>
                    <td className={td}>Transfer Anchor</td>
                    <td className={td}>{ledger.transferAnchor ? `Transfer mapped from ${show(r.issueTransactionNo)} (Dr.) to recorded counterparty` : 'No transfer linked yet'}</td>
                    <td className={`${td} font-mono text-xs break-all`}>{ledger.transferAnchor ? ledger.transferAnchor.txHash : NA}</td>
                    <td className={td}>{ledger.transferAnchor ? ledger.transferAnchor.blockNumber : NA}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${ledger.transferAnchor ? 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]' : 'border-[#d9d9d9] bg-[#fafafa] text-[#595959]'}`}>
                        {ledger.transferAnchor ? 'Connected' : 'Not available'}
                      </span>
                    </td>
                  </tr>
                  <tr className='bg-white'>
                    <td className={td}>Utilization Linkage</td>
                    <td className={td}>Issued {r.issuedArea.toLocaleString('en-IN')} | Utilized {utilizedSqm.toLocaleString('en-IN')} ({utilizationCount} records) | Balance {r.balanceArea.toLocaleString('en-IN')}</td>
                    <td className={`${td} font-mono text-xs break-all`}>{ledger.transferAnchor?.txHash ?? ledger.blockchainTxHash}</td>
                    <td className={td}>{ledger.transferAnchor?.blockNumber ?? ledger.blockNumber}</td>
                    <td className={td}>
                      <span className='inline-flex rounded-full border border-[#ffd591] bg-[#fff7e6] px-2 py-0.5 text-xs font-semibold text-[#ad6800]'>
                        {utilizedSqm > 0 ? 'Partially utilized' : 'Not utilized'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {ledger.transferAnchor ? (
              <div className='rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3'>
                <p className={label}>Transfer Transaction Hash</p>
                <p className={`${value} break-all font-mono text-xs`}>{ledger.transferAnchor.txHash}</p>
                <p className='mt-1 text-xs text-[#8c8c8c]'>Block #{ledger.transferAnchor.blockNumber}</p>
              </div>
            ) : null}

            <div className='flex flex-wrap items-center gap-3'>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${ledger.blockchainVerified ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]' : 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'}`}>
                {ledger.blockchainVerified ? <FiCheckCircle className='h-3.5 w-3.5' /> : <FiXCircle className='h-3.5 w-3.5' />}
                Validation Status: {ledger.blockchainVerified ? 'Valid' : 'Invalid'}
              </span>
              {txUrl ? <a className='inline-flex items-center gap-1 text-sm font-medium text-[#1890ff] hover:underline' href={txUrl} target='_blank' rel='noopener noreferrer'>Open Explorer <FiExternalLink className='h-3.5 w-3.5' /></a> : null}
            </div>

            <div className={card}>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Verification</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div><p className={label}>Stored Hash</p><p className={`${value} break-all font-mono text-xs`}>{ledger.blockchainTxHash}</p></div>
                <div><p className={label}>Current Hash (computed)</p><p className={`${value} break-all font-mono text-xs`}>{currentHash}</p></div>
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setVerifyResult(ledger.blockchainTxHash.slice(0, 6) === currentHash.slice(0, 6) ? 'verified' : 'tampered')}
                  className='inline-flex items-center gap-2 rounded-md border border-[#1890ff] bg-[#e6f7ff] px-3 py-1.5 text-sm font-medium text-[#1890ff] hover:bg-[#bae7ff]'
                >
                  <FiShield className='h-4 w-4' /> Verify on Blockchain
                </button>
                {verificationBadge ? <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${verificationBadge.cls}`}>{verificationBadge.icon}{verificationBadge.txt}</span> : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'documents' ? (
          <div className='mt-4 space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {[
                { name: 'Land Map / Naksha', file: `naksha-${r.sno}.pdf` },
                { name: 'DRC Certificate', file: `${r.certificateNo}.pdf` },
                { name: 'Supporting Documents', file: `supporting-${r.sno}.zip` },
              ].map((d) => (
                <div key={d.name} className='rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3'>
                  <p className='text-sm font-semibold text-[#262626]'>{d.name}</p>
                  <p className='mt-1 font-mono text-xs text-[#8c8c8c]'>{d.file}</p>
                  <div className='mt-3 flex gap-2'>
                    <button type='button' onClick={() => setActiveDoc(d)} className='rounded border border-[#1890ff] px-2 py-1 text-xs font-medium text-[#1890ff] hover:bg-[#e6f7ff]'>View</button>
                    <button type='button' className='inline-flex items-center gap-1 rounded border border-[#52c41a] px-2 py-1 text-xs font-medium text-[#237804] hover:bg-[#f6ffed]'><FiDownload className='h-3.5 w-3.5' />Download</button>
                  </div>
                </div>
              ))}
            </div>

            {activeDoc ? (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4' role='dialog' aria-modal='true' aria-label='Document preview' onClick={() => setActiveDoc(null)}>
                <div className='w-full max-w-2xl rounded-xl border border-[#d9d9d9] bg-white p-5 shadow-2xl' onClick={(e) => e.stopPropagation()}>
                  <div className='mb-4 flex items-start justify-between gap-3 border-b border-[#f0f0f0] pb-3'>
                    <div>
                      <p className='text-base font-semibold text-[#262626]'>Document Preview - {activeDoc.name}</p>
                      <p className='mt-0.5 font-mono text-xs text-[#8c8c8c]'>{activeDoc.file}</p>
                    </div>
                    <button type='button' onClick={() => setActiveDoc(null)} className='rounded border border-[#d9d9d9] bg-white px-2 py-1 text-xs text-[#595959] hover:border-[#1890ff] hover:text-[#1890ff]'>Close</button>
                  </div>
                  <div className='rounded-md border border-dashed border-[#69c0ff] bg-[#f0faff] p-4 text-sm text-[#262626]'>
                    <p className='font-semibold'>Preview Content</p>
                    <p className='mt-2'>Document Type: {activeDoc.name}</p>
                    <p>Application: {show(r.applicationId)}</p>
                    <p>Certificate: {r.certificateNo}</p>
                    <p>Owner: {show(r.name)}</p>
                    <p>Khasra: {show(resolvedKhasra)}</p>
                    <p className='mt-3 text-xs text-[#8c8c8c]'>Preview generated from current ledger context. Integrate backend file endpoint to load actual document binary.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'history' ? (
          <div className='mt-4 space-y-4'>
            <div className={card}>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>DRC Value Flow (Blockchain Ledger)</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                <div className='rounded-lg border border-[#d9d9d9] bg-[#fafafa] p-3'>
                  <p className={label}>DRC Start Value</p>
                  <p className={value}>{r.issuedArea.toLocaleString('en-IN')} sq.m</p>
                </div>
                <div className='rounded-lg border border-[#91d5ff] bg-[#e6f7ff] p-3'>
                  <p className={label}>Total Transferred</p>
                  <p className={`${value} text-[#0050b3]`}>{totalTransferred.toLocaleString('en-IN')} sq.m</p>
                </div>
                <div className='rounded-lg border border-[#ffd591] bg-[#fff7e6] p-3'>
                  <p className={label}>Total Utilized</p>
                  <p className={`${value} text-[#ad6800]`}>{totalUtilizedFromRecords.toLocaleString('en-IN')} sq.m</p>
                </div>
                <div className='rounded-lg border border-[#b7eb8f] bg-[#f6ffed] p-3'>
                  <p className={label}>Current Remaining</p>
                  <p className={`${value} text-[#237804]`}>{r.balanceArea.toLocaleString('en-IN')} sq.m</p>
                </div>
              </div>

              
            </div>

            <div className={card}>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Transaction History (Timeline)</h3>
              <div className='space-y-3'>
                {drillDownHistoryRows.map((h, i) => {
                  const txHref = getBlockchainTxExplorerUrl(h.txHash)
                  const isOpen = expandedHistoryEventId === h.id
                  return (
                    <div key={h.id} className='relative pl-7'>
                      <span className={`absolute left-0 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full ${h.type === 'START' ? 'bg-[#f6ffed] text-[#237804]' : h.type === 'TRANSFER' ? 'bg-[#e6f7ff] text-[#0050b3]' : 'bg-[#fff7e6] text-[#ad6800]'}`}>
                        {h.type === 'START' ? <FiCheckCircle className='h-3.5 w-3.5' /> : <FiClock className='h-3.5 w-3.5' />}
                      </span>
                      {i < drillDownHistoryRows.length - 1 ? <span className='absolute left-2.5 top-7 h-[calc(100%+8px)] w-px bg-[#d9d9d9]' /> : null}
                      <button
                        type='button'
                        onClick={() => setExpandedHistoryEventId((prev) => (prev === h.id ? null : h.id))}
                        className='w-full rounded-lg border border-[#e8e8e8] bg-white p-3 text-left hover:bg-[#fafafa]'
                      >
                        <p className='text-xs text-[#8c8c8c]'>{h.date}</p>
                        <p className='mt-0.5 text-sm font-semibold text-[#262626]'>
                          Step {h.step} · {h.type} · {h.qty.toLocaleString('en-IN')} sq.m
                        </p>
                        <p className='mt-1 text-xs text-[#595959]'>
                          {h.from} → {h.to} | Balance after: {h.balance.toLocaleString('en-IN')} sq.m
                        </p>
                        <p className='mt-1 text-xs text-[#595959]'>Remarks: {h.remarks}</p>
                        <div className='mt-1 text-xs text-[#595959]'>
                          Transaction Hash:{' '}
                          {txHref ? (
                            <a href={txHref} target='_blank' rel='noopener noreferrer' className='font-mono text-[#1890ff] hover:underline'>{h.txHash}</a>
                          ) : (
                            <span className='font-mono'>{h.txHash}</span>
                          )}
                        </div>
                        <p className='mt-1 text-xs text-[#8c8c8c]'>Click to {isOpen ? 'collapse' : 'expand'} details</p>
                      </button>
                      {isOpen ? (
                        <div className='mt-2 rounded-lg border border-[#dbe7ff] bg-[#f7fbff] p-3 text-xs text-[#334155]'>
                          <p className='mb-2 font-semibold text-[#1e293b]'>Timeline Details</p>
                          <ul className='list-disc space-y-1 pl-4'>
                            {h.details.map((line) => (
                              <li key={`${h.id}-${line}`}>{line}</li>
                            ))}
                            <li>Txn No: {h.txNo}</li>
                            <li>Block: {h.block}</li>
                            <li>Blockchain Status: Verified</li>
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              <div className='mt-4 overflow-x-auto rounded-lg border border-[#d9d9d9]'>
                <table className='min-w-[1180px] w-full border-collapse'>
                  <thead>
                    <tr>
                      <th className={th}>Step</th>
                      <th className={th}>Date</th>
                      <th className={th}>Type</th>
                      <th className={th}>From</th>
                      <th className={th}>To</th>
                      <th className={th}>Value Moved</th>
                      <th className={th}>Remaining</th>
                      <th className={th}>Txn No</th>
                      <th className={th}>Tx Hash</th>
                      <th className={th}>Block</th>
                      <th className={th}>Chain Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillDownHistoryRows.map((h, idx) => {
                      const txHref = getBlockchainTxExplorerUrl(h.txHash)
                      return (
                        <tr
                          key={`tbl-${h.id}`}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'} cursor-pointer hover:bg-[#f5f9ff]`}
                          onClick={() => setExpandedHistoryEventId((prev) => (prev === h.id ? null : h.id))}
                        >
                          <td className={td}>{h.step}</td>
                          <td className={td}>{h.date}</td>
                          <td className={td}>{h.type}</td>
                          <td className={td}>{h.from}</td>
                          <td className={td}>{h.to}</td>
                          <td className={td}>{h.qty.toLocaleString('en-IN')} sq.m</td>
                          <td className={`${td} font-semibold`}>{h.balance.toLocaleString('en-IN')} sq.m</td>
                          <td className={`${td} font-mono`}>{h.txNo}</td>
                          <td className={`${td} font-mono text-xs break-all`}>
                            {txHref ? (
                              <a href={txHref} target='_blank' rel='noopener noreferrer' className='text-[#1890ff] hover:underline'>
                                {h.txHash}
                              </a>
                            ) : (
                              h.txHash
                            )}
                          </td>
                          <td className={td}>{h.block}</td>
                          <td className={td}>
                            <span className='inline-flex rounded-full border border-[#b7eb8f] bg-[#f6ffed] px-2 py-0.5 text-xs font-semibold text-[#237804]'>
                              Verified
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className='mt-2 text-xs text-[#8c8c8c]'>Timeline aur table dono synced hain — kisi row par click karte hi ऊपर timeline details expand ho jayengi.</p>
            </div>

            <div className={card}>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Transfer Data</h3>
              {ledger.saleTransferDetails.length === 0 ? (
                <p className='text-sm text-[#8c8c8c]'>No transfer entries for this certificate.</p>
              ) : (
                <div className='overflow-x-auto rounded-lg border border-[#d9d9d9]'>
                  <table className='min-w-[980px] w-full border-collapse'>
                    <thead>
                      <tr>
                        <th className={th}>Txn No</th>
                        <th className={th}>Txn Date</th>
                        <th className={th}>Transferred By</th>
                        <th className={th}>Transferred To</th>
                        <th className={th}>Transferred Area</th>
                        <th className={th}>Balance After</th>
                        <th className={th}>Status</th>
                        <th className={th}>Chain Hash</th>
                        <th className={th}>Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.saleTransferDetails.map((t, idx) => (
                        <tr key={`${t.transactionNo}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'}>
                          <td className={`${td} font-mono`}>{show(t.transactionNo)}</td>
                          <td className={td}>{show(t.transactionDate)}</td>
                          <td className={td}>{show(t.holderName)}</td>
                          <td className={td}>{show(t.counterpartyName)}</td>
                          <td className={td}>{t.issuedArea.toLocaleString('en-IN')}</td>
                          <td className={td}>{t.balanceArea.toLocaleString('en-IN')}</td>
                          <td className={td}>
                            <span className='inline-flex rounded-full border border-[#b7eb8f] bg-[#f6ffed] px-2 py-0.5 text-xs font-semibold text-[#237804]'>
                              {show(t.status)}
                            </span>
                          </td>
                          <td className={`${td} font-mono text-xs break-all`}>{show(t.chainTxHash)}</td>
                          <td className={td}>{show(t.chainBlock)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={card}>
              <h3 className='mb-3 text-sm font-semibold text-[#262626]'>Utilization Data</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                <div className='rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3'>
                  <p className={label}>Issued (sq.m)</p>
                  <p className={value}>{r.issuedArea.toLocaleString('en-IN')}</p>
                </div>
                <div className='rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3'>
                  <p className={label}>Utilized (sq.m)</p>
                  <p className={value}>{utilizedSqm.toLocaleString('en-IN')}</p>
                </div>
                <div className='rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3'>
                  <p className={label}>Remaining (sq.m)</p>
                  <p className={value}>{r.balanceArea.toLocaleString('en-IN')}</p>
                </div>
                <div className='rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3'>
                  <p className={label}>Utilization %</p>
                  <p className={value}>{utilizedPct}%</p>
                </div>
              </div>
              {ledger.utilizationDetails.length > 0 ? (
                <div className='mt-3 overflow-x-auto rounded-lg border border-[#d9d9d9]'>
                  <table className='min-w-[980px] w-full border-collapse'>
                    <thead>
                      <tr>
                        <th className={th}>Txn No</th>
                        <th className={th}>Date</th>
                        <th className={th}>Recorded By</th>
                        <th className={th}>Utilized By</th>
                        <th className={th}>Amount</th>
                        <th className={th}>Balance</th>
                        <th className={th}>Status</th>
                        <th className={th}>Chain Hash</th>
                        <th className={th}>Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.utilizationDetails.map((u, idx) => (
                        <tr key={`${u.transactionNo}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'}>
                          <td className={`${td} font-mono`}>{show(u.transactionNo)}</td>
                          <td className={td}>{show(u.transactionDate)}</td>
                          <td className={td}>{show(u.holderName)}</td>
                          <td className={td}>{show(u.counterpartyName)}</td>
                          <td className={td}>{u.issuedArea.toLocaleString('en-IN')}</td>
                          <td className={td}>{u.balanceArea.toLocaleString('en-IN')}</td>
                          <td className={td}>
                            <span className='inline-flex rounded-full border border-[#91d5ff] bg-[#e6f7ff] px-2 py-0.5 text-xs font-semibold text-[#0050b3]'>
                              {show(u.status)}
                            </span>
                          </td>
                          <td className={`${td} font-mono text-xs break-all`}>{show(u.chainTxHash)}</td>
                          <td className={td}>{show(u.chainBlock)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='mt-3 text-sm text-[#8c8c8c]'>No separate utilization ledger rows available; utilization is derived from issued minus balance.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      <section className={card}>
        <Link to='/dashboard/certificates' className='text-sm font-medium text-[#1890ff] hover:underline'>Back to DRC Certificates</Link>
      </section>
    </div>
  )
}
