import type { DrcHistoryFlatRow } from '../data/certificateLedgerData'

export type ApiStatus = 'VALID' | 'TRANSFERRED' | 'UTILIZED' | 'EDITED' | 'DELETED'

export type DrcCertApiResponse = {
  success?: boolean
  countTotal?: number
  certificates?: Array<{
    application_id?: string
    tdrApplicationId?: string
    owner_name?: string
    rid?: string
    drc_id?: string
    drc_certificate_no?: string
    drc_generation_dt?: string
    drc_date?: string
    status?: string
    drc_status?: string
    updatedAt?: string
    total_area?: number
    proposed_area?: number
    remaining_tdr_value?: number
    drc_certificate?: string | { hash?: string }
  }>
}

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

