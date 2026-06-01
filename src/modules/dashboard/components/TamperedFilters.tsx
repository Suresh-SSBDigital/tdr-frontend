import type { TamperedSortKey, TamperedSortOrder, TamperedUserRow } from './tamperedTypes'

interface TamperedFiltersProps {
  query: string
  onQueryChange: (value: string) => void
  statusFilter: 'All' | TamperedUserRow['status']
  onStatusFilterChange: (value: 'All' | TamperedUserRow['status']) => void
  sortKey: TamperedSortKey
  onSortKeyChange: (value: TamperedSortKey) => void
  sortOrder: TamperedSortOrder
  onSortOrderChange: (value: TamperedSortOrder) => void
}

export default function TamperedFilters(props: TamperedFiltersProps) {
  const { query, onQueryChange, statusFilter, onStatusFilterChange, sortKey, onSortKeyChange, sortOrder, onSortOrderChange } = props
  return (
    <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-4'>
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder='Search by user / record / issue...'
        className='rounded-md border border-[#d9d9d9] px-3 py-2 text-sm text-[#262626] outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#91d5ff]'
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as 'All' | TamperedUserRow['status'])}
        className='rounded-md border border-[#d9d9d9] px-3 py-2 text-sm text-[#262626] outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#91d5ff]'
      >
        <option value='All'>All Status</option>
        <option value='Tampered'>Tampered</option>
        <option value='Under Review'>Under Review</option>
        <option value='Resolved'>Resolved</option>
      </select>
      <select
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as TamperedSortKey)}
        className='rounded-md border border-[#d9d9d9] px-3 py-2 text-sm text-[#262626] outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#91d5ff]'
      >
        <option value='lastActionAt'>Sort by Last Action</option>
        <option value='userName'>Sort by User Name</option>
        <option value='status'>Sort by Status</option>
      </select>
      <select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as TamperedSortOrder)}
        className='rounded-md border border-[#d9d9d9] px-3 py-2 text-sm text-[#262626] outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#91d5ff]'
      >
        <option value='desc'>Descending</option>
        <option value='asc'>Ascending</option>
      </select>
    </div>
  )
}
