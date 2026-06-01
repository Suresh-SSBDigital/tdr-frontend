interface ApplyTdrPaginationProps {
  pageSize: number
  setPageSize: (value: number) => void
  page: number
  totalPages: number
  setPage: (updater: (current: number) => number) => void
}

export default function ApplyTdrPagination({ pageSize, setPageSize, page, totalPages, setPage }: ApplyTdrPaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-[#2f4f75]">
        Rows per page
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setPage(() => 1)
          }}
          className="rounded-md border border-[#bfd4ff] bg-white px-2 py-1 text-[#1f2d3d]"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded border border-[#bfd4ff] bg-white px-3 py-1.5 text-[#2f54eb] hover:bg-[#edf2ff] disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-[#2f4f75]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded border border-[#bfd4ff] bg-white px-3 py-1.5 text-[#2f54eb] hover:bg-[#edf2ff] disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
