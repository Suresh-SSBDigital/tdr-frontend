import { Link } from 'react-router-dom'
import { FiEye } from 'react-icons/fi'
import type { TamperedUserRow } from './tamperedTypes'

const th = 'border-b border-[#f0f0f0] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#595959]'
const td = 'border-b border-[#f5f5f5] px-3 py-2.5 text-sm text-[#262626] align-top'

function statusBadgeClass(status: TamperedUserRow['status']): string {
  if (status === 'Tampered') return 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'
  if (status === 'Under Review') return 'border-[#ffe58f] bg-[#fffbe6] text-[#ad6800]'
  return 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
}

function severityBadgeClass(severity: TamperedUserRow['severity']): string {
  if (severity === 'High') return 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'
  if (severity === 'Medium') return 'border-[#ffe58f] bg-[#fffbe6] text-[#ad6800]'
  return 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
}

function chainBadgeClass(status: TamperedUserRow['blockchainStatus']): string {
  if (status === 'Mismatch') return 'border-[#ffccc7] bg-[#fff1f0] text-[#a8071a]'
  return 'border-[#b7eb8f] bg-[#f6ffed] text-[#237804]'
}

interface TamperedTableProps {
  rows: TamperedUserRow[]
  totalRows: number
}

export default function TamperedTable({ rows, totalRows }: TamperedTableProps) {
  return (
    <>
      <div className='overflow-x-auto rounded-lg border border-[#e8e8e8]'>
        <table className='min-w-[1280px] w-full border-collapse bg-white'>
          <thead>
            <tr>
              <th className={th}>Alert ID</th>
              <th className={th}>Certificate ID</th>
              <th className={th}>User Name</th>
              <th className={th}>Record Type</th>
              <th className={th}>Tamper Type</th>
              <th className={th}>Detected On</th>
              <th className={th}>Severity</th>
              <th className={th}>Status</th>
              <th className={th}>Blockchain Status</th>
              <th className={th}>Record ID</th>
              <th className={th}>View</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcff]'}>
                <td className={`${td} font-mono text-xs`}>{r.id}</td>
                <td className={`${td} font-mono text-xs text-[#a8071a]`}>{r.certificateId}</td>
                <td className={td}>{r.userName}</td>
                <td className={td}>{r.recordType}</td>
                <td className={td}>{r.tamperType}</td>
                <td className={td}>{r.lastActionAt}</td>
                <td className={td}>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${severityBadgeClass(r.severity)}`}>
                    {r.severity}
                  </span>
                </td>
                <td className={td}>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className={td}>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${chainBadgeClass(r.blockchainStatus)}`}>
                    {r.blockchainStatus}
                  </span>
                </td>
                <td className={`${td} font-mono text-xs`}>{r.recordId}</td>
                <td className={td}>
                  <Link
                    to={`/dashboard/tampered-data/${encodeURIComponent(r.recordId)}/history`}
                    className='inline-flex items-center rounded border border-[#1890ff] px-2 py-1 text-xs font-medium text-[#1890ff] hover:bg-[#e6f7ff]'
                  >
                    <FiEye className='mr-1 h-3.5 w-3.5' /> View
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className='px-3 py-6 text-center text-sm text-[#8c8c8c]'>
                  No records found for selected search/filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className='mt-2 text-xs text-[#8c8c8c]'>
        Showing 1 to {rows.length} of {totalRows} entries
      </p>
    </>
  )
}
