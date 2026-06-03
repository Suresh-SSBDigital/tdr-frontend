import { FiSearch } from 'react-icons/fi'
import type { ApplicationStatus } from '../data/tdrApplicationsData'
import { APPLICATION_STATUS_OPTIONS } from '../data/tdrApplicationsData'

const inputClass =
  'w-full rounded-lg border border-[#bfd4ff] bg-white px-3 py-2 text-sm text-[#1f2d3d] placeholder:text-[#9ab0cf] focus:border-[#2f54eb] focus:outline-none focus:ring-2 focus:ring-[#2f54eb]/20'

export type ApplySortKey =
  | 'appliedOn'
  | 'tdrValueCr'
  | 'transferredTdrValue'
  | 'applicantName'
  | 'district'
  | 'status'

interface ApplyTdrFiltersProps {
  sortKey: ApplySortKey
  sortDir: 'asc' | 'desc'
  setSortKey: (key: ApplySortKey) => void
  setSortDir: (dir: 'asc' | 'desc') => void
  search: string
  setSearch: (value: string) => void
  district: string
  setDistrict: (value: string) => void
  tehsil: string
  setTehsil: (value: string) => void
  status: ApplicationStatus | 'All'
  setStatus: (value: ApplicationStatus | 'All') => void
  dateFrom: string
  setDateFrom: (value: string) => void
  dateTo: string
  setDateTo: (value: string) => void
  districts: string[]
  tehsils: string[]
  resetPage: () => void
}

export default function ApplyTdrFilters(props: ApplyTdrFiltersProps) {
  const {
    search,
    setSearch,
    district,
    setDistrict,
    tehsil,
    setTehsil,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    districts,
    tehsils,
    resetPage,
  } = props

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
      <div className="relative lg:col-span-2">
        <label className="mb-1 block text-xs font-medium text-[#595959]">Search</label>

        <FiSearch className="pointer-events-none mt-2 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7da0d9]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            resetPage()
          }}
          placeholder="Search ID, name, district, khasra..."
          className={`${inputClass} pl-10`}
          aria-label="Search applications"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">District</label>
        <select
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value)
            setTehsil('All')
            resetPage()
          }}
          className={inputClass}
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Tehsil</label>
        <select
          value={tehsil}
          onChange={(e) => {
            setTehsil(e.target.value)
            resetPage()
          }}
          className={inputClass}
        >
          {tehsils.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Status</label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ApplicationStatus | 'All')
            resetPage()
          }}
          className={inputClass}
        >
          <option value="All">All statuses</option>
          {APPLICATION_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Applied from</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value)
            resetPage()
          }}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#595959]">Applied to</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value)
            resetPage()
          }}
          className={inputClass}
        />
      </div>
    </div>
  )
}
