/** Static detail datasets for dashboard summary card drill-down pages. */

export const METRIC_SLUGS = [
  'total-tdr-applications',
  'approved-tdrs',
  'pending-applications',
  'rejected-applications',
  'tdr-value-transferred',
  'on-chain-records',
] as const

export type MetricSlug = (typeof METRIC_SLUGS)[number]

export const totalApplicationsByDistrict = [
  { district: 'Indore', count: 3842, share: 30.8 },
  { district: 'Bhopal', count: 3110, share: 25.0 },
  { district: 'Jabalpur', count: 2204, share: 17.7 },
  { district: 'Gwalior', count: 1802, share: 14.5 },
  { district: 'Ujjain', count: 1500, share: 12.0 },
]

export const applicationsMonthlyTrend = [
  { month: 'Jan 2026', applications: 980 },
  { month: 'Feb 2026', applications: 1050 },
  { month: 'Mar 2026', applications: 1120 },
  { month: 'Apr 2026', applications: 1188 },
  { month: 'May 2026', applications: 1245 },
]

export const approvedSampleRows = [
  { appId: 'APP-2026-45155', applicant: 'Meera Joshi', district: 'Gwalior', approvedOn: '18 May 2026', tdrValueCr: 6.2 },
  { appId: 'APP-2026-45140', applicant: 'Anil Patidar', district: 'Ujjain', approvedOn: '17 May 2026', tdrValueCr: 14.33 },
  { appId: 'APP-2026-44802', applicant: 'Deepak Rao', district: 'Indore', approvedOn: '16 May 2026', tdrValueCr: 9.1 },
  { appId: 'APP-2026-44790', applicant: 'Neha Bhatt', district: 'Bhopal', approvedOn: '15 May 2026', tdrValueCr: 21.4 },
]

export const pendingQueueRows = [
  { appId: 'APP-2026-45201', applicant: 'Ramesh Verma', district: 'Indore', submitted: '18 May 2026', slaDays: 4, stage: 'Officer verification' },
  { appId: 'APP-2026-45188', applicant: 'Sunita Sharma', district: 'Bhopal', submitted: '19 May 2026', slaDays: 3, stage: 'Data entry' },
  { appId: 'APP-2026-45109', applicant: 'Arjun Patel', district: 'Jabalpur', submitted: '17 May 2026', slaDays: 5, stage: 'Authority queue' },
  { appId: 'APP-2026-45077', applicant: 'Kiran Solanki', district: 'Ujjain', submitted: '14 May 2026', slaDays: 7, stage: 'Officer verification' },
]

export const rejectedSampleRows = [
  { appId: 'APP-2026-45172', applicant: 'Vikram Singh', district: 'Jabalpur', rejectedOn: '19 May 2026', reason: 'Area discrepancy / overlap' },
  { appId: 'APP-2026-44901', applicant: 'Suresh Yadav', district: 'Indore', rejectedOn: '12 May 2026', reason: 'Incomplete mutation' },
  { appId: 'APP-2026-44844', applicant: 'Pooja Mantri', district: 'Bhopal', rejectedOn: '08 May 2026', reason: 'Land use mismatch' },
]

export const valueTransferredByDistrict = [
  { district: 'Indore', valueCr: 320.45, transfers: 4280 },
  { district: 'Bhopal', valueCr: 285.2, transfers: 3510 },
  { district: 'Jabalpur', valueCr: 242.8, transfers: 2890 },
  { district: 'Gwalior', valueCr: 198.5, transfers: 2144 },
  { district: 'Ujjain', valueCr: 165.3, transfers: 1902 },
]

export const valueTransferredMonthly = [
  { month: 'Jan', cr: 980 },
  { month: 'Feb', cr: 1055 },
  { month: 'Mar', cr: 1120 },
  { month: 'Apr', cr: 1180 },
  { month: 'May', cr: 1245.75 },
]

export const onChainRecordsRows = [
  { ref: 'ANCH-24856', type: 'Certificate anchor', channel: 'tdr-channel', block: 124602, ts: '20 May 2026, 11:31' },
  { ref: 'ANCH-24855', type: 'Transfer invoke', channel: 'tdr-channel', block: 124601, ts: '20 May 2026, 11:28' },
  { ref: 'ANCH-24854', type: 'Audit hash', channel: 'audit-channel', block: 88945, ts: '20 May 2026, 11:25' },
  { ref: 'ANCH-24853', type: 'Certificate anchor', channel: 'tdr-channel', block: 124599, ts: '20 May 2026, 11:20' },
]

export function isMetricSlug(s: string | undefined): s is MetricSlug {
  return Boolean(s && (METRIC_SLUGS as readonly string[]).includes(s))
}
