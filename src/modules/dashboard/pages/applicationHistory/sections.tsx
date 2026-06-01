import type { ReactElement } from 'react'
import { FiFileText, FiMapPin, FiUser } from 'react-icons/fi'
import { card, d, n, td, th } from './helpers'
import type { FullResponse, HistoryItem } from './types'

export function HeaderSection({ tdr, decodedId, rid }: { tdr: FullResponse['tdr']; decodedId: string; rid: string }) {
  return (
    <section className={card}>
      <div className="border-b border-[#edf0f5] px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[30px] font-semibold leading-tight text-[#1f2d3d]">TDR Application Details</h1>
            <span className="rounded bg-[#e9f9ee] px-2 py-0.5 text-[11px] font-semibold text-[#237804]">{tdr?.project?.status ?? '-'}</span>
          </div>
          <p className="text-xs font-semibold text-[#35558f]">{tdr?.tdrApplicationId ?? '-'}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#697586]">
          <p>Application ID: {tdr?.application_id ?? decodedId}</p>
          <p>RID: {rid}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <section className="rounded-xl border border-[#edf0f5] bg-white p-4 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[20px] font-semibold text-[#1f2d3d]">
              <FiUser className="h-5 w-5 text-[#1677ff]" />
              Owner Information
            </p>
            <span className="rounded bg-[#e9f9ee] px-2 py-0.5 text-[11px] font-semibold text-[#237804]">
              {tdr?.owner?.owner_ekyc ? 'eKYC Verified' : 'eKYC Pending'}
            </span>
          </div>
          <p className="text-[26px] font-semibold leading-tight text-[#1f2d3d]">{tdr?.owner?.name ?? '-'}</p>
          <div className="mt-3 space-y-2 text-[13px] text-[#4b5563]">
            <p className="flex justify-between border-b border-[#f2f4f8] pb-1"><span>Owner ID</span><span className="font-medium text-[#1f2d3d]">{tdr?.owner?.owner_id ?? '-'}</span></p>
            <p className="flex justify-between border-b border-[#f2f4f8] pb-1"><span>Gender</span><span className="font-medium text-[#1f2d3d]">{tdr?.owner?.owner_gender ?? '-'}</span></p>
            <p className="flex justify-between border-b border-[#f2f4f8] pb-1"><span>Date of Birth</span><span className="font-medium text-[#1f2d3d]">{tdr?.owner?.dob ?? '-'}</span></p>
            <p className="flex justify-between border-b border-[#f2f4f8] pb-1"><span>Samagra ID</span><span className="font-medium text-[#1f2d3d]">{tdr?.owner?.samagra_id ?? '-'}</span></p>
            <p className="flex justify-between border-b border-[#f2f4f8] pb-1"><span>Mobile</span><span className="font-medium text-[#1f2d3d]">{tdr?.owner?.mobile ?? '-'}</span></p>
            <p className="flex justify-between border-b border-[#f2f4f8] pb-1"><span>Email</span><span className="font-medium text-[#1f2d3d]">{tdr?.owner?.email ?? '-'}</span></p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded bg-[#e9f9ee] px-2.5 py-1 text-[12px] font-semibold text-[#237804]">
              {tdr?.owner?.is_first_owner ? 'First Owner' : 'Owner'}
            </span>
            <p className="text-right text-[12px] text-[#6b7280]">
              Current Balance
              <span className="ml-1 block text-[24px] font-semibold leading-none text-[#1677ff]">
                {n(tdr?.owner?.current_balance_tdr, ' TDR')}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#edf0f5] bg-white p-4 lg:col-span-8">
          <p className="mb-3 flex items-center gap-2 text-[20px] font-semibold text-[#1f2d3d]">
            <FiFileText className="h-5 w-5 text-[#1677ff]" />
            Project Information
          </p>
          <div className="grid grid-cols-1 gap-4 text-[13px] text-[#4b5563] md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[13px] text-[#6b7280]">Project Name</p>
              <p className="font-semibold text-[#1f2d3d]">{tdr?.project?.project_name ?? '-'}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">Implementing Agency</p>
              <p className="font-semibold text-[#1f2d3d]">{tdr?.project?.implement_agency ?? '-'}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">Location</p>
              <p className="flex items-center gap-1 font-semibold text-[#1f2d3d]">
                <FiMapPin className="h-4 w-4" />
                {[tdr?.project?.district, tdr?.project?.tehsil, tdr?.project?.village].filter(Boolean).join(', ') || '-'}
              </p>
              <p className="pt-1 text-[13px] text-[#6b7280]">Project Stage</p>
              <p className="inline-flex rounded bg-[#fff7e6] px-2 py-0.5 text-[11px] font-semibold text-[#ad6800]">{tdr?.project?.project_stage ?? '-'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] text-[#6b7280]">Government Order No.</p>
              <p className="font-semibold text-[#1f2d3d]">{tdr?.project?.govt_order_no ?? '-'}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">Government Order Date</p>
              <p className="font-semibold text-[#1f2d3d]">{d(tdr?.project?.govt_order_dt)}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">Status</p>
              <p className="inline-flex rounded bg-[#e9f9ee] px-2 py-0.5 text-[11px] font-semibold text-[#237804]">{tdr?.project?.status ?? '-'}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">DRC Certificate No.</p>
              <p className="font-semibold text-[#1f2d3d]">{tdr?.project?.drc_certificate_no ?? '-'}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">DRC Generation Date</p>
              <p className="font-semibold text-[#1f2d3d]">{d(tdr?.project?.drc_generation_dt)}</p>
              <p className="pt-1 text-[13px] text-[#6b7280]">DRC ID</p>
              <p className="truncate font-mono text-[12px] text-[#1f2d3d]">{tdr?.project?.drc_id ?? '-'}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export function SummarySection({
  summary,
}: {
  summary: Array<{ label: string; value: string; icon: ReactElement; tone: string; bg: string; border: string }>
}) {
  return (
    <section className={card}>
      <div className="border-b border-[#edf0f5] px-4 py-2.5 text-sm font-semibold text-[#1f2d3d]">TDR Summary</div>
      <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
            <p className="mb-1 flex items-center gap-2 text-xs text-[#5f6b7a]">{s.icon}{s.label}</p>
            <p className={`text-[26px] font-semibold leading-none ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LandPlotsSection({ tdr }: { tdr: FullResponse['tdr'] }) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <section className={`${card} xl:col-span-3`}>
        <div className="border-b border-[#edf0f5] px-4 py-2.5 text-sm font-semibold text-[#1f2d3d]">Land Information</div>
        <div className="space-y-2 p-4 text-[12px]">
          <div className="flex justify-between"><span className="text-[#6b7280]">Land ID</span><span>{tdr?.land?.land_id ?? '-'}</span></div>
          <div className="flex justify-between"><span className="text-[#6b7280]">Khasra No.</span><span>{tdr?.land?.khasra_no ?? '-'}</span></div>
          <div className="flex justify-between"><span className="text-[#6b7280]">Total Area</span><span>{n(tdr?.land?.total_area, ' sq.m')}</span></div>
          <div className="flex justify-between"><span className="text-[#6b7280]">Proposed Area</span><span>{n(tdr?.land?.proposed_area, ' sq.m')}</span></div>
          <div className="flex justify-between"><span className="text-[#6b7280]">TDR Value</span><span>{n(tdr?.land?.value_tdr, ' TDR')}</span></div>
        </div>
      </section>

      <section className={`${card} xl:col-span-9`}>
        <div className="flex items-center justify-between border-b border-[#edf0f5] px-4 py-2.5">
          <p className="text-sm font-semibold text-[#1f2d3d]">Plots Details</p>
          <button type="button" className="rounded border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-1 text-xs font-semibold text-[#1d39c4]">View on Map</button>
        </div>
        <div className="overflow-x-auto p-2.5">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr>
                <th className={th}>Plot ID</th>
                <th className={th}>Plot No.</th>
                <th className={th}>Registry Area (sq.m)</th>
                <th className={th}>Proposed Area (sq.m)</th>
                <th className={th}>Ownership</th>
                <th className={th}>Location</th>
              </tr>
            </thead>
            <tbody>
              {(tdr?.plots ?? []).length === 0 ? (
                <tr><td colSpan={6} className={`${td} text-center text-[#8c8c8c]`}>No plot details available.</td></tr>
              ) : (
                (tdr?.plots ?? []).map((p, idx) => (
                  <tr key={`${p.plot_id ?? 'plot'}-${idx}`}>
                    <td className={td}>{p.plot_id ?? '-'}</td>
                    <td className={td}>{p.plot_no ?? '-'}</td>
                    <td className={`${td} text-right`}>{n(p.registry_area)}</td>
                    <td className={`${td} text-right`}>{n(p.proposed_area)}</td>
                    <td className={td}><span className="rounded bg-[#f6ffed] px-2 py-0.5 text-[11px] font-semibold text-[#237804]">{p.ownership ?? '-'}</span></td>
                    <td className={td}>{p.latitude && p.longitude ? `${p.latitude}, ${p.longitude}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

export function DocumentsSection({
  tdr,
  docDrc,
  docDrcUrl,
  docDrcHash,
  docForm4,
  docForm4Url,
  docForm4Hash,
  lastHistory,
}: {
  tdr: FullResponse['tdr']
  docDrc?: string | { file_url?: string; hash?: string; uploaded_at?: string }
  docDrcUrl?: string
  docDrcHash?: string
  docForm4?: string | { file_url?: string; hash?: string; uploaded_at?: string }
  docForm4Url?: string
  docForm4Hash?: string
  lastHistory?: HistoryItem
}) {
  return (
    <section className={card}>
      <div className="border-b border-[#edf0f5] px-4 py-2.5 text-sm font-semibold text-[#1f2d3d]">Documents</div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#edf0f5] p-3">
          <p className="font-semibold text-[#1f2d3d]">Form 1</p>
          <p className="mt-1 truncate text-[11px] text-[#8c8c8c]">{tdr?.documents?.form1 ?? '-'}</p>
          <a href={tdr?.documents?.form1} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-md border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-1 text-[11px] font-semibold text-[#1d39c4]">View Document</a>
        </div>
        <div className="rounded-xl border border-[#edf0f5] p-3">
          <p className="font-semibold text-[#1f2d3d]">DRC Certificate</p>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Updated on {d(typeof docDrc === 'object' ? docDrc?.uploaded_at : lastHistory?.value?.updatedAt)}</p>
          <p className="mt-2 truncate text-[11px] text-[#595959]">Hash: {docDrcHash ?? lastHistory?.value?.hash ?? '-'}</p>
          <a href={docDrcUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-md border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-1 text-[11px] font-semibold text-[#1d39c4]">View Document</a>
        </div>
        <div className="rounded-xl border border-[#edf0f5] p-3">
          <p className="font-semibold text-[#1f2d3d]">Form 4</p>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Updated on {d(typeof docForm4 === 'object' ? docForm4?.uploaded_at : lastHistory?.value?.updatedAt)}</p>
          <p className="mt-2 truncate text-[11px] text-[#595959]">Hash: {docForm4Hash ?? '-'}</p>
          <a href={docForm4Url} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-md border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-1 text-[11px] font-semibold text-[#1d39c4]">View Document</a>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 border-t border-[#edf0f5] px-4 py-2 text-[11px] text-[#8c8c8c] sm:grid-cols-3">
        <p>Created At: {d(tdr?.createdAt)}</p>
        <p>Last Updated: {d(tdr?.updatedAt)}</p>
        <p>Version: {tdr?.__v ?? 0}</p>
      </div>
    </section>
  )
}
