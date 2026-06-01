import { useMemo, useState } from 'react'
import { FiFilter, FiUpload } from 'react-icons/fi'
import { PageHeader } from '../components'
import TamperedFilters from '../components/TamperedFilters'
import TamperedStats from '../components/TamperedStats'
import TamperedTable from '../components/TamperedTable'
import type { TamperedSortKey, TamperedSortOrder, TamperedUserRow } from '../components/tamperedTypes'

const rows: TamperedUserRow[] = [
  {
    id: 'TAMP-001',
    certificateId: 'DRC-2026-000125',
    userName: 'Rakesh Chouhan',
    userId: 'USR-7782',
    recordId: 'APP-2025-47180',
    recordType: 'Land Details',
    tamperType: 'Data Modified',
    status: 'Tampered',
    blockchainStatus: 'Mismatch',
    severity: 'High',
    lastActionAt: '05-05-2026 10:20',
    tamperedField: 'Transferred area mismatch',
  },
  {
    id: 'TAMP-002',
    certificateId: 'DRC-2026-000124',
    userName: 'Anil Patidar',
    userId: 'USR-4419',
    recordId: 'APP-2026-45140',
    recordType: 'Owner Details',
    tamperType: 'Value Changed',
    status: 'Under Review',
    blockchainStatus: 'Mismatch',
    severity: 'Medium',
    lastActionAt: '05-05-2026 09:45',
    tamperedField: 'Owner linkage changed',
  },
  {
    id: 'TAMP-003',
    certificateId: 'DRC-2024-007700',
    userName: 'Vasu Jhawar',
    userId: 'USR-2355',
    recordId: 'APP-2024-39812',
    recordType: 'Area Details',
    tamperType: 'Data Modified',
    status: 'Resolved',
    blockchainStatus: 'Matched',
    severity: 'Low',
    lastActionAt: '04-05-2026 18:05',
    tamperedField: 'Historic tx hash corrected',
  },
  {
    id: 'TAMP-004',
    certificateId: 'DRC-2025-000119',
    userName: 'Pooja Verma',
    userId: 'USR-8842',
    recordId: 'APP-2025-47001',
    recordType: 'Land Details',
    tamperType: 'File Tampered',
    status: 'Under Review',
    blockchainStatus: 'Mismatch',
    severity: 'Medium',
    lastActionAt: '04-05-2026 03:10',
    tamperedField: 'Document checksum mismatch',
  },
]

function parseDateTime(raw: string): number {
  const m = raw.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/)
  if (!m) return 0
  const [, dd, mm, yyyy, hh, min] = m
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min)).getTime()
}

export default function TamperedDataPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | TamperedUserRow['status']>('All')
  const [sortKey, setSortKey] = useState<TamperedSortKey>('lastActionAt')
  const [sortOrder, setSortOrder] = useState<TamperedSortOrder>('desc')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = rows.filter((r) => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter
      const matchQuery =
        q.length === 0 ||
        r.userName.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q) ||
        r.recordId.toLowerCase().includes(q) ||
        r.tamperedField.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })

    base.sort((a, b) => {
      let comp = 0
      if (sortKey === 'lastActionAt') comp = parseDateTime(a.lastActionAt) - parseDateTime(b.lastActionAt)
      else if (sortKey === 'userName') comp = a.userName.localeCompare(b.userName)
      else comp = a.status.localeCompare(b.status)
      return sortOrder === 'asc' ? comp : -comp
    })
    return base
  }, [query, statusFilter, sortKey, sortOrder])

  const totalTampered = rows.filter((r) => r.status === 'Tampered').length
  const pendingReview = rows.filter((r) => r.status === 'Under Review').length
  const highSeverity = rows.filter((r) => r.severity === 'High').length
  const verified = rows.filter((r) => r.blockchainStatus === 'Matched').length

  return (
    <div className='space-y-4'>
      <PageHeader
        title='Tampered Data'
        subtitle='List of tampered or suspicious records detected on blockchain.'
      />

      <section className='rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div className='text-xs text-[#8c8c8c]'>Home / Tamper Alerts</div>
          <div className='flex gap-2'>
            <button className='inline-flex items-center gap-1 rounded border border-[#d9d9d9] px-3 py-1.5 text-xs font-medium text-[#262626] hover:bg-[#fafafa]'>
              <FiUpload className='h-3.5 w-3.5' /> Export Report
            </button>
            <button className='inline-flex items-center gap-1 rounded border border-[#d9d9d9] px-3 py-1.5 text-xs font-medium text-[#262626] hover:bg-[#fafafa]'>
              <FiFilter className='h-3.5 w-3.5' /> Filter
            </button>
          </div>
        </div>

        <TamperedStats totalTampered={totalTampered} pendingReview={pendingReview} highSeverity={highSeverity} verified={verified} />
        <TamperedFilters
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <TamperedTable rows={filteredRows} totalRows={rows.length} />
      </section>
    </div>
  )
}
