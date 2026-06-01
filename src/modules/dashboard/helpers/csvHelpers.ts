import type { TdrRecord } from '../../../types/tdr'
import type { CertificateRecord, DrcHistoryFlatRow } from '../data/certificateLedgerData'
import { getDrcBalanceCategory } from '../data/certificateLedgerData'

function escapeCsvCell(value: string | number | boolean) {
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadTdrCsv(records: TdrRecord[]) {
  const header = 'DRC ID,Owner,Area,FSI,Status,Tx Hash,Verified'
  const rows = records.map(
    (item) => `${item.drcId},${item.owner},${item.area},${item.fsi},${item.status},${item.txHash},${item.verified}`,
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'tdr-certificates.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadCertificateRegistryCsv(records: CertificateRecord[]) {
  const header =
    'Sno,Name,City,Certificate No,Issue Tx No,Issue Date,Issued Area (sq.mt),Balance (sq.mt),Market Value (per sq.mt),Balance Category'
  const rows = records.map((r) => {
    const cat = getDrcBalanceCategory(r)
    return [
      r.sno,
      escapeCsvCell(r.name),
      r.city,
      escapeCsvCell(r.certificateNo),
      r.issueTransactionNo,
      r.issueDate,
      r.issuedArea,
      r.balanceArea,
      r.marketValue,
      cat,
    ].join(',')
  })
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'drc-certificate-registry.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadDrcHistoryCsv(rows: DrcHistoryFlatRow[]) {
  const header =
    'Certificate Sno,Certificate No,Holder,City,Tree Path,Label,Timestamp,Status,Action,Actor,Tx Hash,Block,Notes'
  const lines = rows.map((r) =>
    [
      r.certificateSno,
      escapeCsvCell(r.certificateNo),
      escapeCsvCell(r.holderName),
      r.city,
      escapeCsvCell(r.treePath),
      escapeCsvCell(r.label),
      r.timestamp,
      r.status,
      r.actionType,
      escapeCsvCell(r.actor),
      r.txHash,
      r.blockNumber,
      r.notes ? escapeCsvCell(r.notes) : '',
    ].join(','),
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'drc-full-blockchain-history.csv'
  link.click()
  URL.revokeObjectURL(url)
}
