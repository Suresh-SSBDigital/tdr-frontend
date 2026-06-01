import { FiEye, FiGitBranch, FiMoreVertical } from 'react-icons/fi'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function TableActionMenu({
  drcId,
  certificateNo,
}: {
  drcId: string
  certificateNo: string
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (drcId === '—') {
    return (
      <div className="flex justify-center">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
          <FiMoreVertical className="h-4 w-4" />
        </span>
      </div>
    )
  }

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      {/* 3 Dot Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
          open
            ? 'border-[#1677ff] bg-[#1677ff] shadow-lg shadow-blue-100'
            : 'border-slate-200 bg-white hover:border-[#91caff] hover:bg-[#f0f7ff]'
        }`}
      >
        <FiMoreVertical
          className={`h-4 w-4 transition ${
            open ? 'text-white' : 'text-slate-600'
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-11 z-50 w-56 origin-top-right transition-all duration-200 ${
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
          
          {/* Header */}
          <div className="border-b border-slate-100 bg-[#f8fbff] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#1677ff]">
              DRC Actions
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {certificateNo}
            </p>
          </div>

          {/* View Details */}
          <Link
            to={`/dashboard/certificates/drc/${encodeURIComponent(drcId)}`}
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 px-4 py-3 transition-all hover:bg-[#f5f9ff]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-xl bg-[#e6f4ff] text-[#1677ff] ">
              <FiEye className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                View Details
              </p>
            </div>
          </Link>

          {/* History */}
          <Link
            to={`/dashboard/certificates/drc/${encodeURIComponent(drcId)}/history`}
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 border-t border-slate-100 px-4 py-3 transition-all hover:bg-[#faf5ff]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-xl bg-violet-100 text-[#722ed1]">
              <FiGitBranch className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                View History
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TableActionMenu;