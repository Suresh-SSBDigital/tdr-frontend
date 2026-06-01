export type DrcDetailResponse = {
  success?: boolean
  drc_id?: string
  drc?: {
    application_id?: string
    tdrApplicationId?: string
    rid?: string
    owner?: {
      owner_id?: string
      owner_type?: string
      owner_gender?: string
      owner_ekyc?: boolean
      is_first_owner?: boolean
      name?: string
      dob?: string
      samagra_id?: string
      mobile?: string
      email?: string
      address?: string
      owner_name_hash?: string
      owner_mobile_hash?: string
    }
    project?: {
      project_name?: string
      implement_agency?: string
      district?: string
      tehsil?: string
      village?: string
      project_stage?: string
      govt_order_no?: string
      govt_order_dt?: string
      status?: string
      drc_certificate_no?: string
      drc_generation_dt?: string
      drc_id?: string
    }
    land?: {
      land_id?: string
      khasra_no?: string
      total_area?: number
      proposed_area?: number
      original_total_area?: number
      value_tdr?: number
    }
    /** Set by GET /api/tdr/drc/:id when derived from original_total_area / land. */
    issued_land_area_sqm?: number
    original_total_area?: number
    total_tdr_value?: number
    utilized_tdr_value?: number
    remaining_tdr_value?: number
    transferred_tdr_value?: number
    transfer_tdr_value?: number
    plots?: Array<{
      plot_id?: string
      plot_no?: string
      registry_area?: number
      proposed_area?: number
      ownership?: string
      latitude?: number
      longitude?: number
    }>
    documents?: {
      form1?: string
      drc_certificate?: string | { file_url?: string; hash?: string; uploaded_at?: string }
      form4?: string | { file_url?: string; hash?: string; uploaded_at?: string }
    }
    createdAt?: string
    updatedAt?: string
  }
}
