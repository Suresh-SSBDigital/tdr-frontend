import { useMemo, useState } from 'react'
import { PageHeader } from '../components'
import { USER_ROLE_LABELS, isReadOnlyApplicationViewer } from '../../../constants/userRoles'
import { useTdr } from '../../../context/useTdr'
import { useTdrApplications } from '../../../context/TdrApplicationsContext'
import type { ApplicationStatus } from '../data/tdrApplicationsData'
import ApplyTdrFilters, { type ApplySortKey } from '../components/ApplyTdrFilters'
import ApplyTdrTable from '../components/ApplyTdrTable'
import ApplyTdrPagination from '../components/ApplyTdrPagination'

const cardClass = 'rounded-xl border border-[#d6e4ff] bg-[#f8fbff] p-4 shadow-[0_4px_16px_-12px_rgba(29,57,196,0.35)]'

export default function ApplyTdrPage() {
  const { role } = useTdr()
  const { applications, isLoading } = useTdrApplications()
  const readOnlyPortal = isReadOnlyApplicationViewer(role)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('All')
  const [tehsil, setTehsil] = useState('All')
  const [status, setStatus] = useState<ApplicationStatus | 'All'>('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<ApplySortKey>('appliedOn')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const districts = useMemo(
    () => ['All', ...Array.from(new Set(applications.map((a) => a.district))).sort()],
    [applications],
  )

  const tehsils = useMemo(() => {
    const list = applications
      .filter((a) => district === 'All' || a.district === district)
      .map((a) => a.tehsil)
    return ['All', ...Array.from(new Set(list)).sort()]
  }, [applications, district])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications.filter((a) => {
      if (district !== 'All' && a.district !== district) return false
      if (tehsil !== 'All' && a.tehsil !== tehsil) return false
      if (status !== 'All' && a.status !== status) return false
      if (dateFrom && a.appliedOn < dateFrom) return false
      if (dateTo && a.appliedOn > dateTo) return false
      if (!q) return true
      return (
        a.id.toLowerCase().includes(q) ||
        a.applicantName.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.tehsil.toLowerCase().includes(q) ||
        a.khasraNo.toLowerCase().includes(q) ||
        a.currentLevel.toLowerCase().includes(q)
      )
    })
  }, [applications, search, district, tehsil, status, dateFrom, dateTo])

  const sorted = useMemo(() => {
    const list = [...filtered].sort((a, b) => {
      const va = sortKey === 'transferredTdrValue' ? (a.transferredTdrValue ?? 0) : a[sortKey]
      const vb = sortKey === 'transferredTdrValue' ? (b.transferredTdrValue ?? 0) : b[sortKey]
      let c = 0
      if (typeof va === 'number' && typeof vb === 'number') c = va - vb
      else if (sortKey === 'appliedOn') c = String(va).localeCompare(String(vb))
      else c = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDir === 'asc' ? c : -c
    })
    return list
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'appliedOn' || key === 'tdrValueCr' || key === 'transferredTdrValue' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f8fb]">
        <div className="inline-flex items-center gap-3 rounded-xl border border-[#d6e4ff] bg-white px-5 py-3 text-sm font-medium text-[#1d39c4] shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#91caff] border-t-transparent" />
          Loading applications...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="TDR applications"
        subtitle={
          readOnlyPortal
            ? `${USER_ROLE_LABELS[role]} · search, filter, and open applications for read-only details (no statutory approvals from this role).`
            : `${USER_ROLE_LABELS[role]} · search, filter, and open applications for review at your workflow tier.`
        }
      />
      <section className={`${cardClass} space-y-4`}>
        <ApplyTdrFilters
          sortKey={sortKey}
          sortDir={sortDir}
          setSortKey={setSortKey}
          setSortDir={setSortDir}
          search={search}
          setSearch={setSearch}
          district={district}
          setDistrict={setDistrict}
          tehsil={tehsil}
          setTehsil={setTehsil}
          status={status}
          setStatus={setStatus}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          districts={districts}
          tehsils={tehsils}
          resetPage={() => setPage(1)}
        />
        <ApplyTdrTable
          rows={pageRows}
          totalRecords={sorted.length}
          sortKey={sortKey}
          sortDir={sortDir}
          onToggleSort={toggleSort}
        />
        <ApplyTdrPagination pageSize={pageSize} setPageSize={setPageSize} page={page} totalPages={totalPages} setPage={setPage} />
      </section>
    </div>
  )
}
