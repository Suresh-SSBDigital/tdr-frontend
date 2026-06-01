import { Link, useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { USER_ROLE_LABELS, isReadOnlyApplicationViewer } from '../../../constants/userRoles'
import { useTdr } from '../../../context/useTdr'
import PortalDataTablePage, { type PortalColumn } from '../components/PortalDataTablePage'
import { PageHeader } from '../components'
import {
  applicationsMonthlyTrend,
  approvedSampleRows,
  isMetricSlug,
  type MetricSlug,
  onChainRecordsRows,
  pendingQueueRows,
  rejectedSampleRows,
  totalApplicationsByDistrict,
  valueTransferredByDistrict,
  valueTransferredMonthly,
} from '../data/metricDetailData'

const card = 'rounded-lg border border-[#e8e8e8] bg-white p-4 shadow-sm'

const DISTRICT_COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2']

const districtCols: PortalColumn<(typeof totalApplicationsByDistrict)[0]>[] = [
  { key: 'district', label: 'District' },
  { key: 'count', label: 'Applications' },
  {
    key: 'share',
    label: 'Share %',
    render: (r) => <span className="tabular-nums">{r.share}%</span>,
  },
]

const monthlyCols: PortalColumn<(typeof applicationsMonthlyTrend)[0]>[] = [
  { key: 'month', label: 'Month' },
  { key: 'applications', label: 'Applications' },
]

const approvedCols: PortalColumn<(typeof approvedSampleRows)[0]>[] = [
  {
    key: 'appId',
    label: 'Application ID',
    render: (r) => (
      <Link to={`/dashboard/apply/${encodeURIComponent(r.appId)}`} className="font-mono text-xs text-[#1890ff] hover:underline">
        {r.appId}
      </Link>
    ),
  },
  { key: 'applicant', label: 'Applicant' },
  { key: 'district', label: 'District' },
  { key: 'approvedOn', label: 'Approved on' },
  {
    key: 'tdrValueCr',
    label: 'TDR value (₹ Cr)',
    render: (r) => <span className="tabular-nums">{r.tdrValueCr.toFixed(2)}</span>,
  },
]

const pendingCols: PortalColumn<(typeof pendingQueueRows)[0]>[] = [
  {
    key: 'appId',
    label: 'Application ID',
    render: (r) => (
      <Link to={`/dashboard/apply/${encodeURIComponent(r.appId)}`} className="font-mono text-xs text-[#1890ff] hover:underline">
        {r.appId}
      </Link>
    ),
  },
  { key: 'applicant', label: 'Applicant' },
  { key: 'district', label: 'District' },
  { key: 'submitted', label: 'Submitted' },
  {
    key: 'slaDays',
    label: 'Days in stage',
    render: (r) => <span className="tabular-nums">{r.slaDays}</span>,
  },
  { key: 'stage', label: 'Current stage' },
]

const rejectedCols: PortalColumn<(typeof rejectedSampleRows)[0]>[] = [
  {
    key: 'appId',
    label: 'Application ID',
    render: (r) => (
      <Link to={`/dashboard/apply/${encodeURIComponent(r.appId)}`} className="font-mono text-xs text-[#1890ff] hover:underline">
        {r.appId}
      </Link>
    ),
  },
  { key: 'applicant', label: 'Applicant' },
  { key: 'district', label: 'District' },
  { key: 'rejectedOn', label: 'Rejected on' },
  { key: 'reason', label: 'Reason' },
]

const valueDistrictCols: PortalColumn<(typeof valueTransferredByDistrict)[0]>[] = [
  { key: 'district', label: 'District' },
  {
    key: 'valueCr',
    label: 'Value (₹ Cr)',
    render: (r) => <span className="tabular-nums">{r.valueCr.toFixed(2)}</span>,
  },
  {
    key: 'transfers',
    label: 'Transfer events',
    render: (r) => <span className="tabular-nums">{r.transfers.toLocaleString('en-IN')}</span>,
  },
]

const monthlyValueCols: PortalColumn<(typeof valueTransferredMonthly)[0]>[] = [
  { key: 'month', label: 'Month' },
  {
    key: 'cr',
    label: 'Value (₹ Cr)',
    render: (r) => <span className="tabular-nums">{r.cr.toFixed(2)}</span>,
  },
]

const onChainCols: PortalColumn<(typeof onChainRecordsRows)[0]>[] = [
  { key: 'ref', label: 'Reference' },
  { key: 'type', label: 'Type' },
  { key: 'channel', label: 'Channel' },
  {
    key: 'block',
    label: 'Block',
    render: (r) => <span className="tabular-nums">{r.block.toLocaleString('en-IN')}</span>,
  },
  { key: 'ts', label: 'Timestamp' },
]

export default function DashboardMetricDetailPage() {
  const { metricSlug } = useParams()
  const slug = metricSlug ?? ''

  if (!isMetricSlug(slug)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Metric not found" subtitle="This dashboard metric does not exist." />
        <Link to="/dashboard" className="text-sm font-medium text-[#1890ff] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={titles[slug].h}
        subtitle={titles[slug].s}
        action={
          <Link
            to="/dashboard"
            className="rounded-md border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-[#262626] hover:border-[#1890ff] hover:text-[#1890ff]"
          >
            ← Dashboard
          </Link>
        }
      />

      <section className={`${card} grid grid-cols-2 gap-4 sm:grid-cols-4`}>
        {titles[slug].kpis.map((k) => (
          <div key={k.label}>
            <p className="text-xs text-[#8c8c8c]">{k.label}</p>
            <p className="text-lg font-bold text-[#262626]">{k.value}</p>
          </div>
        ))}
      </section>

      {slug === 'total-tdr-applications' && <TotalTdrApplications />}
      {slug === 'approved-tdrs' && <ApprovedTdrs />}
      {slug === 'pending-applications' && <PendingApplications />}
      {slug === 'rejected-applications' && <RejectedApplications />}
      {slug === 'tdr-value-transferred' && <TdrValueTransferred />}
      {slug === 'on-chain-records' && <OnChainRecords />}
    </div>
  )
}

const titles: Record<MetricSlug, { h: string; s: string; kpis: { label: string; value: string }[] }> = {
  'total-tdr-applications': {
    h: 'Total TDR applications',
    s: 'Search, sort, and filter district split and monthly intake (static summary).',
    kpis: [
      { label: 'Total applications', value: '12,458' },
      { label: 'Trend vs last period', value: '▲ 12.5%' },
      { label: 'Reporting window', value: 'May 2026 (MTD)' },
      { label: 'Channels', value: 'TCP + blockchain portal' },
    ],
  },
  'approved-tdrs': {
    h: 'Approved TDRs',
    s: 'Recently approved applications — filter and export below.',
    kpis: [
      { label: 'Approved count', value: '8,742' },
      { label: 'Trend', value: '▲ 15.3%' },
      { label: 'Approval rate (MTD)', value: '~70.2%' },
      { label: 'Avg. processing', value: '4.1 working days' },
    ],
  },
  'pending-applications': {
    h: 'Pending applications',
    s: 'Queue snapshot — use search and filters; open an ID for read-only details.',
    kpis: [
      { label: 'Pending count', value: '2,153' },
      { label: 'Trend', value: '▲ 5.7%' },
      { label: 'Oldest in queue', value: '9 days' },
      { label: 'Escalations', value: '42' },
    ],
  },
  'rejected-applications': {
    h: 'Rejected applications',
    s: 'Recent rejections with reasons — search and sort below.',
    kpis: [
      { label: 'Rejected count', value: '1,563' },
      { label: 'Trend', value: '▼ 3.2%' },
      { label: 'Top reason', value: 'Documentation' },
      { label: 'Re-submissions', value: '318' },
    ],
  },
  'tdr-value-transferred': {
    h: 'TDR value transferred',
    s: 'District and monthly value tables with charts.',
    kpis: [
      { label: 'Total transferred', value: '₹ 1,245.75 Cr' },
      { label: 'Trend', value: '▲ 18.6%' },
      { label: 'Transactions', value: '14,725' },
      { label: 'Avg. ticket size', value: '₹ 84.6 L' },
    ],
  },
  'on-chain-records': {
    h: 'On-chain records',
    s: 'Anchors and invokes — filter by channel, search timestamps.',
    kpis: [
      { label: 'Total anchors', value: '24,856' },
      { label: 'Trend', value: '▲ 20.4%' },
      { label: 'Network height', value: '124,602' },
      { label: 'Channels active', value: '3' },
    ],
  },
}

function TotalTdrApplications() {
  const { role } = useTdr()
  const readOnly = isReadOnlyApplicationViewer(role)

  return (
    <>
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Applications by district (share %)"
        columns={districtCols as PortalColumn<object>[]}
        rows={totalApplicationsByDistrict as object[]}
        searchPlaceholder="Search district, count, share…"
        filterKey="district"
        filterLabel="District"
        exportFileName="applications-by-district.csv"
      />
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Monthly intake trend (table)"
        columns={monthlyCols as PortalColumn<object>[]}
        rows={applicationsMonthlyTrend as object[]}
        searchPlaceholder="Search month or volume…"
        exportFileName="monthly-intake.csv"
      />
      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold text-[#262626]">Monthly intake (chart)</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={applicationsMonthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" name="Applications" stroke="#1890ff" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <p className="text-sm text-[#595959]">
        {readOnly ? (
          <>
            View live applications ({USER_ROLE_LABELS[role]} read-only):{' '}
          </>
        ) : (
          <>Open applications for {USER_ROLE_LABELS[role]}: </>
        )}
        <Link to="/dashboard/apply" className="font-medium text-[#1890ff] hover:underline">
          TDR applications list
        </Link>
      </p>
    </>
  )
}

function ApprovedTdrs() {
  return (
    <>
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Recent approvals"
        columns={approvedCols as PortalColumn<object>[]}
        rows={approvedSampleRows as object[]}
        searchPlaceholder="Search ID, applicant, district…"
        filterKey="district"
        filterLabel="District"
        exportFileName="approved-tdrs.csv"
      />
      <p className="text-sm text-[#595959]">
        DRC certificates:{' '}
        <Link to="/dashboard/certificates" className="font-medium text-[#1890ff] hover:underline">
          DRC certificates
        </Link>
      </p>
    </>
  )
}

function PendingApplications() {
  return (
    <>
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Pending queue"
        columns={pendingCols as PortalColumn<object>[]}
        rows={pendingQueueRows as object[]}
        searchPlaceholder="Search ID, applicant, stage…"
        filterKey="district"
        filterLabel="District"
        exportFileName="pending-applications.csv"
      />
      <p className="text-sm text-[#595959]">
        Full list with filters:{' '}
        <Link to="/dashboard/apply" className="font-medium text-[#1890ff] hover:underline">
          Open applications
        </Link>
      </p>
    </>
  )
}

function RejectedApplications() {
  return (
    <>
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Recent rejections"
        columns={rejectedCols as PortalColumn<object>[]}
        rows={rejectedSampleRows as object[]}
        searchPlaceholder="Search ID, applicant, reason…"
        filterKey="district"
        filterLabel="District"
        exportFileName="rejected-applications.csv"
      />
      <p className="text-sm text-[#595959]">
        Applications workspace:{' '}
        <Link to="/dashboard/apply" className="font-medium text-[#1890ff] hover:underline">
          Applications
        </Link>
      </p>
    </>
  )
}

function TdrValueTransferred() {
  return (
    <>
      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold text-[#262626]">Value by district (₹ Cr) — chart</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={valueTransferredByDistrict} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="district" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value ?? ''} Cr`, 'Value']} />
              <Bar dataKey="valueCr" radius={[4, 4, 0, 0]}>
                {valueTransferredByDistrict.map((_, i) => (
                  <Cell key={i} fill={DISTRICT_COLORS[i % DISTRICT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <PortalDataTablePage
        variant="embedded"
        cardTitle="District summary (table)"
        columns={valueDistrictCols as PortalColumn<object>[]}
        rows={valueTransferredByDistrict as object[]}
        searchPlaceholder="Search district, value, transfers…"
        filterKey="district"
        filterLabel="District"
        exportFileName="tdr-value-by-district.csv"
      />
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Monthly transferred value (₹ Cr)"
        columns={monthlyValueCols as PortalColumn<object>[]}
        rows={valueTransferredMonthly as object[]}
        searchPlaceholder="Search month…"
        exportFileName="tdr-value-monthly.csv"
      />
      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold text-[#262626]">Monthly trend (chart)</h2>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={valueTransferredMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value ?? ''} Cr`, 'Transferred']} />
              <Line type="monotone" dataKey="cr" stroke="#13c2c2" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <p className="text-sm text-[#595959]">
        Transfer module:{' '}
        <Link to="/dashboard/transfer" className="font-medium text-[#1890ff] hover:underline">
          TDR transfer
        </Link>
      </p>
    </>
  )
}

function OnChainRecords() {
  return (
    <>
      <PortalDataTablePage
        variant="embedded"
        cardTitle="Recent anchors & invokes"
        columns={onChainCols as PortalColumn<object>[]}
        rows={onChainRecordsRows as object[]}
        searchPlaceholder="Search ref, type, channel, block, time…"
        filterKey="channel"
        filterLabel="Channel"
        exportFileName="on-chain-records.csv"
      />
      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold text-[#262626]">Network snapshot</h2>
        <ul className="space-y-2 text-sm text-[#595959]">
          <li>
            <strong className="text-[#262626]">Ledger height:</strong> 124,602 blocks
          </li>
          <li>
            <strong className="text-[#262626]">Avg. block time:</strong> 2.35s (tdr-channel)
          </li>
          <li>
            <strong className="text-[#262626]">Orderer:</strong> Running · <strong className="text-[#52c41a]">Healthy</strong>
          </li>
        </ul>
      </section>
      <p className="text-sm text-[#595959]">
        <Link to="/dashboard/blockchain-records" className="font-medium text-[#1890ff] hover:underline">
          Blockchain records
        </Link>{' '}
        ·{' '}
        <Link to="/dashboard/transactions" className="font-medium text-[#1890ff] hover:underline">
          Transactions
        </Link>
      </p>
    </>
  )
}
