/**
 * Maps backend REST endpoints to blockchain read patterns for documentation and future API clients.
 * All user-facing copy for this reference is English-only.
 */

export type BlockchainReadOperation = 'queryRecord'

export interface ReadApiMapping {
  /** HTTP path as defined by the backend (relative to API base URL). */
  path: string
  /** Short description of what the endpoint returns. */
  description: string
  /** Logical blockchain operation used when syncing or verifying from chain. */
  blockchainOperation: BlockchainReadOperation
  /** Optional note for integrators. */
  note?: string
}

/** READ APIs — safe to treat as idempotent fetches; map to chain `queryRecord` when anchoring or reconciling. */
export const READ_APIS_QUERY_RECORD: ReadApiMapping[] = [
  {
    path: '/api/Agency/GetAgencyApplication',
    description: 'Agency application payload for a TDR / generating-area file.',
    blockchainOperation: 'queryRecord',
  },
  {
    path: '/api/Agency/GetForm6Leger',
    description: 'Form 6 ledger lines (backend spelling may be “Leger”).',
    blockchainOperation: 'queryRecord',
    note: 'Confirm exact route spelling with backend Swagger (Ledger vs Leger).',
  },
  {
    path: '/api/User/GetDRCList',
    description: 'List of DRC certificates for the current user context.',
    blockchainOperation: 'queryRecord',
  },
  {
    path: '/api/User/GetDRCOwnerDetail',
    description: 'Owner and plot details tied to a DRC.',
    blockchainOperation: 'queryRecord',
  },
  {
    path: '/api/Department/GetApplicationStatus',
    description: 'Department workflow / status for an application.',
    blockchainOperation: 'queryRecord',
  },
  {
    path: '/api/DataSharing/GetProvisionalForm11Data',
    description: 'Provisional Form 11 / ABPAS-related shared data (e.g. building permission context).',
    blockchainOperation: 'queryRecord',
  },
]

export interface DeleteApiGuidance {
  path: string
  title: string
  recommendation: string
  /** Human-readable warning for architects. */
  blockchainWarning: string
}

/** DELETE — must not remove immutable ledger rows on-chain; prefer soft delete in application DB. */
export const DELETE_SHAPE_FILE_GUIDANCE: DeleteApiGuidance = {
  path: '/api/Form2/DeleteShapeFile',
  title: 'Shape file removal',
  recommendation:
    'Do not call this operation to “undo” data that has already been anchored on the blockchain. Prefer soft delete: set `isActive = false` (or equivalent flag) and record a new chain event if a correction must be proven.',
  blockchainWarning:
    'Blockchain networks do not support true delete for committed transactions. Use off-chain flags plus an optional on-chain “revocation” or “superseded” record if your chain design requires it.',
}

/** Where full OpenAPI `components.schemas` live (for developers). */
export const OPENAPI_NOTE =
  'Request and response models (e.g. AbpasDataModel, DRCModel, OwnerModel) are defined in the backend Swagger / OpenAPI document. This portal only lists endpoint classification for blockchain alignment.'
