import { useLocation } from 'react-router-dom'
import PortalDataTablePage, { type PortalColumn } from '../components/PortalDataTablePage'
import {
  landPropertyRows,
  ownersRows,
  blockchainRecordsRows,
  transactionsRows,
  smartContractsRows,
  channelsRows,
  peersRows,
  analyticsRows,
  reportsRows,
  usersRolesRows,
  departmentsRows,
} from '../data/portalSectionData'

type LandRow = (typeof landPropertyRows)[number]
type OwnerRow = (typeof ownersRows)[number]
type BcRow = (typeof blockchainRecordsRows)[number]
type TxRow = (typeof transactionsRows)[number]
type ScRow = (typeof smartContractsRows)[number]
type ChRow = (typeof channelsRows)[number]
type PeerRow = (typeof peersRows)[number]
type AnRow = (typeof analyticsRows)[number]
type RpRow = (typeof reportsRows)[number]
type UrRow = (typeof usersRolesRows)[number]
type DpRow = (typeof departmentsRows)[number]

const landColumns: PortalColumn<LandRow>[] = [
  { key: 'id', label: 'Record ID' },
  { key: 'khasra', label: 'Khasra / plot' },
  { key: 'district', label: 'District' },
  { key: 'tehsil', label: 'Tehsil' },
  { key: 'areaHa', label: 'Area (ha)' },
  { key: 'drcValueSqm', label: 'DRC value (sq.m)' },
  { key: 'landUse', label: 'Land use' },
  { key: 'status', label: 'Status' },
]

const ownerColumns: PortalColumn<OwnerRow>[] = [
  { key: 'id', label: 'Owner ID' },
  { key: 'name', label: 'Name' },
  { key: 'district', label: 'District' },
  { key: 'drcLinked', label: 'DRC linked' },
  { key: 'drcValueSqm', label: 'DRC value (sq.m)' },
  { key: 'phone', label: 'Phone' },
  { key: 'kyc', label: 'KYC' },
]

const bcColumns: PortalColumn<BcRow>[] = [
  { key: 'txHash', label: 'Transaction / ref' },
  { key: 'channel', label: 'Channel' },
  { key: 'block', label: 'Block' },
  { key: 'type', label: 'Type' },
  { key: 'age', label: 'Age' },
  { key: 'outcome', label: 'Outcome' },
]

const txColumns: PortalColumn<TxRow>[] = [
  { key: 'txId', label: 'TX ID' },
  { key: 'tdrId', label: 'TDR ID' },
  { key: 'type', label: 'Type' },
  { key: 'valueCr', label: 'Value (₹ Cr)' },
  { key: 'status', label: 'Status' },
  { key: 'time', label: 'Time' },
]

const scColumns: PortalColumn<ScRow>[] = [
  { key: 'name', label: 'Function' },
  { key: 'channel', label: 'Channel' },
  { key: 'version', label: 'Version' },
  { key: 'calls24h', label: 'Calls (24h)' },
  { key: 'lastCall', label: 'Last call' },
]

const chColumns: PortalColumn<ChRow>[] = [
  { key: 'name', label: 'Channel' },
  { key: 'status', label: 'Status' },
  { key: 'orgs', label: 'Orgs' },
  { key: 'height', label: 'Height' },
  { key: 'batchTimeout', label: 'Batch timeout' },
]

const peerColumns: PortalColumn<PeerRow>[] = [
  { key: 'peer', label: 'Peer' },
  { key: 'org', label: 'Organisation' },
  { key: 'channel', label: 'Channel' },
  { key: 'status', label: 'Status' },
  { key: 'ledgerHeight', label: 'Ledger height' },
]

const anColumns: PortalColumn<AnRow>[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'period', label: 'Period' },
  { key: 'value', label: 'Value' },
  { key: 'delta', label: 'Change' },
]

const rpColumns: PortalColumn<RpRow>[] = [
  { key: 'id', label: 'Report ID' },
  { key: 'title', label: 'Title' },
  { key: 'generated', label: 'Generated' },
  { key: 'format', label: 'Format' },
  { key: 'size', label: 'Size' },
]

const urColumns: PortalColumn<UrRow>[] = [
  { key: 'user', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'lastLogin', label: 'Last login' },
  { key: 'status', label: 'Status' },
]

const dpColumns: PortalColumn<DpRow>[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Department' },
  { key: 'head', label: 'Head' },
  { key: 'staff', label: 'Staff' },
]

const SECTIONS: Record<
  string,
  {
    title: string
    subtitle: string
    columns: PortalColumn<object>[]
    rows: object[]
    filterKey?: string
    exportFileName: string
  }
> = {
  '/dashboard/land-property': {
    title: 'Land & Property',
    subtitle: 'Parcel and khasra references used in the TDR workflow (sample data).',
    columns: landColumns as PortalColumn<object>[],
    rows: landPropertyRows as object[],
    filterKey: 'district',
    exportFileName: 'land-property.csv',
  },
  '/dashboard/owners': {
    title: 'Owners',
    subtitle: 'Registered owners and linked DRC references.',
    columns: ownerColumns as PortalColumn<object>[],
    rows: ownersRows as object[],
    filterKey: 'district',
    exportFileName: 'owners.csv',
  },
  '/dashboard/blockchain-records': {
    title: 'Blockchain records',
    subtitle: 'Recent anchors and invokes visible to the super admin.',
    columns: bcColumns as PortalColumn<object>[],
    rows: blockchainRecordsRows as object[],
    filterKey: 'channel',
    exportFileName: 'blockchain-records.csv',
  },
  '/dashboard/transactions': {
    title: 'Transactions',
    subtitle: 'On-chain TDR-related transactions (sample).',
    columns: txColumns as PortalColumn<object>[],
    rows: transactionsRows as object[],
    filterKey: 'type',
    exportFileName: 'transactions.csv',
  },
  '/dashboard/smart-contracts': {
    title: 'Smart contracts',
    subtitle: 'Chaincode entry points and call volume.',
    columns: scColumns as PortalColumn<object>[],
    rows: smartContractsRows as object[],
    exportFileName: 'smart-contracts.csv',
  },
  '/dashboard/channels': {
    title: 'Channels',
    subtitle: 'Hyperledger Fabric channel configuration (sample).',
    columns: chColumns as PortalColumn<object>[],
    rows: channelsRows as object[],
    exportFileName: 'channels.csv',
  },
  '/dashboard/peers': {
    title: 'Peers',
    subtitle: 'Orderer and peer node status.',
    columns: peerColumns as PortalColumn<object>[],
    rows: peersRows as object[],
    filterKey: 'channel',
    exportFileName: 'peers.csv',
  },
  '/dashboard/analytics': {
    title: 'Analytics',
    subtitle: 'KPI snapshots for reporting (static).',
    columns: anColumns as PortalColumn<object>[],
    rows: analyticsRows as object[],
    exportFileName: 'analytics.csv',
  },
  '/dashboard/reports': {
    title: 'Reports',
    subtitle: 'Generated report catalogue.',
    columns: rpColumns as PortalColumn<object>[],
    rows: reportsRows as object[],
    exportFileName: 'reports.csv',
  },
  '/dashboard/users-roles': {
    title: 'Users & roles',
    subtitle: 'Directory of portal users (sample).',
    columns: urColumns as PortalColumn<object>[],
    rows: usersRolesRows as object[],
    filterKey: 'role',
    exportFileName: 'users-roles.csv',
  },
  '/dashboard/departments': {
    title: 'Departments',
    subtitle: 'Organisational units.',
    columns: dpColumns as PortalColumn<object>[],
    rows: departmentsRows as object[],
    exportFileName: 'departments.csv',
  },
}

export default function DashboardSectionPortalPage() {
  const { pathname } = useLocation()
  const def = SECTIONS[pathname]
  if (!def) {
    return (
      <div className="rounded-lg border border-[#e8e8e8] bg-white p-8 text-center text-sm text-[#8c8c8c]">
        This section is not configured.
      </div>
    )
  }
  return (
    <PortalDataTablePage<object>
      title={def.title}
      subtitle={def.subtitle}
      columns={def.columns}
      rows={def.rows}
      filterKey={def.filterKey}
      exportFileName={def.exportFileName}
    />
  )
}
