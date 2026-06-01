import { Link } from 'react-router-dom'
import { FiArrowRight, FiLayers, FiTrendingUp } from 'react-icons/fi'
import {
  aggregateHolderPortfolio,
  DEMO_SPOTLIGHT_SAMAGRA_ID,
  getCertificatesForSamagraId,
  getDrcUtilizationBreakdown,
  getLatestCertificateForSamagra,
} from '../data/certificateLedgerData'

/**
 * Shows the most recently issued DRC for the demo holder; “View all” opens the registry filtered to every DRC for that Samagra.
 */
export default function RecentHolderSpotlight() {
  const samagra = DEMO_SPOTLIGHT_SAMAGRA_ID
  const latest = getLatestCertificateForSamagra(samagra)
  const portfolio = aggregateHolderPortfolio(getCertificatesForSamagraId(samagra))
  if (!latest) return null
  const u = getDrcUtilizationBreakdown(latest)

  return (
    <section className="overflow-hidden rounded-xl border border-[#91d5ff] bg-gradient-to-br from-[#e6f7ff] via-white to-[#f6ffed] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1890ff]">Recent DRC (this holder)</p>
          <h2 className="mt-1 text-lg font-semibold text-[#262626]">
            {latest.name}
            <span className="ml-2 text-sm font-normal text-[#8c8c8c]">· Samagra {samagra}</span>
          </h2>
          <p className="mt-1 font-mono text-sm text-[#595959]">{latest.certificateNo}</p>
          <p className="mt-2 text-sm text-[#595959]">
            Latest by issue date <strong className="text-[#262626]">{latest.issueDate}</strong>
            {latest.applicationId ? (
              <>
                {' '}
                · Application{' '}
                <Link
                  to={`/dashboard/apply/${encodeURIComponent(latest.applicationId)}`}
                  className="font-mono font-medium text-[#1890ff] hover:underline"
                >
                  {latest.applicationId}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:shrink-0">
          <div className="rounded-lg border border-[#d9d9d9] bg-white/90 px-3 py-2 text-center shadow-sm">
            <p className="text-[10px] font-medium uppercase text-[#8c8c8c]">Issued</p>
            <p className="text-sm font-bold tabular-nums text-[#262626]">{u.issuedSqMt.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#bfbfbf]">sq.m</p>
          </div>
          <div className="rounded-lg border border-[#ffd591] bg-[#fff7e6] px-3 py-2 text-center shadow-sm">
            <p className="text-[10px] font-medium uppercase text-[#d46b08]">Utilized</p>
            <p className="text-sm font-bold tabular-nums text-[#d46b08]">{u.utilizedSqMt.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#fa8c16]">{u.pctUtilized}%</p>
          </div>
          <div className="rounded-lg border border-[#b7eb8f] bg-[#f6ffed] px-3 py-2 text-center shadow-sm">
            <p className="text-[10px] font-medium uppercase text-[#389e0d]">Remaining</p>
            <p className="text-sm font-bold tabular-nums text-[#389e0d]">{u.remainingSqMt.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#52c41a]">sq.m</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e6f7ff] pt-4 text-sm">
        <Link
          to={
            latest.applicationId
              ? `/dashboard/certificates/by-application/${encodeURIComponent(latest.applicationId)}`
              : `/dashboard/certificates/${latest.sno}`
          }
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#1890ff] bg-[#1890ff] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#40a9ff]"
        >
          Open this DRC ledger
          <FiArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          to={`/dashboard/certificates?holder=${encodeURIComponent(samagra)}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d9d9d9] bg-white px-4 py-2.5 font-medium text-[#262626] shadow-sm transition hover:border-[#1890ff] hover:text-[#1890ff]"
        >
          <FiLayers className="h-4 w-4 text-[#1890ff]" aria-hidden />
          All DRCs for this holder ({portfolio.rows.length})
        </Link>
        <div className="ml-auto flex items-center gap-1 text-xs text-[#8c8c8c]">
          <FiTrendingUp className="h-3.5 w-3.5" aria-hidden />
          <span>
            Portfolio total: {portfolio.totals.issuedSqMt.toLocaleString('en-IN')} issued ·{' '}
            {portfolio.totals.utilizedSqMt.toLocaleString('en-IN')} utilized ·{' '}
            {portfolio.totals.remainingSqMt.toLocaleString('en-IN')} remaining
          </span>
        </div>
      </div>
    </section>
  )
}
