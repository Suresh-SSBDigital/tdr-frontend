import type { DrcHistoryFlatRow } from '../data/certificateLedgerData'

export type ApiStatus = 'VALID' | 'TRANSFERRED' | 'UTILIZED' | 'EDITED' | 'DELETED'

export type DrcApiTableRow = DrcHistoryFlatRow & {
  applicationId: string
  tdrApplicationId: string
  rid: string
  drcId: string
  drcStatus: string
  timestampEpoch: number
  totalArea?: number
  proposedArea?: number
  remainingTdrValue?: number
}
