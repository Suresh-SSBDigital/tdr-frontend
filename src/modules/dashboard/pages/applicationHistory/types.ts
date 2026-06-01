export type HistoryItem = {
  txId?: string
  timestamp?: string
  value?: { rid?: string; hash?: string; updatedAt?: string; status?: string }
}

export type HistoryResponse = {
  history?: HistoryItem[]
}

export type FullResponse = {
  success?: boolean
  application_id?: string
  samagra_id?: string
  rid?: string
  transfer_tdr_value?: number
  tdr?: {
    application_id?: string
    tdrApplicationId?: string
    rid?: string
    owner?: {
      name?: string
      owner_id?: string
      owner_gender?: string
      mobile?: string
      email?: string
      samagra_id?: string
      owner_ekyc?: boolean
      is_first_owner?: boolean
      current_balance_tdr?: number
      dob?: string
    }
    project?: {
      project_name?: string
      implement_agency?: string
      district?: string
      tehsil?: string
      village?: string
      status?: string
      drc_certificate_no?: string
      drc_generation_dt?: string
      govt_order_no?: string
      govt_order_dt?: string
      project_stage?: string
      drc_id?: string
    }
    land?: {
      land_id?: string
      khasra_no?: string
      total_area?: number
      proposed_area?: number
      value_tdr?: number
    }
    plots?: Array<{
      plot_id?: string
      plot_no?: string
      registry_area?: number
      proposed_area?: number
      ownership?: string
      latitude?: number
      longitude?: number
    }>
    transfers?: Array<{
      trn_id?: string
      owner_from?: string
      owner_to?: string
      trn_value_tdr?: number
      remaining_value_tdr?: number
      trn_date?: string
      status?: string
      [key: string]: unknown
    }>
    utilizations?: Array<{
      utilization_id?: string
      utilized_by?: string
      utilized_value_tdr?: number
      before_utilization_balance?: number
      after_utilization_balance?: number
      utilization_purpose?: string
      utilization_date?: string
      status?: string
      remarks?: string
    }>
    documents?: {
      form1?: string
      drc_certificate?: string | { file_url?: string; hash?: string; uploaded_at?: string }
      form4?: string | { file_url?: string; hash?: string; uploaded_at?: string }
    }
    total_tdr_value?: number
    transfer_tdr_value?: number
    utilized_tdr_value?: number
    remaining_tdr_value?: number
    createdAt?: string
    updatedAt?: string
    __v?: number
  }
}

export type TransferRow = {
  srNo: number
  trnId: string
  ownerFrom: string
  ownerTo: string
  transferValue?: number
  beforeBalance?: number
  remaining?: number
  /**
   * Before transfer area (sq.m) for display in history tables.
   * Backend field may or may not exist; remains undefined if not returned.
   */
  beforeTransferAreaSqM?: number
  /**
   * Used transfer area (sq.m) for display in history tables.
   * Backend field may or may not exist; remains undefined if not returned.
   */
  usedTransferAreaSqM?: number
  /**
   * Remaining area (sq.m) for display in history tables.
   * Backend field may or may not exist; remains undefined if not returned.
   */
  remainingAreaSqM?: number
  date?: string
  status?: string
}

export type UtilizationRow = {
  srNo: number
  utilizationId: string
  utilizedBy: string
  utilizedValue?: number
  beforeBalance?: number
  afterBalance?: number
  purpose: string
  /**
   * Before utilization area (sq.m) for display in history tables.
   * Backend field may or may not exist; remains undefined if not returned.
   */
  beforeUtilizationAreaSqM?: number
  /**
   * Used utilization area (sq.m) for display in history tables.
   * Backend field may or may not exist; remains undefined if not returned.
   */
  usedUtilizationAreaSqM?: number
  /**
   * Remaining area (sq.m) for display in history tables.
   * Backend field may or may not exist; remains undefined if not returned.
   */
  remainingAreaSqM?: number
  date?: string
  status?: string
}
