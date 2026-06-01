export interface TamperedUserRow {
  id: string
  certificateId: string
  userName: string
  userId: string
  recordId: string
  recordType: string
  tamperType: string
  status: 'Tampered' | 'Under Review' | 'Resolved'
  blockchainStatus: 'Mismatch' | 'Matched'
  severity: 'High' | 'Medium' | 'Low'
  lastActionAt: string
  tamperedField: string
}

export type TamperedSortKey = 'lastActionAt' | 'userName' | 'status'
export type TamperedSortOrder = 'asc' | 'desc'
