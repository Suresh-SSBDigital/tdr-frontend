import { MarkerType, type Edge } from '@xyflow/react'

export type RidHistoryApplication = {
  application_id: string
  tdrApplicationId?: string
  samagra_id?: string
  owner_name?: string
  status?: string
  source_application_id?: string
  transferred_from_owner?: string
  transfer_txId?: string
  total_area?: number
  remaining_area?: number
  utilized_area?: number
  transferred_area?: number
  total_tdr_value?: number
  remaining_tdr_value?: number
  utilized_tdr_value?: number
  transferred_tdr_value?: number
  transfers?: RidHistoryTransfer[]
  utilizations?: RidHistoryUtilization[]
  mongo_ledger?: RidHistoryLedgerEntry[]
  mongo_ledger_count?: number
  history?: RidHistoryChainEntry[]
}

export type RidHistoryChainEntry = {
  txId: string
  timestamp: string
  value: unknown
  isDelete: boolean
}

export type AppBlockchainVerification = {
  verified: boolean
  tampered: boolean
  ledgerMatched: number
  ledgerTotal: number
  chainTxCount: number
  currentTdr: number | null
  blockchainTdr: number | null
  currentArea: number | null
  blockchainArea: number | null
}

export type RidHistoryTransfer = {
  trn_id?: string
  owner_from?: string
  owner_to?: string
  trn_value_tdr?: number
  original_tdr_value?: number
  transferred_tdr_value?: number
  generated_tdr_value?: number
  remaining_value_tdr?: number
  transferred_area?: number
  remaining_area?: number
  collector_guideline_rate?: number
  multiplier_factor?: number
  drc_certificate_no?: string
  trn_date?: string
  status?: string
  recipient_application_id?: string
  recipient_rid?: string
  recipient_tdrApplicationId?: string
  txId?: string
}

export type RidHistoryUtilization = {
  utilized_tdr_value: number | undefined
  utilization_id?: string
  drc_id?: string
  drc_certificate_no?: string
  utilized_by?: string
  original_tdr_value?: number
  utilized_value_tdr?: number
  remaining_tdr_value?: number
  generated_utilized_tdr_value?: number
  utilized_area?: number
  before_utilization_area?: number
  after_utilization_area?: number
  remaining_area?: number
  collector_guideline_rate?: number
  multiplier_factor?: number
  before_utilization_balance?: number
  after_utilization_balance?: number
  utilization_purpose?: string
  utilization_date?: string
  status?: string
  remarks?: string
  txId?: string
}

export type RidHistoryLedgerEntry = {
  action?: string
  document_type?: string
  performed_by?: string
  previous_status?: string | null
  new_status?: string
  remarks?: string
  txId?: string
  hash?: string
  createdAt?: string
}

export type FlatTransferRow = RidHistoryTransfer & {
  rowKey: string
  application_id: string
  tdrApplicationId?: string
  owner_name?: string
  samagra_id?: string
}

export type FlatUtilizationRow = RidHistoryUtilization & {
  rowKey: string
  application_id: string
  tdrApplicationId?: string
  owner_name?: string
  samagra_id?: string
}

export type FlatLedgerRow = RidHistoryLedgerEntry & {
  rowKey: string
  application_id: string
  tdrApplicationId?: string
  owner_name?: string
  samagra_id?: string
}

export type FlatAllTransactionRow = {
  rowKey: string
  txType: 'TRANSFER' | 'UTILIZATION'
  txId?: string
  referenceId?: string
  application_id: string
  tdrApplicationId?: string
  owner_name?: string
  samagra_id?: string
  amountTdr?: number
  area?: number
  date?: string
  status?: string
  counterparty?: string
  purpose?: string
  raw: RidHistoryTransfer | RidHistoryUtilization
}

export type RidHistoryResponse = {
  success?: boolean
  rid?: string
  count?: number
  applications?: RidHistoryApplication[]
}

export function findRootApp(apps: RidHistoryApplication[]): RidHistoryApplication | undefined {
  const appMap = new Map(apps.map((a) => [a.application_id, a]))
  return apps.find((a) => !a.source_application_id || !appMap.has(a.source_application_id)) ?? apps[0]
}

export function enrichTransfer(app: RidHistoryApplication, transfer: RidHistoryTransfer, index: number) {
  const outs = (app.mongo_ledger ?? []).filter((e) => e.action === 'TRANSFER_OUT')
  const byRecipient = outs.find((e) =>
    transfer.recipient_application_id
      ? e.remarks?.includes(transfer.recipient_application_id)
      : false,
  )
  const entry = byRecipient ?? outs[index]
  return {
    ...transfer,
    txId: transfer.txId ?? entry?.txId,
    trn_date: transfer.trn_date ?? entry?.createdAt,
  }
}

export function enrichUtilization(app: RidHistoryApplication, util: RidHistoryUtilization, index: number) {
  const utils = (app.mongo_ledger ?? []).filter((e) => e.action === 'UTILIZATION_ADDED')
  const byId = utils.find((e) => (util.utilization_id ? e.remarks?.includes(util.utilization_id) : false))
  const entry = byId ?? utils[index]
  return {
    ...util,
    txId: util.txId ?? entry?.txId,
    utilization_date: util.utilization_date ?? entry?.createdAt,
  }
}

export function computeRidStats(apps: RidHistoryApplication[]) {
  const totalApps = apps.length
  const totalValue = apps.reduce((sum, a) => sum + (Number(a.total_tdr_value) || 0), 0)
  const root = findRootApp(apps)
  const transferred = Number(root?.transferred_tdr_value) || 0
  const utilized = apps.reduce((sum, a) => sum + (Number(a.utilized_tdr_value) || 0), 0)

  const transferCount = apps.reduce((sum, a) => sum + (a.transfers?.length ?? 0), 0)
  const utilizationCount = apps.reduce((sum, a) => sum + (a.utilizations?.length ?? 0), 0)
  const ledgerCount = apps.reduce((sum, a) => sum + (a.mongo_ledger_count ?? a.mongo_ledger?.length ?? 0), 0)
  const allTxCount = transferCount + utilizationCount

  let lastUpdated: string | undefined
  for (const app of apps) {
    for (const entry of app.mongo_ledger ?? []) {
      if (!entry.createdAt) continue
      if (!lastUpdated || new Date(entry.createdAt) > new Date(lastUpdated)) {
        lastUpdated = entry.createdAt
      }
    }
  }

  return {
    totalApps,
    totalValue,
    transferred,
    utilized,
    transferCount,
    utilizationCount,
    ledgerCount,
    allTxCount,
    lastUpdated,
    root,
  }
}

export function flattenTransfers(apps: RidHistoryApplication[]): FlatTransferRow[] {
  const rows: FlatTransferRow[] = []
  for (const app of apps) {
    const list = app.transfers ?? []
    list.forEach((raw, idx) => {
      const transfer = enrichTransfer(app, raw, idx)
      rows.push({
        ...transfer,
        rowKey: `${app.application_id}-trn-${transfer.trn_id ?? idx}`,
        application_id: app.application_id,
        tdrApplicationId: app.tdrApplicationId,
        owner_name: app.owner_name,
        samagra_id: app.samagra_id,
      })
    })
  }
  return rows.sort((a, b) => new Date(b.trn_date ?? 0).getTime() - new Date(a.trn_date ?? 0).getTime())
}

export function flattenUtilizations(apps: RidHistoryApplication[]): FlatUtilizationRow[] {
  const rows: FlatUtilizationRow[] = []
  for (const app of apps) {
    const list = app.utilizations ?? []
    list.forEach((raw, idx) => {
      const util = enrichUtilization(app, raw, idx)
      rows.push({
        ...util,
        rowKey: `${app.application_id}-util-${util.utilization_id ?? idx}`,
        application_id: app.application_id,
        tdrApplicationId: app.tdrApplicationId,
        owner_name: app.owner_name,
        samagra_id: app.samagra_id,
      })
    })
  }
  return rows.sort(
    (a, b) => new Date(b.utilization_date ?? 0).getTime() - new Date(a.utilization_date ?? 0).getTime(),
  )
}

export function flattenLedger(apps: RidHistoryApplication[]): FlatLedgerRow[] {
  const rows: FlatLedgerRow[] = []
  for (const app of apps) {
    const list = app.mongo_ledger ?? []
    list.forEach((entry, idx) => {
      rows.push({
        ...entry,
        rowKey: `${app.application_id}-ledger-${entry.txId ?? idx}`,
        application_id: app.application_id,
        tdrApplicationId: app.tdrApplicationId,
        owner_name: app.owner_name,
        samagra_id: app.samagra_id,
      })
    })
  }
  return rows.sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  )
}

export function flattenAllTransactions(apps: RidHistoryApplication[]): FlatAllTransactionRow[] {
  const transfers = flattenTransfers(apps).map<FlatAllTransactionRow>((t) => ({
    rowKey: t.rowKey,
    txType: 'TRANSFER',
    txId: t.txId,
    referenceId: t.trn_id,
    application_id: t.application_id,
    tdrApplicationId: t.tdrApplicationId,
    owner_name: t.owner_name,
    samagra_id: t.samagra_id,
    amountTdr: t.transferred_tdr_value ?? t.trn_value_tdr,
    area: t.transferred_area,
    date: t.trn_date,
    status: t.status,
    counterparty: t.owner_to ?? t.recipient_application_id,
    purpose: undefined,
    raw: t,
  }))
  const utils = flattenUtilizations(apps).map<FlatAllTransactionRow>((u) => ({
    rowKey: u.rowKey,
    txType: 'UTILIZATION',
    txId: u.txId,
    referenceId: u.utilization_id,
    application_id: u.application_id,
    tdrApplicationId: u.tdrApplicationId,
    owner_name: u.owner_name,
    samagra_id: u.samagra_id,
    amountTdr: u.utilized_value_tdr,
    area: u.utilized_area,
    date: u.utilization_date,
    status: u.status,
    counterparty: u.utilized_by,
    purpose: u.utilization_purpose,
    raw: u,
  }))
  return [...transfers, ...utils].sort(
    (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
  )
}

export type RidHistoryTabId = 'overview' | 'tree' | 'all' | 'utilizations' | 'transfers' | 'ledger'

export const RID_HISTORY_TABS: { id: RidHistoryTabId; label: string; countKey?: keyof ReturnType<typeof computeRidStats> }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tree', label: 'Transactions Tree' },
  { id: 'all', label: 'All Transactions', countKey: 'allTxCount' },
  { id: 'utilizations', label: 'Utilizations', countKey: 'utilizationCount' },
  { id: 'transfers', label: 'Transfers', countKey: 'transferCount' },
  { id: 'ledger', label: 'Ledger (MongoDB)', countKey: 'ledgerCount' },
]

export function getAppTxCounts(app: RidHistoryApplication) {
  const ledger = app.mongo_ledger ?? []
  const transferOutLedger = ledger.filter((e) => e.action === 'TRANSFER_OUT').length
  const utilLedger = ledger.filter((e) => e.action === 'UTILIZATION_ADDED').length
  const transferCount = Math.max(app.transfers?.length ?? 0, transferOutLedger)
  const utilizationCount = Math.max(app.utilizations?.length ?? 0, utilLedger)
  return { transferCount, utilizationCount }
}

function extractChainSnapshot(value: unknown): { total_tdr_value?: number; remaining_tdr_value?: number; total_area?: number; remaining_area?: number } {
  if (!value || typeof value !== 'object') return {}
  const v = value as Record<string, unknown>
  const project = v.project as Record<string, unknown> | undefined
  return {
    total_tdr_value: Number(v.total_tdr_value ?? project?.total_tdr_value) || undefined,
    remaining_tdr_value: Number(v.remaining_tdr_value ?? project?.remaining_tdr_value) || undefined,
    total_area: Number(v.total_area ?? v.totalArea) || undefined,
    remaining_area: Number(v.remaining_area ?? v.remainingArea) || undefined,
  }
}

export function computeBlockchainVerification(app: RidHistoryApplication): AppBlockchainVerification {
  const ledger = app.mongo_ledger ?? []
  const chainHistory = app.history ?? []
  const chainTxIds = new Set(chainHistory.map((h) => h.txId).filter(Boolean))

  let ledgerMatched = 0
  const ledgerWithTx = ledger.filter((e) => e.txId)
  for (const entry of ledgerWithTx) {
    if (entry.txId && chainTxIds.has(entry.txId)) ledgerMatched += 1
  }

  const latestChain = chainHistory.length > 0 ? chainHistory[chainHistory.length - 1] : undefined
  const chainSnap = extractChainSnapshot(latestChain?.value)

  const currentTdr = app.total_tdr_value ?? null
  const blockchainTdr = chainSnap.total_tdr_value ?? null
  const currentArea = app.total_area ?? null
  const blockchainArea = chainSnap.total_area ?? null

  const tdrMismatch =
    blockchainTdr != null && currentTdr != null && Math.abs(blockchainTdr - currentTdr) > 0.01
  const areaMismatch =
    blockchainArea != null && currentArea != null && Math.abs(blockchainArea - currentArea) > 0.01
  const ledgerMismatch = ledgerWithTx.length > 0 && ledgerMatched < ledgerWithTx.length

  const tampered = ledgerMismatch || tdrMismatch || areaMismatch
  const verified = !tampered && (chainHistory.length > 0 || ledgerWithTx.length > 0)

  return {
    verified,
    tampered,
    ledgerMatched,
    ledgerTotal: ledgerWithTx.length,
    chainTxCount: chainHistory.length,
    currentTdr,
    blockchainTdr,
    currentArea,
    blockchainArea,
  }
}

export function isTxOnChain(txId: string | undefined, app: RidHistoryApplication): boolean {
  if (!txId) return false
  return (app.history ?? []).some((h) => h.txId === txId)
}

/** P1 → C1,C2…; each parent's transfer recipients get C{n} or parent.C{n} (e.g. C2.1). */
function assignTreeLabels(
  rootId: string,
  appMap: Map<string, RidHistoryApplication>,
): Map<string, string> {
  const labelByAppId = new Map<string, string>()
  labelByAppId.set(rootId, 'P1')

  const nextChildLabel = (parentLabel: string, index: number) =>
    parentLabel === 'P1' ? `C${index}` : `${parentLabel}.${index}`

  const labelChildrenFromTransfers = (parentId: string) => {
    const app = appMap.get(parentId)
    if (!app) return
    const parentLabel = labelByAppId.get(parentId) ?? 'P1'
    let childIndex = 0
    for (const t of app.transfers ?? []) {
      const childId = t.recipient_application_id
      if (!childId || !appMap.has(childId) || labelByAppId.has(childId)) continue
      childIndex += 1
      const label = nextChildLabel(parentLabel, childIndex)
      labelByAppId.set(childId, label)
      labelChildrenFromTransfers(childId)
    }
  }

  labelChildrenFromTransfers(rootId)

  for (const app of appMap.values()) {
    if (labelByAppId.has(app.application_id)) continue
    const src = app.source_application_id
    if (src && labelByAppId.has(src)) {
      const parentLabel = labelByAppId.get(src)!
      const siblingCount = [...labelByAppId.entries()].filter(
        ([id, lbl]) => id !== app.application_id && lbl.startsWith(`${parentLabel}.`),
      ).length
      const directUnderP1 = parentLabel === 'P1'
      if (directUnderP1) {
        const rootChildren = [...labelByAppId.values()].filter((l) => /^C\d+$/.test(l)).length
        labelByAppId.set(app.application_id, `C${rootChildren + 1}`)
      } else {
        labelByAppId.set(app.application_id, `${parentLabel}.${siblingCount + 1}`)
      }
      labelChildrenFromTransfers(app.application_id)
    }
  }

  let orphanIdx = 0
  for (const app of appMap.values()) {
    if (!labelByAppId.has(app.application_id)) {
      orphanIdx += 1
      labelByAppId.set(app.application_id, `C${orphanIdx}`)
      labelChildrenFromTransfers(app.application_id)
    }
  }

  return labelByAppId
}

export function buildTreeGraph(apps: RidHistoryApplication[]) {
  const appMap = new Map(apps.map((a) => [a.application_id, a]))
  const root = findRootApp(apps)
  if (!root) return { nodes: [], edges: [] }

  const initialNodes: Array<{
    id: string
    type: string
    data: Record<string, unknown>
    position: { x: number; y: number }
  }> = []
  const initialEdges: Edge[] = []
  const nodeIds = new Set<string>()

  const addNode = (node: (typeof initialNodes)[number]) => {
    if (nodeIds.has(node.id)) return
    nodeIds.add(node.id)
    initialNodes.push(node)
  }

  const labelByAppId = assignTreeLabels(root.application_id, appMap)

  const processApp = (appId: string) => {
    const app = appMap.get(appId)
    if (!app) return

    const treeLabel = labelByAppId.get(appId) ?? 'P1'
    const isChild = treeLabel !== 'P1'
    const transfers = Array.isArray(app.transfers) ? app.transfers : []
    const utilizations = Array.isArray(app.utilizations) ? app.utilizations : []
    const { transferCount, utilizationCount } = getAppTxCounts(app)
    const verification = computeBlockchainVerification(app)
    const linkedParentLabel =
      isChild && app.source_application_id
        ? labelByAppId.get(app.source_application_id) ?? 'P1'
        : undefined

    addNode({
      id: appId,
      type: 'applicationNode',
      data: {
        app,
        isChild,
        treeLabel,
        linkedParentLabel,
        transferCount,
        utilizationCount,
        verification,
      },
      position: { x: 0, y: 0 },
    })

    // Transfers (actual timeline edges)
    transfers.forEach((raw, idx) => {
      const transfer = enrichTransfer(app, raw, idx)
      const tId = `t-${appId}-${transfer.trn_id ?? 'trn'}-${idx}`
      const childId = transfer.recipient_application_id
      const childLabel = childId ? labelByAppId.get(childId) : undefined

      addNode({
        id: tId,
        type: 'transferNode',
        data: {
          transfer,
          treeLabel,
          childLabel,
          chainVerified: isTxOnChain(transfer.txId, app),
        },
        position: { x: 0, y: 0 },
      })

      initialEdges.push({
        id: `e-${appId}-${tId}`,
        source: appId,
        sourceHandle: 'transfer-out',
        target: tId,
        targetHandle: 'transfer-in',
        type: 'smoothstep',
        style: { stroke: '#b8c0cc', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#b8c0cc' },
      })

      if (childId && appMap.has(childId)) {
        initialEdges.push({
          id: `e-${tId}-${childId}`,
          source: tId,
          sourceHandle: 'transfer-out',
          target: childId,
          targetHandle: 'app-in',
          type: 'smoothstep',
          style: { stroke: '#b8c0cc', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#b8c0cc' },
        })
        if (!nodeIds.has(childId)) processApp(childId)
      }
    })

    utilizations.forEach((raw, idx) => {
      const utilization = enrichUtilization(app, raw, idx)
      const uId = `u-${appId}-${utilization.utilization_id ?? 'util'}-${idx}`

      addNode({
        id: uId,
        type: 'utilizationNode',
        data: {
          utilization,
          treeLabel,
          utilIndex: idx + 1,
          chainVerified: isTxOnChain(utilization.txId, app),
        },
        position: { x: 0, y: 0 },
      })

      initialEdges.push({
        id: `e-${appId}-${uId}`,
        source: appId,
        sourceHandle: 'util-out',
        target: uId,
        targetHandle: 'util-in',
        type: 'smoothstep',
        style: { stroke: '#52c41a', strokeWidth: 2, strokeDasharray: '6,4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a' },
      })
    })
  }

  processApp(root.application_id)

  for (const app of apps) {
    if (!nodeIds.has(app.application_id)) {
      processApp(app.application_id)
    }
  }

  return { nodes: initialNodes, edges: initialEdges }
}
