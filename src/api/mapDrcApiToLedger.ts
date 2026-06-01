import type { LedgerData, CertificateRecord, LedgerTransaction, BlockchainHistoryNode } from '../modules/dashboard/data/certificateLedgerData'
import { buildLedgerData } from '../modules/dashboard/data/certificateLedgerData'
import type { DrcApiComposite, Form6LedgerRowApi } from '../types/drcApiContracts'

function str(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v)
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/,/g, ''))
    return Number.isNaN(n) ? fallback : n
  }
  return fallback
}

function parseCrDr(row: Form6LedgerRowApi): 'Cr.' | 'Dr.' {
  const raw = str(row.credit_debit ?? row.creditDebit ?? row.cr_dr ?? '').toUpperCase()
  if (raw.includes('DR') || raw === 'D' || raw === 'DEBIT') return 'Dr.'
  if (raw.includes('CR') || raw === 'C' || raw === 'CREDIT') return 'Cr.'
  return 'Dr.'
}

function rowSno(row: Form6LedgerRowApi, index: number): number {
  const s = row.sno ?? row.Sno
  if (typeof s === 'number' && !Number.isNaN(s)) return s
  return index + 1
}

function form6ToLedgerTransactions(rows: Form6LedgerRowApi[], holderFallback: string): {
  issued: LedgerTransaction[]
  sale: LedgerTransaction[]
  util: LedgerTransaction[]
} {
  const issued: LedgerTransaction[] = []
  const sale: LedgerTransaction[] = []
  const util: LedgerTransaction[] = []

  rows.forEach((row, i) => {
    const cd = parseCrDr(row)
    const holder = str(row.holder_name ?? row.holderName ?? row.tdr_holder_name, holderFallback)
    const tx: LedgerTransaction = {
      sno: rowSno(row, i),
      transactionNo: str(row.transaction_no ?? row.transactionNo ?? row.trn_no, `TX-${i + 1}`),
      transactionDate: str(row.transaction_date ?? row.transactionDate ?? row.trn_date, '—'),
      holderName: holder,
      issuedArea: num(row.issued_area ?? row.issuedArea ?? row.issued_area_sq_mt),
      balanceArea: num(row.balance_area ?? row.balanceArea ?? row.balance_area_sq_mt),
      creditDebit: cd,
    }
    const h = str(row.chain_tx_hash ?? row.txHash, '')
    const b = row.block_number ?? row.blockNumber
    if (h) tx.chainTxHash = h
    if (typeof b === 'number' && !Number.isNaN(b)) tx.chainBlock = b

    if (cd === 'Cr.') issued.push(tx)
    else {
      const label = str(row.transaction_no ?? '').toUpperCase()
      if (label.includes('UTIL') || holder.toUpperCase().includes('UTIL')) util.push(tx)
      else sale.push(tx)
    }
  })

  return { issued, sale, util }
}

function statusToHistoryNode(
  applicationId: string,
  status: unknown,
  index: number,
): BlockchainHistoryNode | null {
  if (status == null || typeof status !== 'object') return null
  const s = status as Record<string, unknown>
  const st = str(s.status ?? s.Status ?? s.application_status)
  const at = str(s.updated_at ?? s.updatedAt ?? s.timestamp ?? '—')
  const actor = str(s.officer ?? s.actor ?? s.updated_by ?? 'Department')
  const remarks = str(s.remarks ?? s.Remarks ?? '')
  if (!st && !remarks) return null
  return {
    id: `api-status-${index}`,
    label: st ? `Application status: ${st}` : 'Application status update',
    timestamp: at,
    createdAt: at,
    txHash: `0xSTATUS${String(index).padStart(3, '0')}`,
    blockNumber: 125000 + index,
    status: 'VALID',
    actor,
    actionType: 'UPDATE',
    dataSnapshot: {
      applicationId,
      status: st || '—',
      remarks: remarks || '—',
    },
    notes: 'From /api/Department/GetApplicationStatus (or nested payload).',
  }
}

function extractStatusList(applicationStatus: unknown): unknown[] {
  if (applicationStatus == null) return []
  if (Array.isArray(applicationStatus)) return applicationStatus
  if (typeof applicationStatus !== 'object') return []
  const o = applicationStatus as Record<string, unknown>
  for (const k of ['history', 'History', 'timeline', 'Timeline', 'logs', 'Logs', 'rows', 'Rows']) {
    const v = o[k]
    if (Array.isArray(v)) return v
  }
  return [applicationStatus]
}

function appendApiHistoryGroup(base: BlockchainHistoryNode[], nodes: BlockchainHistoryNode[]): BlockchainHistoryNode[] {
  if (nodes.length === 0) return base
  const root = base[0]
  if (!root) return base
  const group: BlockchainHistoryNode = {
    id: 'api-read-history',
    label: `API-linked events (${nodes.length}) — Form 6 ledger & status`,
    timestamp: nodes[0]?.timestamp ?? '—',
    createdAt: nodes[0]?.createdAt ?? '—',
    txHash: '0xAPIBUNDLE',
    blockNumber: 100_001,
    status: 'VALID',
    actor: 'REST read APIs',
    actionType: 'UPDATE',
    dataSnapshot: {
      endpoints: 'GetForm6Leger, GetApplicationStatus, GetDRCList, GetDRCOwnerDetail',
    },
    notes: 'Grouped events mapped from backend JSON (queryRecord-style reads).',
    children: nodes,
  }
  return [{ ...root, children: [...(root.children ?? []), group] }]
}

/** Build a minimal {@link CertificateRecord} when the backend returns data but local demo seed has no row. */
export function buildCertificateRecordFromApi(applicationId: string, api: DrcApiComposite): CertificateRecord | null {
  if (!api.hadResponse) return null
  const drc = api.drcList[0]
  const owner = api.ownerDetail
  const form = api.form6Ledger[0]
  const hasStatus = extractStatusList(api.applicationStatus).length > 0
  if (!drc && !owner && api.form6Ledger.length === 0 && api.agencyApplication == null && !hasStatus) return null

  const issued = num(form?.issued_area ?? form?.issuedArea ?? form?.issued_area_sq_mt, 0)
  const bal = num(form?.balance_area ?? form?.balanceArea ?? form?.balance_area_sq_mt, issued)
  const sno = Math.abs(applicationId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 100_000 || 1

  let landFromAgency = 0
  if (api.agencyApplication && typeof api.agencyApplication === 'object') {
    const ag = api.agencyApplication as Record<string, unknown>
    landFromAgency = num(ag.land_area ?? ag.landArea ?? ag.proposed_area ?? ag.proposedArea, 0)
  }

  return {
    sno,
    name: str(owner?.ownernm ?? owner?.owner_name, 'Owner (API)'),
    city: '—',
    issuedArea: issued || landFromAgency || 0,
    balanceArea: bal,
    marketValue: num(drc?.tdr_value, 0),
    issueDate: str(form?.transaction_date ?? form?.transactionDate ?? form?.trn_date, new Date().toISOString().slice(0, 10)),
    certificateNo: str(drc?.drc_certificate_no ?? drc?.drcCertificateNo, `DRC/${applicationId}`),
    issueTransactionNo: str(drc?.drc_receipt_no ?? drc?.drc_file_no, 'API'),
    applicationId,
    holderSamagraId: str(owner?.owner_samagra, '') || undefined,
  }
}

/**
 * Merges API composite into static certificate record: ledger tables + extended history from API JSON.
 */
export function mergeApiCompositeIntoLedger(baseRecord: CertificateRecord, api: DrcApiComposite | null): LedgerData {
  const base = buildLedgerData(baseRecord)
  if (!api || !api.hadResponse) return base

  if (api.form6Ledger.length === 0) {
    const statusList = extractStatusList(api.applicationStatus)
    const statusNodes = statusList
      .map((item, i) => statusToHistoryNode(str(baseRecord.applicationId), item, i))
      .filter((n): n is BlockchainHistoryNode => n != null)
    if (statusNodes.length === 0) return base
    return {
      ...base,
      historyTree: appendApiHistoryGroup(base.historyTree, statusNodes),
    }
  }

  const holderFallback = baseRecord.name
  const { issued, sale, util } = form6ToLedgerTransactions(api.form6Ledger, holderFallback)

  const issuedDetails = issued.length > 0 ? issued : base.issuedDetails
  const saleTransferDetails = sale.length > 0 ? sale : base.saleTransferDetails
  const utilizationDetails = util.length > 0 ? util : base.utilizationDetails

  const form6Nodes: BlockchainHistoryNode[] = api.form6Ledger.map((row, i) => {
    const cd = parseCrDr(row)
    const snap: Record<string, string | number> = {}
    Object.entries(row).forEach(([k, v]) => {
      if (v != null && v !== '') snap[k] = typeof v === 'number' ? v : String(v)
    })
    return {
      id: `form6-${i}`,
      label: `Form 6 ledger · ${cd === 'Cr.' ? 'Credit' : 'Debit'} (${str(row.transaction_no ?? row.transactionNo, `#${i + 1}`)})`,
      timestamp: str(row.transaction_date ?? row.transactionDate ?? row.trn_date, '—'),
      createdAt: str(row.transaction_date ?? row.transactionDate ?? row.trn_date, '—'),
      txHash: str(row.chain_tx_hash ?? row.txHash, `0xFORM6${String(i).padStart(4, '0')}`),
      blockNumber: num(row.block_number ?? row.blockNumber, 115000 + i),
      status: cd === 'Cr.' ? 'VALID' : 'TRANSFERRED',
      actor: 'Ledger (API)',
      actionType: cd === 'Cr.' ? 'CREATE' : 'TRANSFER',
      dataSnapshot: snap,
      notes: 'Row from /api/Agency/GetForm6Leger response.',
    }
  })

  const statusList = extractStatusList(api.applicationStatus)
  const statusNodes = statusList
    .map((item, i) => statusToHistoryNode(str(baseRecord.applicationId), item, i))
    .filter((n): n is BlockchainHistoryNode => n != null)

  const chainNodes = [...form6Nodes, ...statusNodes]
  const historyTree = chainNodes.length > 0 ? appendApiHistoryGroup(base.historyTree, chainNodes) : base.historyTree

  const drc = api.drcList[0]
  let blockchainTxHash = base.blockchainTxHash
  let blockNumber = base.blockNumber
  if (drc?.drc_certificate_no || drc?.drcCertificateNo) {
    const cert = str(drc.drc_certificate_no ?? drc.drcCertificateNo)
    if (cert) {
      const h = Array.from(cert).reduce((acc, c) => acc + c.charCodeAt(0), 0)
      blockchainTxHash = `0xDRC${(baseRecord.sno + h).toString(16).toUpperCase().slice(0, 12)}`
      blockNumber = base.blockNumber + (h % 1000)
    }
  }

  let transferAnchor = base.transferAnchor
  if (saleTransferDetails.length > 0) {
    const lastSale = saleTransferDetails[saleTransferDetails.length - 1]!
    if (lastSale.chainTxHash && lastSale.chainBlock != null) {
      transferAnchor = { txHash: lastSale.chainTxHash, blockNumber: lastSale.chainBlock }
    }
  }

  return {
    ...base,
    issuedDetails,
    saleTransferDetails,
    utilizationDetails,
    historyTree,
    blockchainTxHash,
    blockNumber,
    transferAnchor,
  }
}
