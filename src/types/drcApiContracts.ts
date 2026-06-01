/**
 * Shapes aligned with backend OpenAPI-style JSON (camelCase or snake_case tolerant).
 * Used only for mapping into the portal ledger UI.
 */

export type ApiPrimitive = string | number | boolean | null | undefined

/** DRCModel / certificate header from `/api/User/GetDRCList` or similar. */
export interface DrcModelApi {
  querytype?: string | null
  owner_id?: string | null
  drc_certificate_doc_name?: string | null
  drc_certificate_doc_path?: string | null
  drc_receipt_no?: string | null
  drc_file_no?: string | null
  isSigned?: string | null
  application_id?: string | null
  applicationId?: string | null
  is_digital_sign?: string | null
  tdr_value?: string | null
  drc_certificate_no?: string | null
  drcCertificateNo?: string | null
}

/** OwnerModel subset from `/api/User/GetDRCOwnerDetail`. */
export interface OwnerModelApi {
  applicationid?: string | null
  applicationId?: string | null
  owner_id?: number | null
  ownernm?: string | null
  owner_name?: string | null
  owner_samagra?: string | null
  owner_mob?: string | null
  owner_email?: string | null
  owner_address?: string | null
  rid?: number | null
  land_plot_id?: number | null
}

/** Form 6 ledger row — field names vary by backend; mapper accepts several aliases. */
export interface Form6LedgerRowApi {
  sno?: number | null
  Sno?: number | null
  transaction_no?: string | null
  transactionNo?: string | null
  trn_no?: string | null
  transaction_date?: string | null
  transactionDate?: string | null
  trn_date?: string | null
  holder_name?: string | null
  holderName?: string | null
  tdr_holder_name?: string | null
  issued_area?: number | null
  issuedArea?: number | null
  issued_area_sq_mt?: number | null
  balance_area?: number | null
  balanceArea?: number | null
  balance_area_sq_mt?: number | null
  credit_debit?: string | null
  creditDebit?: string | null
  cr_dr?: string | null
  chain_tx_hash?: string | null
  txHash?: string | null
  block_number?: number | null
  blockNumber?: number | null
}

export interface DepartmentStatusApi {
  application_id?: string | null
  status?: string | null
  remarks?: string | null
  updated_at?: string | null
  updatedAt?: string | null
  officer?: string | null
}

/** Composite result after calling READ endpoints for one application. */
export interface DrcApiComposite {
  agencyApplication: unknown
  form6Ledger: Form6LedgerRowApi[]
  drcList: DrcModelApi[]
  ownerDetail: OwnerModelApi | null
  applicationStatus: DepartmentStatusApi | unknown
  provisionalForm11: unknown
  /** True if at least one request returned usable body (not only network errors). */
  hadResponse: boolean
}
