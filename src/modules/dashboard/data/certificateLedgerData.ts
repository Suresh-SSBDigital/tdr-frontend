export interface CertificateRecord {
  sno: number
  name: string
  city: string
  issuedArea: number
  balanceArea: number
  marketValue: number
  issueDate: string
  certificateNo: string
  issueTransactionNo: string
  /** Linked TDR application (opens same DRC from application detail) */
  applicationId?: string
  /** Same beneficiary may hold multiple DRCs — group by Samagra / holder id */
  holderSamagraId?: string
  /** Older DRC in the same logical portfolio chain (demo — enables parent→current lineage UI). */
  parentApplicationId?: string
  /** Optional — printed on statutory DRC layout when supplied */
  fatherOrHusbandName?: string
  mobileNo?: string
  propertyAddress?: string
  khasraNo?: string
  village?: string
  tehsil?: string
  district?: string
  totalLandAreaSqM?: number
  landUse?: string
  zoneSector?: string
  permissibleFsi?: string
  baseFsiConsumed?: string
  additionalTdrPermissible?: string
  /** Multiplier shown in TDR value formula (defaults to 1) */
  tdrFactor?: number
  /** When set (e.g. from DRC API), certificate totals / balance use these registry sq.m. TDR values. */
  totalTdrGrantedSqm?: number
  remainingTdrSqm?: number
  utilizedTdrSqm?: number
  transferredTdrSqm?: number
}

export interface LedgerTransaction {
  sno: number
  transactionNo: string
  transactionDate: string
  holderName: string
  /** Receiver / consuming entity for this ledger movement. */
  counterpartyName?: string
  issuedArea: number
  balanceArea: number
  creditDebit: 'Cr.' | 'Dr.'
  status?: 'Completed' | 'Pending' | 'Reconciled'
  /** Ledger row ↔ same transaction anchored on-chain (sale / transfer). */
  chainTxHash?: string
  chainBlock?: number
}

export interface LedgerData {
  summary: CertificateRecord
  issuedDetails: LedgerTransaction[]
  saleTransferDetails: LedgerTransaction[]
  utilizationDetails: LedgerTransaction[]
  blockchainVerified: boolean
  /** Primary anchor — DRC issuance (CREATE). */
  blockchainTxHash: string
  blockNumber: number
  /** Present when a sale/transfer debit exists — matches History → TRANSFER node. */
  transferAnchor?: { txHash: string; blockNumber: number }
  historyTree: BlockchainHistoryNode[]
}

export interface BlockchainHistoryNode {
  id: string
  label: string
  timestamp: string
  createdAt: string
  editedAt?: string
  deletedAt?: string
  txHash: string
  blockNumber: number
  status: 'VALID' | 'TRANSFERRED' | 'UTILIZED' | 'EDITED' | 'DELETED'
  actor: string
  actionType: 'CREATE' | 'UPDATE' | 'TRANSFER' | 'UTILIZATION' | 'DELETE'
  dataSnapshot: Record<string, string | number>
  notes?: string
  children?: BlockchainHistoryNode[]
}

/** Short UI labels for blockchain history `actionType` (tables, filters, detail). */
export const drcHistoryActionTypeLabels: Record<BlockchainHistoryNode['actionType'], string> = {
  CREATE: 'Issued',
  UPDATE: 'Updated',
  TRANSFER: 'Transferred',
  UTILIZATION: 'Utilized',
  DELETE: 'Deleted',
}

export const certificateRecords: CertificateRecord[] = [
  { sno: 1, name: 'रामनारायण पिता मांगीलाल देवडा ,,', city: 'INDORE', issuedArea: 23.28, balanceArea: 23.28, marketValue: 30000, issueDate: '29-11-2025', certificateNo: 'DRC/2025/00016/Indore', issueTransactionNo: '249' },
  { sno: 2, name: 'Mohammad Rafique Multani', city: 'INDORE', issuedArea: 107.16, balanceArea: 107.16, marketValue: 30000, issueDate: '01-12-2025', certificateNo: 'DRC/2025/00017/Indore', issueTransactionNo: '250' },
  { sno: 3, name: 'Vasu Jhawar', city: 'INDORE', issuedArea: 84, balanceArea: 0, marketValue: 45000, issueDate: '05-12-2025', certificateNo: 'DRC/2025/00018/Indore', issueTransactionNo: '251' },
  { sno: 4, name: 'श्री गजेन्द्र कसेरा/ममता कसेरा', city: 'INDORE', issuedArea: 78.08, balanceArea: 78.08, marketValue: 26500, issueDate: '10-12-2025', certificateNo: 'DRC/2025/00019/Indore', issueTransactionNo: '252' },
  { sno: 5, name: 'बी.के. सालगर पिता खण्डेराव सालगर', city: 'INDORE', issuedArea: 56.28, balanceArea: 56.28, marketValue: 60000, issueDate: '12-12-2025', certificateNo: 'DRC/2025/00020/Indore', issueTransactionNo: '253' },
  { sno: 6, name: 'सुमनलता तिवारी', city: 'INDORE', issuedArea: 25.416, balanceArea: 25.416, marketValue: 26500, issueDate: '14-12-2025', certificateNo: 'DRC/2025/00021/Indore', issueTransactionNo: '254' },
  { sno: 7, name: 'विजय पिता दुर्लभ दास', city: 'INDORE', issuedArea: 42.78, balanceArea: 0, marketValue: 50000, issueDate: '18-12-2025', certificateNo: 'DRC/2025/00022/Indore', issueTransactionNo: '255' },
  { sno: 8, name: 'Tushar Kumawat', city: 'INDORE', issuedArea: 35, balanceArea: 35, marketValue: 30000, issueDate: '20-12-2025', certificateNo: 'DRC/2025/00023/Indore', issueTransactionNo: '256' },
  { sno: 9, name: 'पुष्पा वर्मा', city: 'INDORE', issuedArea: 28, balanceArea: 28, marketValue: 23000, issueDate: '23-12-2025', certificateNo: 'DRC/2025/00024/Indore', issueTransactionNo: '257' },
  { sno: 10, name: 'Manu Bai', city: 'INDORE', issuedArea: 25.12, balanceArea: 25.12, marketValue: 30000, issueDate: '24-12-2025', certificateNo: 'DRC/2025/00025/Indore', issueTransactionNo: '258' },
  { sno: 11, name: 'मो. जाकीर पिता मों. इस्माईल राजा आयरन टेडस', city: 'INDORE', issuedArea: 34.56, balanceArea: 34.56, marketValue: 30000, issueDate: '27-12-2025', certificateNo: 'DRC/2025/00026/Indore', issueTransactionNo: '259' },
  { sno: 12, name: 'राजकुमारी पति महेश कुमार', city: 'INDORE', issuedArea: 37.82, balanceArea: 37.82, marketValue: 25000, issueDate: '29-12-2025', certificateNo: 'DRC/2025/00027/Indore', issueTransactionNo: '260' },
  { sno: 13, name: 'विजय षंकर षुक्ला', city: 'INDORE', issuedArea: 64.02, balanceArea: 64.02, marketValue: 30000, issueDate: '31-12-2025', certificateNo: 'DRC/2025/00028/Indore', issueTransactionNo: '261' },
  { sno: 14, name: 'सत्यनारायण खण्डेवाल', city: 'INDORE', issuedArea: 118.8, balanceArea: 118.8, marketValue: 50000, issueDate: '02-01-2026', certificateNo: 'DRC/2026/00029/Indore', issueTransactionNo: '262' },
  { sno: 15, name: 'Anshul Jain', city: 'INDORE', issuedArea: 61.88, balanceArea: 61.88, marketValue: 50000, issueDate: '04-01-2026', certificateNo: 'DRC/2026/00030/Indore', issueTransactionNo: '263' },
  { sno: 16, name: 'Ridhima Ojha', city: 'INDORE', issuedArea: 53.28, balanceArea: 53.28, marketValue: 60000, issueDate: '06-01-2026', certificateNo: 'DRC/2026/00031/Indore', issueTransactionNo: '264' },
  { sno: 17, name: 'Vasudha Jhawar', city: 'INDORE', issuedArea: 42.78, balanceArea: 42.78, marketValue: 50000, issueDate: '08-01-2026', certificateNo: 'DRC/2026/00032/Indore', issueTransactionNo: '265' },
  { sno: 18, name: 'Hindraj Rajoriya', city: 'INDORE', issuedArea: 21.4, balanceArea: 21.4, marketValue: 50000, issueDate: '10-01-2026', certificateNo: 'DRC/2026/00033/Indore', issueTransactionNo: '266' },
  { sno: 19, name: 'Vasu Jhawar', city: 'INDORE', issuedArea: 21.96, balanceArea: 0, marketValue: 45000, issueDate: '12-01-2026', certificateNo: 'DRC/2026/00034/Indore', issueTransactionNo: '267' },
  {
    sno: 20,
    name: 'Anil Patidar',
    city: 'UJJAIN',
    issuedArea: 1500,
    balanceArea: 1500,
    marketValue: 42000,
    issueDate: '18-05-2026',
    certificateNo: 'DRC/MP/TDR/2026/004512',
    issueTransactionNo: 'TX-DRC-2026-004512',
    applicationId: 'APP-2026-45140',
    holderSamagraId: '665544332211',
    parentApplicationId: 'APP-2025-44100',
    fatherOrHusbandName: 'Shri Ram Patidar',
    mobileNo: '+91 93405 11223',
    propertyAddress: 'H.No. 42, Ward 18, Freeganj, Ujjain — 456010',
    khasraNo: '123/1, 124/2',
    village: 'Ujjain (ULB)',
    tehsil: 'Ujjain',
    district: 'Ujjain',
    totalLandAreaSqM: 485,
    landUse: 'Residential',
    zoneSector: 'Zone B / Sector 4',
    permissibleFsi: '2.70',
    baseFsiConsumed: '1.20',
    additionalTdrPermissible: 'As per site potential',
    tdrFactor: 1,
  },
  {
    sno: 21,
    name: 'Anil Patidar',
    city: 'UJJAIN',
    issuedArea: 800,
    balanceArea: 500,
    marketValue: 42000,
    issueDate: '12-03-2025',
    certificateNo: 'DRC/2025/009900/Ujjain',
    issueTransactionNo: 'TX-DRC-2025-009900',
    applicationId: 'APP-2025-44100',
    holderSamagraId: '665544332211',
    parentApplicationId: 'APP-2024-39812',
  },
  {
    sno: 22,
    name: 'Anil Patidar',
    city: 'UJJAIN',
    issuedArea: 400,
    balanceArea: 0,
    marketValue: 38000,
    issueDate: '08-11-2024',
    certificateNo: 'DRC/2024/007700/Ujjain',
    issueTransactionNo: 'TX-DRC-2024-007700',
    applicationId: 'APP-2024-39812',
    holderSamagraId: '665544332211',
  },
  {
    sno: 23,
    name: 'Rakesh Chouhan',
    city: 'BHOPAL',
    issuedArea: 9000,
    balanceArea: 7600,
    marketValue: 39000,
    issueDate: '04-01-2025',
    certificateNo: 'DRC/MP/TDR/2025/010901',
    issueTransactionNo: 'TX-DRC-2025-010901',
    applicationId: 'APP-2025-47001',
    holderSamagraId: '900011112222',
    fatherOrHusbandName: 'Mahendra Chouhan',
    mobileNo: '+91 98930 44556',
    propertyAddress: 'H.No. 88, Kolar Road, Bhopal — 462042',
    khasraNo: '210/1, 211/2',
    village: 'Kolar',
    tehsil: 'Huzur',
    district: 'Bhopal',
    totalLandAreaSqM: 2800,
    landUse: 'Residential',
    zoneSector: 'Zone C / Sector 2',
    permissibleFsi: '2.50',
    baseFsiConsumed: '0.90',
    additionalTdrPermissible: 'Sale 1 executed: 1,400 sq.m transferred',
    tdrFactor: 1,
  },
  {
    sno: 24,
    name: 'Rakesh Chouhan',
    city: 'BHOPAL',
    issuedArea: 7600,
    balanceArea: 6200,
    marketValue: 39200,
    issueDate: '18-04-2025',
    certificateNo: 'DRC/MP/TDR/2025/012245',
    issueTransactionNo: 'TX-DRC-2025-012245',
    applicationId: 'APP-2025-47045',
    holderSamagraId: '900011112222',
    parentApplicationId: 'APP-2025-47001',
    fatherOrHusbandName: 'Mahendra Chouhan',
    mobileNo: '+91 98930 44556',
    propertyAddress: 'H.No. 88, Kolar Road, Bhopal — 462042',
    khasraNo: '210/1, 211/2',
    village: 'Kolar',
    tehsil: 'Huzur',
    district: 'Bhopal',
    totalLandAreaSqM: 2800,
    landUse: 'Residential',
    zoneSector: 'Zone C / Sector 2',
    permissibleFsi: '2.50',
    baseFsiConsumed: '0.90',
    additionalTdrPermissible: 'Sale 2 executed: 1,400 sq.m transferred',
    tdrFactor: 1,
  },
  {
    sno: 25,
    name: 'Rakesh Chouhan',
    city: 'BHOPAL',
    issuedArea: 6200,
    balanceArea: 5000,
    marketValue: 39500,
    issueDate: '30-07-2025',
    certificateNo: 'DRC/MP/TDR/2025/014810',
    issueTransactionNo: 'TX-DRC-2025-014810',
    applicationId: 'APP-2025-47110',
    holderSamagraId: '900011112222',
    parentApplicationId: 'APP-2025-47045',
    fatherOrHusbandName: 'Mahendra Chouhan',
    mobileNo: '+91 98930 44556',
    propertyAddress: 'H.No. 88, Kolar Road, Bhopal — 462042',
    khasraNo: '210/1, 211/2',
    village: 'Kolar',
    tehsil: 'Huzur',
    district: 'Bhopal',
    totalLandAreaSqM: 2800,
    landUse: 'Residential',
    zoneSector: 'Zone C / Sector 2',
    permissibleFsi: '2.50',
    baseFsiConsumed: '0.90',
    additionalTdrPermissible: 'Sale 3 executed: 1,200 sq.m transferred',
    tdrFactor: 1,
  },
  {
    sno: 26,
    name: 'Rakesh Chouhan',
    city: 'BHOPAL',
    issuedArea: 5000,
    balanceArea: 3500,
    marketValue: 39800,
    issueDate: '11-11-2025',
    certificateNo: 'DRC/MP/TDR/2025/017220',
    issueTransactionNo: 'TX-DRC-2025-017220',
    applicationId: 'APP-2025-47180',
    holderSamagraId: '900011112222',
    parentApplicationId: 'APP-2025-47110',
    fatherOrHusbandName: 'Mahendra Chouhan',
    mobileNo: '+91 98930 44556',
    propertyAddress: 'H.No. 88, Kolar Road, Bhopal — 462042',
    khasraNo: '210/1, 211/2',
    village: 'Kolar',
    tehsil: 'Huzur',
    district: 'Bhopal',
    totalLandAreaSqM: 2800,
    landUse: 'Residential',
    zoneSector: 'Zone C / Sector 2',
    permissibleFsi: '2.50',
    baseFsiConsumed: '0.90',
    additionalTdrPermissible: 'Sale 4 executed: 1,500 sq.m transferred',
    tdrFactor: 1,
  },
  {
    sno: 27,
    name: 'Rakesh Chouhan',
    city: 'BHOPAL',
    issuedArea: 3500,
    balanceArea: 2000,
    marketValue: 40000,
    issueDate: '09-02-2026',
    certificateNo: 'DRC/MP/TDR/2026/001155',
    issueTransactionNo: 'TX-DRC-2026-001155',
    applicationId: 'APP-2026-47240',
    holderSamagraId: '900011112222',
    parentApplicationId: 'APP-2025-47180',
    fatherOrHusbandName: 'Mahendra Chouhan',
    mobileNo: '+91 98930 44556',
    propertyAddress: 'H.No. 88, Kolar Road, Bhopal — 462042',
    khasraNo: '210/1, 211/2',
    village: 'Kolar',
    tehsil: 'Huzur',
    district: 'Bhopal',
    totalLandAreaSqM: 2800,
    landUse: 'Residential',
    zoneSector: 'Zone C / Sector 2',
    permissibleFsi: '2.50',
    baseFsiConsumed: '0.90',
    additionalTdrPermissible: 'Sale 5 executed: 1,500 sq.m transferred',
    tdrFactor: 1,
  },
  {
    sno: 28,
    name: 'Rakesh Chouhan',
    city: 'BHOPAL',
    issuedArea: 2000,
    balanceArea: 2000,
    marketValue: 40500,
    issueDate: '20-04-2026',
    certificateNo: 'DRC/MP/TDR/2026/002008',
    issueTransactionNo: 'TX-DRC-2026-002008',
    applicationId: 'APP-2026-47310',
    holderSamagraId: '900011112222',
    parentApplicationId: 'APP-2026-47240',
    fatherOrHusbandName: 'Mahendra Chouhan',
    mobileNo: '+91 98930 44556',
    propertyAddress: 'H.No. 88, Kolar Road, Bhopal — 462042',
    khasraNo: '210/1, 211/2',
    village: 'Kolar',
    tehsil: 'Huzur',
    district: 'Bhopal',
    totalLandAreaSqM: 2800,
    landUse: 'Residential',
    zoneSector: 'Zone C / Sector 2',
    permissibleFsi: '2.50',
    baseFsiConsumed: '0.90',
    additionalTdrPermissible: 'Current live DRC after 5 sales',
    tdrFactor: 1,
  },
]

/** Demo aggregate total (includes historical off-table records). */
export const TOTAL_CERTIFICATES = 58

export const buildLedgerData = (record: CertificateRecord): LedgerData => {
  const issueTxHash = `0xISSUED${record.sno.toString().padStart(4, '0')}`
  const issueBlockNumber = 10000 + record.sno

  const issuedDetails: LedgerTransaction[] = [
    {
      sno: 1,
      transactionNo: record.issueTransactionNo,
      transactionDate: record.issueDate,
      holderName: record.name,
      issuedArea: record.issuedArea,
      balanceArea: record.issuedArea,
      creditDebit: 'Cr.',
      chainTxHash: issueTxHash,
      chainBlock: issueBlockNumber,
    },
  ]

  const utilized = Math.max(record.issuedArea - record.balanceArea, 0)
  const numericTx = String(record.issueTransactionNo).replace(/\s/g, '')
  const derivedDebitTx =
    /^\d+$/.test(numericTx) ? String(Number(numericTx) + 1000) : `${record.issueTransactionNo}-DR-1`
  const transferTxHash = utilized > 0 ? (`0xTRAN${record.sno.toString().padStart(4, '0')}` as const) : undefined
  const transferBlockNumber = utilized > 0 ? 11000 + record.sno : undefined

  const saleTransferDetails: LedgerTransaction[] =
    utilized > 0 && transferTxHash != null && transferBlockNumber != null
      ? [
          {
            sno: 1,
            transactionNo: derivedDebitTx,
            transactionDate: '20-03-2026',
            holderName: record.name,
            counterpartyName: `${record.city} Infra Developers LLP`,
            issuedArea: utilized,
            balanceArea: record.balanceArea,
            creditDebit: 'Dr.',
            status: 'Completed',
            chainTxHash: transferTxHash,
            chainBlock: transferBlockNumber,
          },
        ]
      : []

  const utilizationDetails: LedgerTransaction[] =
    utilized > 0
      ? [
          {
            sno: 1,
            transactionNo: `${derivedDebitTx}-UT-1`,
            transactionDate: '22-03-2026',
            holderName: record.name,
            counterpartyName: 'Skyline Buildcon Pvt Ltd',
            issuedArea: Math.round((utilized * 0.6) * 100) / 100,
            balanceArea: Math.round((record.balanceArea + utilized * 0.4) * 100) / 100,
            creditDebit: 'Dr.',
            status: 'Completed',
            chainTxHash: transferTxHash ?? issueTxHash,
            chainBlock: (transferBlockNumber ?? issueBlockNumber) + 1,
          },
          {
            sno: 2,
            transactionNo: `${derivedDebitTx}-UT-2`,
            transactionDate: '26-03-2026',
            holderName: record.name,
            counterpartyName: 'Urban Habitat Redevelopment Cell',
            issuedArea: Math.round((utilized * 0.4) * 100) / 100,
            balanceArea: record.balanceArea,
            creditDebit: 'Dr.',
            status: 'Reconciled',
            chainTxHash: transferTxHash ?? issueTxHash,
            chainBlock: (transferBlockNumber ?? issueBlockNumber) + 2,
          },
        ]
      : []

  const historyTree: BlockchainHistoryNode[] = [
    {
      id: `${record.sno}-root`,
      label: `Certificate Issued (${record.certificateNo})`,
      timestamp: record.issueDate,
      createdAt: record.issueDate,
      txHash: issueTxHash,
      blockNumber: issueBlockNumber,
      status: 'VALID',
      actor: 'Town Planning Officer',
      actionType: 'CREATE',
      dataSnapshot: {
        certificateNo: record.certificateNo,
        holderName: record.name,
        city: record.city,
        ...(record.applicationId ? { tdrApplicationId: record.applicationId } : {}),
        ...(record.holderSamagraId ? { holderSamagraId: record.holderSamagraId } : {}),
        issuedAreaSqMt: record.issuedArea,
        balanceAreaSqMt: record.balanceArea,
        marketValuePerSqMt: record.marketValue,
      },
      notes: 'Initial DRC certificate creation and blockchain anchoring.',
      children: [
        {
          id: `${record.sno}-update-1`,
          label: 'Record Edited',
          timestamp: '15-02-2026 11:20',
          createdAt: record.issueDate,
          editedAt: '15-02-2026 11:20',
          txHash: `0xEDIT${record.sno.toString().padStart(4, '0')}`,
          blockNumber: 10500 + record.sno,
          status: 'EDITED',
          actor: 'Data Entry Clerk',
          actionType: 'UPDATE',
          dataSnapshot: {
            certificateNo: record.certificateNo,
            holderName: record.name,
            city: record.city,
            updatedMarketValuePerSqMt: record.marketValue,
            updatedBalanceAreaSqMt: record.balanceArea,
          },
          notes: 'Market value and balance fields were revalidated.',
          children: saleTransferDetails.length
            ? [
                {
                  id: `${record.sno}-transfer-1`,
                  label: 'Sale/Transfer Entry',
                  timestamp: saleTransferDetails[0].transactionDate,
                  createdAt: saleTransferDetails[0].transactionDate,
                  editedAt: '22-03-2026 09:10',
                  txHash: transferTxHash!,
                  blockNumber: transferBlockNumber!,
                  status: 'TRANSFERRED',
                  actor: 'Transfer Officer',
                  actionType: 'TRANSFER',
                  dataSnapshot: {
                    transactionNo: saleTransferDetails[0].transactionNo,
                    transferAreaSqMt: saleTransferDetails[0].issuedArea,
                    balanceAfterTransferSqMt: saleTransferDetails[0].balanceArea,
                    creditDebit: saleTransferDetails[0].creditDebit,
                  },
                  notes: 'Transfer executed and confirmed on blockchain.',
                  children: [
                    ...utilizationDetails.map((u, idx) => ({
                      id: `${record.sno}-util-${idx + 1}`,
                      label: `Utilization Entry ${idx + 1}`,
                      timestamp: u.transactionDate,
                      createdAt: u.transactionDate,
                      txHash: u.chainTxHash ?? transferTxHash!,
                      blockNumber: u.chainBlock ?? transferBlockNumber!,
                      status: 'UTILIZED' as const,
                      actor: 'Utilization Officer',
                      actionType: 'UTILIZATION' as const,
                      dataSnapshot: {
                        transactionNo: u.transactionNo,
                        utilizedAreaSqMt: u.issuedArea,
                        utilizationBy: u.counterpartyName ?? 'N/A',
                        balanceAfterUtilizationSqMt: u.balanceArea,
                      },
                      notes: `Utilization posted for ${u.counterpartyName ?? 'consuming authority'}.`,
                    })),
                    {
                      id: `${record.sno}-delete-log-1`,
                      label: 'Legacy Draft Entry Deleted',
                      timestamp: '24-03-2026 18:30',
                      createdAt: '23-03-2026 08:55',
                      deletedAt: '24-03-2026 18:30',
                      txHash: `0xDEL${record.sno.toString().padStart(4, '0')}`,
                      blockNumber: 11200 + record.sno,
                      status: 'DELETED',
                      actor: 'System Auditor',
                      actionType: 'DELETE',
                      dataSnapshot: {
                        deletedRecordType: 'Draft Transfer Ledger',
                        reason: 'Duplicate draft transaction removed',
                      },
                      notes: 'Deleted record retained in immutable blockchain history.',
                    },
                  ],
                },
              ]
            : [],
        },
      ],
    },
  ]

  return {
    summary: record,
    issuedDetails,
    saleTransferDetails,
    utilizationDetails,
    blockchainVerified: true,
    blockchainTxHash: issueTxHash,
    blockNumber: issueBlockNumber,
    transferAnchor:
      transferTxHash != null && transferBlockNumber != null
        ? { txHash: transferTxHash, blockNumber: transferBlockNumber }
        : undefined,
    historyTree,
  }
}

export const getCertificateBySno = (sno: number) =>
  certificateRecords.find((record) => record.sno === sno) ?? null

export const getCertificateByApplicationId = (applicationId: string) =>
  certificateRecords.find((record) => record.applicationId === applicationId) ?? null

/** Immediate parent DRC in the portfolio chain, if linked. */
export function getParentCertificate(record: CertificateRecord): CertificateRecord | null {
  if (!record.parentApplicationId) return null
  return getCertificateByApplicationId(record.parentApplicationId)
}

/** Certificates from root ancestor → … → `record` (inclusive), ordered oldest → newest. */
export function getLineageFromRootTo(record: CertificateRecord): CertificateRecord[] {
  const upward: CertificateRecord[] = []
  let cur: CertificateRecord | null = record
  while (cur) {
    upward.push(cur)
    cur = getParentCertificate(cur)
  }
  upward.reverse()
  return upward
}

export type LineageUtilizationRowKind = 'ISSUED' | 'DEBIT'

/** Timeline row for “who took how much, when, balance left” across the parent→current chain (demo debit lines per application). */
export interface LineageUtilizationRow {
  sortTs: number
  dateDisplay: string
  rowKind: LineageUtilizationRowKind
  applicationId?: string
  certificateNo: string
  partyName: string
  amountSqMt: number
  balanceAfterSqMt: number
  note?: string
}

/** Same epoch ordering as {@link parseCertificateIssueDate} — used only for static demo debit rows. */
function lineageDemoTs(day: number, month: number, year: number): number {
  return new Date(year, month - 1, day).getTime()
}

/** Demo utilization / adjustment entries keyed by TDR application id (sq.m debits on that certificate). */
const LINEAGE_DEBIT_EVENTS: Record<
  string,
  Array<Pick<LineageUtilizationRow, 'sortTs' | 'dateDisplay' | 'partyName' | 'amountSqMt' | 'balanceAfterSqMt' | 'note'>>
> = {
  'APP-2024-39812': [
    {
      sortTs: lineageDemoTs(15, 1, 2025),
      dateDisplay: '15-01-2025',
      partyName: 'TCP verification — opening reconciliation',
      amountSqMt: 80,
      balanceAfterSqMt: 320,
      note: 'Office adjustment against survey mismatch',
    },
    {
      sortTs: lineageDemoTs(10, 3, 2025),
      dateDisplay: '10-03-2025',
      partyName: 'Utilization — Apex Realty Pvt Ltd',
      amountSqMt: 120,
      balanceAfterSqMt: 200,
      note: 'Approved built-up utilization against this DRC',
    },
    {
      sortTs: lineageDemoTs(28, 8, 2025),
      dateDisplay: '28-08-2025',
      partyName: 'Utilization — Ujjain Municipal Corporation (ROW)',
      amountSqMt: 200,
      balanceAfterSqMt: 0,
      note: 'Final debit — certificate fully utilized',
    },
  ],
  'APP-2025-44100': [
    {
      sortTs: lineageDemoTs(5, 6, 2025),
      dateDisplay: '05-06-2025',
      partyName: 'Partial utilization — Skyline Builders',
      amountSqMt: 300,
      balanceAfterSqMt: 500,
      note: 'Structured installment utilization',
    },
  ],
}

/** Issuance + demo debit rows for every certificate in the chain, sorted oldest→newest. */
export function getLineageUtilizationTrail(chain: CertificateRecord[]): LineageUtilizationRow[] {
  const rows: LineageUtilizationRow[] = []
  for (const rec of chain) {
    const ts = parseCertificateIssueDate(rec.issueDate)
    rows.push({
      sortTs: ts,
      dateDisplay: rec.issueDate,
      rowKind: 'ISSUED',
      applicationId: rec.applicationId,
      certificateNo: rec.certificateNo,
      partyName: `${rec.name} — issuance credit`,
      amountSqMt: rec.issuedArea,
      balanceAfterSqMt: rec.issuedArea,
      note: 'Original issue',
    })
    const debits = LINEAGE_DEBIT_EVENTS[rec.applicationId ?? ''] ?? []
    for (const d of debits) {
      rows.push({
        sortTs: d.sortTs,
        dateDisplay: d.dateDisplay,
        rowKind: 'DEBIT',
        applicationId: rec.applicationId,
        certificateNo: rec.certificateNo,
        partyName: d.partyName,
        amountSqMt: d.amountSqMt,
        balanceAfterSqMt: d.balanceAfterSqMt,
        note: d.note,
      })
    }
  }
  rows.sort((a, b) => a.sortTs - b.sortTs)
  return rows
}

/** Ledger UI: multi-cert chain or standalone demo debits on this certificate. */
export function shouldShowLineagePanel(record: CertificateRecord): boolean {
  const chain = getLineageFromRootTo(record)
  if (chain.length > 1) return true
  return getLineageUtilizationTrail(chain).some((r) => r.rowKind === 'DEBIT')
}

/** Per-certificate: issued vs utilized vs remaining (sq.m). Utilized = issued − balance. */
export interface DrcUtilizationBreakdown {
  issuedSqMt: number
  utilizedSqMt: number
  remainingSqMt: number
  /** 0–100, one decimal */
  pctUtilized: number
}

export function getDrcUtilizationBreakdown(record: CertificateRecord): DrcUtilizationBreakdown {
  const issued = record.issuedArea
  const remaining = Math.max(0, record.balanceArea)
  const utilized = Math.max(0, issued - remaining)
  const pctUtilized = issued > 0 ? Math.round((utilized / issued) * 1000) / 10 : 0
  return { issuedSqMt: issued, utilizedSqMt: utilized, remainingSqMt: remaining, pctUtilized }
}

/** All DRC rows for one holder (same Samagra id). */
export function getCertificatesForSamagraId(samagraId: string): CertificateRecord[] {
  return certificateRecords.filter((c) => c.holderSamagraId === samagraId).sort((a, b) => a.sno - b.sno)
}

export interface HolderPortfolioAggregate {
  rows: Array<{ record: CertificateRecord } & DrcUtilizationBreakdown>
  totals: { issuedSqMt: number; utilizedSqMt: number; remainingSqMt: number }
}

export function aggregateHolderPortfolio(records: CertificateRecord[]): HolderPortfolioAggregate {
  const rows = records.map((record) => ({
    record,
    ...getDrcUtilizationBreakdown(record),
  }))
  const totals = rows.reduce(
    (acc, row) => {
      acc.issuedSqMt += row.issuedSqMt
      acc.utilizedSqMt += row.utilizedSqMt
      acc.remainingSqMt += row.remainingSqMt
      return acc
    },
    { issuedSqMt: 0, utilizedSqMt: 0, remainingSqMt: 0 },
  )
  return { rows, totals }
}

/** Demo holder for “recent DRC” spotlight on the certificates list. */
export const DEMO_SPOTLIGHT_SAMAGRA_ID = '665544332211'

export function parseCertificateIssueDate(issueDate: string): number {
  const parts = issueDate.split('-').map((x) => Number(String(x).trim()))
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 0
  const [dd, mm, yyyy] = parts
  return new Date(yyyy, mm - 1, dd).getTime()
}

/** Latest issued DRC for a holder (by certificate issue date). */
export function getLatestCertificateForSamagra(samagraId: string): CertificateRecord | null {
  const certs = getCertificatesForSamagraId(samagraId)
  if (certs.length === 0) return null
  return certs.reduce((best, c) =>
    parseCertificateIssueDate(c.issueDate) > parseCertificateIssueDate(best.issueDate) ? c : best,
  )
}

/** Balance category for filtering */
export type DrcBalanceFilter = 'all' | 'full_balance' | 'partial' | 'zero_balance'

export function getDrcBalanceCategory(record: CertificateRecord): 'full_balance' | 'partial' | 'zero_balance' {
  if (record.balanceArea <= 0 && record.issuedArea > 0) return 'zero_balance'
  if (record.balanceArea >= record.issuedArea) return 'full_balance'
  return 'partial'
}

export const uniqueCertificateCities = Array.from(new Set(certificateRecords.map((r) => r.city))).sort()

export interface DrcHistoryFlatRow {
  rowId: string
  certificateSno: number
  certificateNo: string
  holderName: string
  city: string
  treePath: string
  label: string
  timestamp: string
  status: BlockchainHistoryNode['status']
  actionType: BlockchainHistoryNode['actionType']
  actor: string
  txHash: string
  blockNumber: number
  notes?: string
}

function walkHistoryTree(
  nodes: BlockchainHistoryNode[],
  cert: CertificateRecord,
  pathSoFar: string,
  out: DrcHistoryFlatRow[],
) {
  for (const n of nodes) {
    const treePath = pathSoFar ? `${pathSoFar} › ${n.label}` : n.label
    out.push({
      rowId: `${cert.sno}-${n.id}`,
      certificateSno: cert.sno,
      certificateNo: cert.certificateNo,
      holderName: cert.name,
      city: cert.city,
      treePath,
      label: n.label,
      timestamp: n.timestamp,
      status: n.status,
      actionType: n.actionType,
      actor: n.actor,
      txHash: n.txHash,
      blockNumber: n.blockNumber,
      notes: n.notes,
    })
    if (n.children?.length) walkHistoryTree(n.children, cert, treePath, out)
  }
}

/** All blockchain history rows across every DRC (for global history view). */
export function getAllDrcHistoryFlat(): DrcHistoryFlatRow[] {
  const out: DrcHistoryFlatRow[] = []
  for (const rec of certificateRecords) {
    const ledger = buildLedgerData(rec)
    walkHistoryTree(ledger.historyTree, rec, '', out)
  }
  return out
}

/** Lookup one flattened history row by its stable `rowId` (for detail page). */
export function getDrcHistoryFlatRowByRowId(rowId: string): DrcHistoryFlatRow | null {
  for (const rec of certificateRecords) {
    const ledger = buildLedgerData(rec)
    const bucket: DrcHistoryFlatRow[] = []
    walkHistoryTree(ledger.historyTree, rec, '', bucket)
    const hit = bucket.find((r) => r.rowId === rowId)
    if (hit) return hit
  }
  return null
}
