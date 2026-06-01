import type { TdrWorkflowStageId } from './tdrWorkflowStages'

export type ApplicationStatus = 'Draft' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'DRC Issued'

export type TimelineStepStatus = 'completed' | 'in_progress' | 'pending' | 'rejected'

export interface TimelineStep {
  label: string
  status: TimelineStepStatus
  date?: string
  officer?: string
  remark?: string
}

/** Each row = officer/system action after submission (audit trail). */
export interface OfficerActivityEvent {
  id: string
  /** Display datetime */
  at: string
  actorName: string
  actorRole: string
  department: string
  /** Statutory tier per TCP workflow diagram (Citizen · District · Directorate · …). */
  workflowTier?: string
  /** Desk / gate label (e.g. District Draftsman queue). */
  workflowDesk?: string
  /** Short label, e.g. "Application submitted", "Status changed", "Review remark" */
  action: string
  /** Previous workflow status, or "—" */
  fromStatus: string
  /** New workflow status, or "—" */
  toStatus: string
  remarks?: string
  channel?: string
}

/** Extra read-only fields for Super Admin detail view (optional per application). */
export interface ApplicationExtendedDetails {
  email: string
  alternatePhone: string
  pincode: string
  wardNo: string
  propertyCategory: string
  surveyNumber: string
  patwariHalka: string
  roadWidthM: string
  encumbrance: string
  buildingPlanRef: string
  waterConn: string
  electricityRRNo: string
  applicationChannel: 'Online' | 'At ULB counter'
  assignedTo: string
  lastUpdatedOn: string
  mapB1Ref: string
  courtCaseStatus: string
  feeStatus: string
  amountDeposited: string
  paymentRef: string
  npciTransactionId: string
  internalNotes: string
  siteInspectionId: string
  geoTag: string
  colonySector: string
  nearestRoad: string
}

export interface TdrApplicationRecord {
  id: string
  /** Blockchain / registry RID when known (e.g. apply → transactions?rid=). */
  rid?: string
  applicantName: string
  district: string
  tehsil: string
  khasraNo: string
  landAreaSqM: number
  proposedAreaSqM: number
  /** DRC / registry issued area (sq.m) from API `total_area`. */
  issuedAreaSqM?: number
  totalAreaSqM?: number
  transferredAreaSqM?: number
  utilizedAreaSqM?: number
  remainingAreaSqM?: number
  tdrValueCr: number
  /** Total TDR transferred out (same units as total TDR value from API). */
  transferredTdrValue?: number
  utilizedTdrValue?: number
  remainingTdrValue?: number
  status: ApplicationStatus
  /** Current gate in the statutory TDR workflow (login → DRC); see `tdrWorkflowStages`. */
  workflowStageId?: TdrWorkflowStageId
  currentLevel: string
  appliedOn: string
  /** External TDR application ref from API (`tdrApplicationId`). */
  tdrAppId?: string
  samagraId: string
  mobile: string
  address: string
  landUse: string
  village: string
  documents: {
    form3: string
    mutation: string
    landCertificate: string
  }
  timeline: {
    dataEntry: TimelineStep
    officerVerification: TimelineStep
    authorityApproval: TimelineStep
  }
  blockchain: {
    hash: string
    status: string
    txId: string
  } | null
  /** Richer read-only profile for detail screen */
  details?: ApplicationExtendedDetails
  /** Officer/system audit after applicant submits (newest events typically last in array — UI sorts for display) */
  officerActivityLog?: OfficerActivityEvent[]
  /** Shown on approval timeline when `status` is DRC Issued */
  drcIssuedOn?: string
  /** Link to certificate registry detail: `/dashboard/certificates/:sno` */
  drcCertificateLedgerSno?: number
}

export const APPLICATION_STATUS_OPTIONS: ApplicationStatus[] = [
  'Draft',
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'DRC Issued',
]

export const initialTdrApplications: TdrApplicationRecord[] = [
  {
    id: 'APP-2026-45201',
    applicantName: 'Ramesh Verma',
    district: 'Indore',
    tehsil: 'Mhow',
    khasraNo: '142/1',
    landAreaSqM: 2400,
    proposedAreaSqM: 1800,
    tdrValueCr: 18.5,
    status: 'Under Review',
    workflowStageId: 'directorate_dm',
    currentLevel: 'L2 — Officer verification (Directorate DM queue)',
    appliedOn: '2026-05-18',
    samagraId: '123456789012',
    mobile: '98765 43210',
    address: '12, MG Road, Indore — 452001',
    landUse: 'Residential',
    village: 'Rau',
    documents: {
      form3: 'FORM3_APP45201.pdf',
      mutation: 'MUT_45201_verified.pdf',
      landCertificate: 'LC_RAU_142_2025.pdf',
    },
    timeline: {
      dataEntry: {
        label: 'Data Entry',
        status: 'completed',
        date: '18 May 2026, 10:12',
        officer: 'Clerk — TCP Indore',
        remark: 'Application captured',
      },
      officerVerification: {
        label: 'Officer Verification',
        status: 'in_progress',
        date: '19 May 2026, 14:00',
        officer: 'TPO — Zone A',
        remark: 'Site docs under review',
      },
      authorityApproval: {
        label: 'Authority Approval',
        status: 'pending',
      },
    },
    blockchain: null,
    officerActivityLog: [
      {
        id: 'evt-45201-1',
        at: '18 May 2026, 10:10 IST',
        actorName: 'Applicant (portal)',
        actorRole: 'Online submission',
        department: 'Citizen portal',
        action: 'Application submitted',
        fromStatus: '—',
        toStatus: 'Under Review',
        remarks: 'Auto-routed to zone TPO after data completeness check.',
        channel: 'Web',
      },
      {
        id: 'evt-45201-2',
        at: '19 May 2026, 14:05 IST',
        actorName: 'Shri A. Kulkarni',
        actorRole: 'TPO — Zone A',
        department: 'TCP — Indore',
        action: 'Site document review in progress',
        fromStatus: 'Under Review',
        toStatus: 'Under Review',
        remarks: 'Requested additional sketch from applicant via portal message ID MSG-8821.',
        channel: 'Internal portal',
      },
    ],
  },
  {
    id: 'APP-2026-45188',
    applicantName: 'Sunita Sharma',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '88/2a',
    landAreaSqM: 4100,
    proposedAreaSqM: 3200,
    tdrValueCr: 42.1,
    status: 'Pending',
    workflowStageId: 'district_draftsman',
    currentLevel: 'L1 — Data entry · District Draftsman check',
    appliedOn: '2026-05-19',
    samagraId: '998877665544',
    mobile: '98112 33445',
    address: 'Plot 4, Arera Colony, Bhopal',
    landUse: 'Commercial',
    village: 'Kohefiza',
    documents: {
      form3: 'FORM3_APP45188.pdf',
      mutation: 'Pending upload',
      landCertificate: 'LC_BPL_88_2026.pdf',
    },
    timeline: {
      dataEntry: {
        label: 'Data Entry',
        status: 'in_progress',
        date: '19 May 2026, 09:30',
        officer: 'Clerk — TCP Bhopal',
      },
      officerVerification: { label: 'Officer Verification', status: 'pending' },
      authorityApproval: { label: 'Authority Approval', status: 'pending' },
    },
    blockchain: null,
    details: {
      email: 'sunita.sharma.example@email.in',
      alternatePhone: '97555 88901',
      pincode: '462016',
      wardNo: 'Ward 42 — Kohefiza',
      propertyCategory: 'Commercial — plotted development',
      surveyNumber: 'Survey Sheet 44 / Khata 189-B',
      patwariHalka: 'PH-08 (Huzur)',
      roadWidthM: '24 m (MP SH-18 frontage)',
      encumbrance: 'Nil — as per Bhu-Naksha extract dated 12 May 2026',
      buildingPlanRef: 'BP/BPL/2026/COMM/0814 (under scrutiny)',
      waterConn: 'Pending — PHED Bhopal ref WM-PND-44821',
      electricityRRNo: 'RR-BPL-778812 (meter proposed)',
      applicationChannel: 'Online',
      assignedTo: 'Shri D.K. Malviya (Clerk L1 — District TCP Bhopal)',
      lastUpdatedOn: '20 May 2026, 08:42',
      mapB1Ref: 'B1/bhk naksha / Sheet BPL-URB-2026-189',
      courtCaseStatus: 'None on record (revenue court search 30 Apr 2026)',
      feeStatus: 'Partial — scrutiny fee received',
      amountDeposited: '₹ 25,000 / ₹ 50,000 estimated',
      paymentRef: 'MP-GRAS CHALLAN GR202605189044',
      npciTransactionId: 'NPCI-UPMIR-BPL-202605191132881',
      internalNotes:
        'Commercial conversion proposal; verify setback against MPUDP-2020 clause 6.3. Mutation draft awaited from ULB.',
      siteInspectionId: 'SI-BPL-2026-118 (scheduled 22 May 2026)',
      geoTag: '23.1996° N, 77.3915° E (approx. plot centroid)',
      colonySector: 'Arera Colony — Sector C',
      nearestRoad: 'SH-18 service road, 120 m from signal Kohefiza',
    },
    officerActivityLog: [
      {
        id: 'evt-45188-1',
        at: '19 May 2026, 08:55 IST',
        actorName: 'Applicant (portal)',
        actorRole: 'Online submission',
        department: 'Citizen portal',
        workflowTier: 'Citizen · Portal intake',
        workflowDesk: 'Application submission & GRAS payment initiation',
        action: 'Application submitted',
        fromStatus: '—',
        toStatus: 'Draft',
        remarks: 'Form saved; payment initiated via GRAS MP.',
        channel: 'Web / SSO',
      },
      {
        id: 'evt-45188-2',
        at: '19 May 2026, 09:01 IST',
        actorName: 'Smt. Payal Nigam',
        actorRole: 'Assistant Data Entry Officer',
        department: 'District TCP — Bhopal',
        workflowTier: 'District level',
        workflowDesk: 'Form-1 generation · Data entry / fee validation desk',
        action: 'Status updated · fee validated',
        fromStatus: 'Draft',
        toStatus: 'Pending',
        remarks: 'Challan GR202605189044 verified against treasury. File registered.',
        channel: 'Internal portal',
      },
      {
        id: 'evt-45188-3',
        at: '19 May 2026, 09:18 IST',
        actorName: 'Shri D.K. Malviya',
        actorRole: 'Clerk (L1)',
        department: 'District TCP — Bhopal',
        workflowTier: 'District level',
        workflowDesk: 'District Draftsman queue · Mutation / scrutiny desk',
        action: 'Forwarded for scrutiny · mutation pending',
        fromStatus: 'Pending',
        toStatus: 'Pending',
        remarks:
          'Marked mutation column “pending upload”. SMS sent to applicant with checklist CL-TDR-09.',
        channel: 'Desk workstation',
      },
      {
        id: 'evt-45188-4',
        at: '19 May 2026, 09:30 IST',
        actorName: 'Shri D.K. Malviya',
        actorRole: 'Clerk (L1)',
        department: 'District TCP — Bhopal',
        workflowTier: 'District level',
        workflowDesk: 'District Draftsman queue · Land certificate verification',
        action: 'Land certificate verified',
        fromStatus: 'Pending',
        toStatus: 'Pending',
        remarks: 'LC_BPL_88_2026.pdf cross-checked with ULB extract snapshot.',
        channel: 'Desk workstation',
      },
      {
        id: 'evt-45188-5',
        at: '20 May 2026, 08:42 IST',
        actorName: 'Shri D.K. Malviya',
        actorRole: 'Clerk (L1)',
        department: 'District TCP — Bhopal',
        workflowTier: 'District level',
        workflowDesk: 'District Draftsman queue · GIS / setback checklist',
        action: 'Scrutiny checklist updated',
        fromStatus: 'Pending',
        toStatus: 'Pending',
        remarks:
          'MPUDP-2020 setback vs SH-18 ROW verified on GIS overlay. Next: officer verification queue.',
        channel: 'Internal portal',
      },
    ],
  },
  {
    id: 'APP-2026-45172',
    applicantName: 'Vikram Singh',
    district: 'Jabalpur',
    tehsil: 'Jabalpur',
    khasraNo: '2205/b',
    landAreaSqM: 1800,
    proposedAreaSqM: 1200,
    tdrValueCr: 9.85,
    status: 'Rejected',
    workflowStageId: 'directorate_jd',
    currentLevel: 'Closed — rejected at Directorate JD',
    appliedOn: '2026-05-17',
    samagraId: '887766554433',
    mobile: '99001 22110',
    address: 'Near Stadium, Jabalpur',
    landUse: 'Industrial',
    village: 'Garha',
    documents: {
      form3: 'FORM3_APP45172.pdf',
      mutation: 'MUT_45172.pdf',
      landCertificate: 'LC_JBP_2205.pdf',
    },
    timeline: {
      dataEntry: {
        label: 'Data Entry',
        status: 'completed',
        date: '17 May 2026',
        officer: 'Clerk',
      },
      officerVerification: {
        label: 'Officer Verification',
        status: 'completed',
        date: '18 May 2026',
        officer: 'TPO',
        remark: 'Discrepancy in area',
      },
      authorityApproval: {
        label: 'Authority Approval',
        status: 'rejected',
        date: '19 May 2026',
        remark: 'Rejected — overlap with road widening',
      },
    },
    blockchain: null,
  },
  {
    id: 'APP-2026-45155',
    applicantName: 'Meera Joshi',
    district: 'Gwalior',
    tehsil: 'Gwalior',
    khasraNo: '15/b',
    landAreaSqM: 3200,
    proposedAreaSqM: 2800,
    tdrValueCr: 6.2,
    status: 'Approved',
    workflowStageId: 'drc_certificate',
    currentLevel: 'L3 — Approved · DRC / certificate generation pending',
    appliedOn: '2026-05-16',
    samagraId: '776655443322',
    mobile: '98200 77889',
    address: 'Shivpuri Link Road, Gwalior',
    landUse: 'Residential',
    village: 'Morar',
    documents: {
      form3: 'FORM3_APP45155.pdf',
      mutation: 'MUT_45155_ok.pdf',
      landCertificate: 'LC_GWL_15b.pdf',
    },
    timeline: {
      dataEntry: {
        label: 'Data Entry',
        status: 'completed',
        date: '16 May 2026',
        officer: 'Clerk',
      },
      officerVerification: {
        label: 'Officer Verification',
        status: 'completed',
        date: '17 May 2026',
        officer: 'TPO',
      },
      authorityApproval: {
        label: 'Authority Approval',
        status: 'completed',
        date: '18 May 2026',
        officer: 'JD TCP',
        remark: 'Approved subject to fee',
      },
    },
    blockchain: null,
  },
  {
    id: 'APP-2026-45140',
    applicantName: 'Anil Patidar',
    district: 'Ujjain',
    tehsil: 'Ujjain',
    khasraNo: '123/1, 124/2',
    landAreaSqM: 485,
    proposedAreaSqM: 1500,
    tdrValueCr: 14.33,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Completed — DRC issued; transfer / utilization open',
    drcIssuedOn: '18 May 2026',
    drcCertificateLedgerSno: 20,
    appliedOn: '2026-05-15',
    samagraId: '665544332211',
    mobile: '93405 11223',
    address: 'H.No. 42, Ward 18, Freeganj, Ujjain — 456010',
    landUse: 'Residential',
    village: 'Ujjain (ULB)',
    documents: {
      form3: 'FORM3_APP45140.pdf',
      mutation: 'MUT_45140.pdf',
      landCertificate: 'LC_UJJ_K123-124.pdf',
    },
    timeline: {
      dataEntry: {
        label: 'Data Entry',
        status: 'completed',
        date: '15 May 2026',
        officer: 'Clerk — TCP Ujjain',
        remark: 'Application captured & fee reconciled',
      },
      officerVerification: {
        label: 'Officer Verification',
        status: 'completed',
        date: '16 May 2026',
        officer: 'TPO / verification officer',
        remark: 'Site & documents verified',
      },
      authorityApproval: {
        label: 'Authority Approval',
        status: 'completed',
        date: '17 May 2026',
        officer: 'Joint Director (TCP)',
        remark: 'Approved — forwarded for DRC generation',
      },
    },
    blockchain: {
      hash: '0xISSUED0020',
      status: 'Anchored — verified (matches DRC ledger)',
      txId: '0xISSUED0020',
    },
  },
  {
    id: 'APP-2025-47001',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 9000,
    tdrValueCr: 35.1,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Archived — superseded by subsequent transfer DRC',
    drcIssuedOn: '04 Jan 2025',
    drcCertificateLedgerSno: 23,
    appliedOn: '2024-12-10',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: {
      form3: 'FORM3_APP47001.pdf',
      mutation: 'MUT_47001.pdf',
      landCertificate: 'LC_BPL_210_211.pdf',
    },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '22 Dec 2024', officer: 'Clerk' },
      officerVerification: { label: 'Officer Verification', status: 'completed', date: '29 Dec 2024', officer: 'TPO' },
      authorityApproval: { label: 'Authority Approval', status: 'completed', date: '03 Jan 2025', officer: 'JD TCP' },
    },
    blockchain: { hash: '0xISSUED0023', status: 'Anchored — Verified', txId: '0xISSUED0023' },
  },
  {
    id: 'APP-2025-47045',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 7600,
    tdrValueCr: 29.8,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Transfer cycle 1 completed',
    drcIssuedOn: '18 Apr 2025',
    drcCertificateLedgerSno: 24,
    appliedOn: '2025-03-18',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: { form3: 'FORM3_APP47045.pdf', mutation: 'MUT_47045.pdf', landCertificate: 'LC_BPL_210_211.pdf' },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '03 Apr 2025', officer: 'Clerk' },
      officerVerification: { label: 'Officer Verification', status: 'completed', date: '09 Apr 2025', officer: 'TPO' },
      authorityApproval: { label: 'Authority Approval', status: 'completed', date: '16 Apr 2025', officer: 'JD TCP' },
    },
    blockchain: { hash: '0xISSUED0024', status: 'Anchored — Verified', txId: '0xISSUED0024' },
  },
  {
    id: 'APP-2025-47110',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 6200,
    tdrValueCr: 24.4,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Transfer cycle 2 completed',
    drcIssuedOn: '30 Jul 2025',
    drcCertificateLedgerSno: 25,
    appliedOn: '2025-06-22',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: { form3: 'FORM3_APP47110.pdf', mutation: 'MUT_47110.pdf', landCertificate: 'LC_BPL_210_211.pdf' },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '10 Jul 2025', officer: 'Clerk' },
      officerVerification: { label: 'Officer Verification', status: 'completed', date: '19 Jul 2025', officer: 'TPO' },
      authorityApproval: { label: 'Authority Approval', status: 'completed', date: '27 Jul 2025', officer: 'JD TCP' },
    },
    blockchain: { hash: '0xISSUED0025', status: 'Anchored — Verified', txId: '0xISSUED0025' },
  },
  {
    id: 'APP-2025-47180',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 5000,
    tdrValueCr: 19.9,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Transfer cycle 3 completed',
    drcIssuedOn: '11 Nov 2025',
    drcCertificateLedgerSno: 26,
    appliedOn: '2025-10-05',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: { form3: 'FORM3_APP47180.pdf', mutation: 'MUT_47180.pdf', landCertificate: 'LC_BPL_210_211.pdf' },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '26 Oct 2025', officer: 'Clerk' },
      officerVerification: { label: 'Officer Verification', status: 'completed', date: '02 Nov 2025', officer: 'TPO' },
      authorityApproval: { label: 'Authority Approval', status: 'completed', date: '09 Nov 2025', officer: 'JD TCP' },
    },
    blockchain: { hash: '0xISSUED0026', status: 'Anchored — Verified', txId: '0xISSUED0026' },
  },
  {
    id: 'APP-2026-47240',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 3500,
    tdrValueCr: 14.1,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Transfer cycle 4 completed',
    drcIssuedOn: '09 Feb 2026',
    drcCertificateLedgerSno: 27,
    appliedOn: '2026-01-14',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: { form3: 'FORM3_APP47240.pdf', mutation: 'MUT_47240.pdf', landCertificate: 'LC_BPL_210_211.pdf' },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '25 Jan 2026', officer: 'Clerk' },
      officerVerification: { label: 'Officer Verification', status: 'completed', date: '31 Jan 2026', officer: 'TPO' },
      authorityApproval: { label: 'Authority Approval', status: 'completed', date: '07 Feb 2026', officer: 'JD TCP' },
    },
    blockchain: { hash: '0xISSUED0027', status: 'Anchored — Verified', txId: '0xISSUED0027' },
  },
  {
    id: 'APP-2026-47310',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 2000,
    tdrValueCr: 8.1,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Current live DRC — balance 2,000 sq.m',
    drcIssuedOn: '20 Apr 2026',
    drcCertificateLedgerSno: 28,
    appliedOn: '2026-03-28',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: { form3: 'FORM3_APP47310.pdf', mutation: 'MUT_47310.pdf', landCertificate: 'LC_BPL_210_211.pdf' },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '05 Apr 2026', officer: 'Clerk' },
      officerVerification: { label: 'Officer Verification', status: 'completed', date: '11 Apr 2026', officer: 'TPO' },
      authorityApproval: { label: 'Authority Approval', status: 'completed', date: '18 Apr 2026', officer: 'JD TCP' },
    },
    blockchain: { hash: '0xISSUED0028', status: 'Anchored — Verified', txId: '0xISSUED0028' },
  },
  {
    id: 'APP-2025-47001',
    applicantName: 'Rakesh Chouhan',
    district: 'Bhopal',
    tehsil: 'Huzur',
    khasraNo: '210/1, 211/2',
    landAreaSqM: 2800,
    proposedAreaSqM: 2600,
    tdrValueCr: 17.2,
    status: 'DRC Issued',
    workflowStageId: 'tdr_transfer_utilization',
    currentLevel: 'Post-certificate — transfer/utilization enabled',
    drcIssuedOn: '22 Dec 2025',
    drcCertificateLedgerSno: 23,
    appliedOn: '2025-10-01',
    samagraId: '900011112222',
    mobile: '98930 44556',
    address: 'Kolar Road, Bhopal',
    landUse: 'Residential',
    village: 'Kolar',
    documents: {
      form3: 'FORM3_APP47001.pdf',
      mutation: 'MUT_47001.pdf',
      landCertificate: 'LC_BPL_210_211_47001.pdf',
    },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'completed', date: '01 Oct 2025, 11:10', officer: 'District Clerk' },
      officerVerification: {
        label: 'Officer Verification',
        status: 'completed',
        date: '18 Oct 2025, 16:35',
        officer: 'District AD + TPO',
      },
      authorityApproval: {
        label: 'Authority Approval',
        status: 'completed',
        date: '21 Dec 2025, 15:20',
        officer: 'Commissioner TCP',
      },
    },
    blockchain: { hash: '0xISSUED0023', status: 'Anchored — Verified', txId: 'TX-DRC-2025-47001' },
    officerActivityLog: [
      {
        id: 'evt-47001-1',
        at: '01 Oct 2025, 11:08 IST',
        actorName: 'Rakesh Chouhan',
        actorRole: 'Applicant',
        department: 'Citizen portal',
        workflowTier: 'Intake',
        workflowDesk: 'Online submission',
        action: 'Application submitted',
        fromStatus: '—',
        toStatus: 'Pending',
        remarks: 'Initial submission with Form-3 and mutation attachments.',
        channel: 'Web',
      },
      {
        id: 'evt-47001-2',
        at: '04 Oct 2025, 12:42 IST',
        actorName: 'M. Trivedi',
        actorRole: 'District Draftsman',
        department: 'TCP Bhopal',
        workflowTier: 'District',
        workflowDesk: 'District Draftsman check',
        action: 'Scrutiny completed',
        fromStatus: 'Pending',
        toStatus: 'Under Review',
        remarks: 'Khasra and map references validated.',
        channel: 'Internal portal',
      },
      {
        id: 'evt-47001-3',
        at: '18 Oct 2025, 16:35 IST',
        actorName: 'A. Khan',
        actorRole: 'Assistant Director',
        department: 'TCP Bhopal',
        workflowTier: 'District',
        workflowDesk: 'District AD check',
        action: 'Verification approved',
        fromStatus: 'Under Review',
        toStatus: 'Approved',
        remarks: 'Forwarded to directorate with recommendation.',
        channel: 'Internal portal',
      },
      {
        id: 'evt-47001-4',
        at: '21 Dec 2025, 15:20 IST',
        actorName: 'Directorate Office',
        actorRole: 'Commissioner TCP',
        department: 'Directorate',
        workflowTier: 'Commissioner',
        workflowDesk: 'Commissioner final order',
        action: 'Final sanction and DRC approval',
        fromStatus: 'Approved',
        toStatus: 'DRC Issued',
        remarks: 'Certificate generated and prepared for chain anchoring.',
        channel: 'Internal portal',
      },
      {
        id: 'evt-47001-5',
        at: '22 Dec 2025, 10:06 IST',
        actorName: 'Blockchain Service',
        actorRole: 'System',
        department: 'Blockchain node',
        workflowTier: 'Certificate',
        workflowDesk: 'DRC blockchain anchor',
        action: 'On-chain anchor recorded',
        fromStatus: 'DRC Issued',
        toStatus: 'DRC Issued',
        remarks: 'Anchor hash 0xISSUED0023 confirmed.',
        channel: 'System',
      },
    ],
  },
  {
    id: 'APP-2026-45220',
    applicantName: 'Kavita Sen',
    district: 'Indore',
    tehsil: 'Depalpur',
    khasraNo: '77/3',
    landAreaSqM: 5100,
    proposedAreaSqM: 4000,
    tdrValueCr: 22.4,
    status: 'Draft',
    workflowStageId: 'tdr_request_entry',
    currentLevel: 'Draft — TDR request entry',
    appliedOn: '2026-05-20',
    samagraId: '554433221100',
    mobile: '99110 22334',
    address: 'Village Depalpur, Indore district',
    landUse: 'Agricultural → Residential',
    village: 'Depalpur',
    documents: {
      form3: 'draft_form3.pdf',
      mutation: '—',
      landCertificate: 'LC_DEP_77.pdf',
    },
    timeline: {
      dataEntry: { label: 'Data Entry', status: 'pending' },
      officerVerification: { label: 'Officer Verification', status: 'pending' },
      authorityApproval: { label: 'Authority Approval', status: 'pending' },
    },
    blockchain: null,
  },
]

export function getInitialApplicationById(id: string) {
  return initialTdrApplications.find((a) => a.id === id) ?? null
}
