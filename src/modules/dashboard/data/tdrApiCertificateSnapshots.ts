/** Optional payloads aligned with TDR OpenAPI `OwnerModel`, `Landrecord`, `DRCModel` / `drcRequestModel`. */

export type TdrOwnerApiSnapshot = Partial<{
  applicationid: string
  owner_id: number
  land_plot_id: number
  rid: number
  owner_type: string
  ownernm: string
  owner_father_spouse_nm: string
  owner_dob: string
  owner_gender: string
  owner_city: string
  owner_pin: number
  owner_samagra: string
  owner_mob: string
  owner_email: string
  owner_address: string
  drc_receipt_no: string
  receipt_dt: string
}>

export type TdrLandrecordApiSnapshot = Partial<{
  p_k_dist_cd: string
  p_k_teh_cd: string
  p_vill_cd: string
  p_teh_cd: string
  p_khasra_no: string
  p_area: number
  p_owner_name: string
  p_landuse: string
  p_address: string
  p_value_tdr: number
  p_area_proposed: number
  p_remark: string
  p_rid: number
}>

export type TdrDrcApiSnapshot = Partial<{
  querytype: string
  application_id: string
  owner_id: string
  drc_certificate_no: string
  drc_certificate_doc_name: string
  drc_certificate_doc_path: string
  drc_receipt_no: string
  drc_file_no: string
  tdr_value: string
  certificate_no: string
  owner_samagra: string
  rid: number
  isSigned: string
  is_digital_sign: string
}>
