/** Static rows for Super Admin section pages (search / sort / filter in UI). */

export const landPropertyRows = [
  { id: 'LP-001', khasra: '142/1', district: 'Indore', tehsil: 'Mhow', areaHa: 2.4, drcValueSqm: 5000, landUse: 'Residential', status: 'Verified' },
  { id: 'LP-002', khasra: '88/2a', district: 'Bhopal', tehsil: 'Huzur', areaHa: 1.1, drcValueSqm: 2600, landUse: 'Commercial', status: 'Under review' },
  { id: 'LP-003', khasra: '2205', district: 'Jabalpur', tehsil: 'Jabalpur', areaHa: 3.8, drcValueSqm: 4200, landUse: 'Industrial', status: 'Verified' },
  { id: 'LP-004', khasra: '15/b', district: 'Gwalior', tehsil: 'Gwalior', areaHa: 0.85, drcValueSqm: 1800, landUse: 'Mixed', status: 'Pending GIS' },
  { id: 'LP-005', khasra: '403', district: 'Ujjain', tehsil: 'Ujjain', areaHa: 1.65, drcValueSqm: 3200, landUse: 'Residential', status: 'Verified' },
]

export const ownersRows = [
  { id: 'OW-1001', name: 'Ramesh Verma', district: 'Indore', drcLinked: 'DRC/2025/00016/Indore', drcValueSqm: 5000, phone: '98765 43210', kyc: 'Aadhaar verified' },
  { id: 'OW-1002', name: 'Sunita Sharma', district: 'Bhopal', drcLinked: 'DRC/2025/00017/Indore', drcValueSqm: 2600, phone: '98112 33445', kyc: 'Aadhaar verified' },
  { id: 'OW-1003', name: 'Vikram Singh', district: 'Jabalpur', drcLinked: '—', drcValueSqm: 0, phone: '99001 22110', kyc: 'Pending' },
  { id: 'OW-1004', name: 'Meera Joshi', district: 'Gwalior', drcLinked: 'DRC/2026/00031/Indore', drcValueSqm: 1800, phone: '98200 77889', kyc: 'Aadhaar verified' },
]

export const blockchainRecordsRows = [
  { txHash: '0xa91f…c82', channel: 'tdr-channel', block: 124581, type: 'Anchor', age: '2s ago', outcome: 'Success' },
  { txHash: '0xb02e…91a', channel: 'tdr-channel', block: 124580, type: 'Invoke', age: '12s ago', outcome: 'Success' },
  { txHash: '0xc33d…045', channel: 'tdr-channel', block: 124579, type: 'Anchor', age: '35s ago', outcome: 'Success' },
  { txHash: '0xd44a…fe1', channel: 'audit-channel', block: 88921, type: 'Query', age: '1m ago', outcome: 'Success' },
]

export const transactionsRows = [
  { txId: 'TX-9f2a…c81', tdrId: 'TDR-2025-08821', type: 'Transfer', valueCr: 12.45, status: 'Success', time: '11:24 AM' },
  { txId: 'TX-3b71…9ee', tdrId: 'TDR-2025-08807', type: 'Issue', valueCr: 8.2, status: 'Success', time: '11:18 AM' },
  { txId: 'TX-5cd0…2aa', tdrId: 'TDR-2025-08792', type: 'Transfer', valueCr: 25.0, status: 'Success', time: '11:02 AM' },
  { txId: 'TX-8aa1…45f', tdrId: 'TDR-2025-08765', type: 'Utilization', valueCr: 5.75, status: 'Success', time: '10:48 AM' },
]

export const smartContractsRows = [
  { name: 'createTDRTransaction()', channel: 'tdr-channel', version: 'v2.1', calls24h: 4256, lastCall: 'Just now' },
  { name: 'transferTDR()', channel: 'tdr-channel', version: 'v2.1', calls24h: 3182, lastCall: '3s ago' },
  { name: 'verifyCertificate()', channel: 'tdr-channel', version: 'v2.0', calls24h: 2755, lastCall: '8s ago' },
  { name: 'recordUtilization()', channel: 'tdr-channel', version: 'v2.1', calls24h: 1940, lastCall: '22s ago' },
]

export const channelsRows = [
  { name: 'tdr-channel', status: 'Active', orgs: 4, height: 124580, batchTimeout: '2s' },
  { name: 'audit-channel', status: 'Active', orgs: 3, height: 88921, batchTimeout: '2s' },
  { name: 'public-query', status: 'Active', orgs: 2, height: 45210, batchTimeout: '5s' },
]

export const peersRows = [
  { peer: 'peer0.tdr.mp.gov.in', org: 'TDRCity', channel: 'tdr-channel', status: 'Running', ledgerHeight: 124580 },
  { peer: 'peer1.tdr.mp.gov.in', org: 'TDRState', channel: 'tdr-channel', status: 'Running', ledgerHeight: 124580 },
  { peer: 'peer0.audit.mp.gov.in', org: 'Audit', channel: 'audit-channel', status: 'Running', ledgerHeight: 88921 },
]

export const analyticsRows = [
  { metric: 'Applications submitted', period: 'May 2026', value: 12458, delta: '+12.5%' },
  { metric: 'Median processing time', period: 'May 2026', value: '4.2 days', delta: '-8.1%' },
  { metric: 'On-chain value %', period: 'May 2026', value: '79.3%', delta: '+2.1%' },
]

export const reportsRows = [
  { id: 'RPT-2026-014', title: 'Monthly TDR issuance', generated: '01 May 2026', format: 'PDF', size: '2.4 MB' },
  { id: 'RPT-2026-015', title: 'District-wise utilization', generated: '28 Apr 2026', format: 'XLSX', size: '890 KB' },
]

export const usersRolesRows = [
  { user: 'super.admin@mp.gov.in', role: 'Super Admin', department: 'State / TCP', lastLogin: 'Today 11:28', status: 'Active' },
  { user: 'tcp.admin@mp.gov.in', role: 'TCP Admin', department: 'TCP', lastLogin: 'Today 09:15', status: 'Active' },
  { user: 'officer.ind@mp.gov.in', role: 'TDR Officer', department: 'Indore TCP', lastLogin: 'Today 10:02', status: 'Active' },
  { user: 'auditor@mp.gov.in', role: 'Auditor', department: 'Finance', lastLogin: 'Yesterday', status: 'Active' },
]

export const departmentsRows = [
  { code: 'TCP-IND', name: 'Town & Country Planning — Indore', head: 'J. Sharma', staff: 42 },
  { code: 'TCP-BPL', name: 'Town & Country Planning — Bhopal', head: 'R. Meena', staff: 38 },
  { code: 'IT-BLK', name: 'Blockchain Integration Cell', head: 'A. Khan', staff: 12 },
]
