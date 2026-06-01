export type TdrStatus =
  | 'ISSUED'
  | 'ACTIVE'
  | 'TRANSFERRED'
  | 'UTILIZED'
  | 'PENDING'
  | 'REVOKED'

/** Portal roles aligned with MP TDR governance: Super Admin / Auditor monitor; TCP officers administer workflow. */
export type UserRole = 'SuperAdmin' | 'TdrOfficer' | 'Auditor' | 'TcpAdmin' | 'Developer'

export interface TdrRecord {
  drcId: string
  owner: string
  area: number
  fsi: number
  status: TdrStatus
  txHash: string
  verified: boolean
}

export interface AuditLog {
  action: string
  actor: string
  timestamp: string
  txHash: string
}

export interface BlockchainRecord {
  txHash: string
  blockNumber: number
  status: 'VALID' | 'REVOKED' | 'UTILIZED'
  timestamp: string
  signature: string
}
