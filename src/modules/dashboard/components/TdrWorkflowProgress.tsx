import { Fragment, useMemo } from 'react'
import { FiAlertCircle, FiCheck, FiLayers } from 'react-icons/fi'
import type { ApplicationStatus } from '../data/tdrApplicationsData'
import {
  TDR_WORKFLOW_STAGES,
  getWorkflowProgressToDrc,
  getWorkflowStageById,
  getWorkflowStageIndex,
  phaseLabel,
  type TdrWorkflowPhase,
  type TdrWorkflowStageDef,
} from '../data/tdrWorkflowStages'

type Props = {
  currentStageId: string
  applicationStatus: ApplicationStatus
  /** Omit outer card + title block (e.g. inside `<details>` on application detail). */
  embedded?: boolean
}

const phaseOrder: TdrWorkflowPhase[] = [
  'intake',
  'district',
  'directorate',
  'commissioner',
  'publication',
  'agreement',
  'final',
  'certificate',
  'post_certificate',
]

export default function TdrWorkflowProgress({ currentStageId, applicationStatus, embedded = false }: Props) {
  const currentOrder = getWorkflowStageIndex(currentStageId)
  const currentDef = getWorkflowStageById(currentStageId)
  const { currentStepNumber, stepsTotal, percentTowardDrc } = getWorkflowProgressToDrc(currentStageId)

  const phaseGroups = useMemo(() => {
    const map = new Map<TdrWorkflowPhase, TdrWorkflowStageDef[]>()
    for (const s of TDR_WORKFLOW_STAGES) {
      const arr = map.get(s.phase) ?? []
      arr.push(s)
      map.set(s.phase, arr)
    }
    return map
  }, [])

  const phaseSummaries = useMemo(() => {
    return phaseOrder.map((phase) => {
      const stages = phaseGroups.get(phase) ?? []
      const done = stages.filter((s) => s.order < currentOrder).length
      const active = stages.some((s) => s.order === currentOrder)
      const allPast = stages.every((s) => s.order < currentOrder)
      const rejectedHere = applicationStatus === 'Rejected' && active
      return {
        phase,
        label: phaseLabel(phase),
        stages,
        done,
        total: stages.length,
        active,
        allPast,
        rejectedHere,
      }
    })
  }, [phaseGroups, currentOrder, applicationStatus])

  const headerBlock = (
    <div className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${embedded ? '' : 'border-b border-[#f0f0f0] pb-4'}`}>
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#e6f7ff] bg-white shadow-inner"
          style={{
            background: `conic-gradient(#52c41a ${percentTowardDrc}%, #f0f0f0 0)`,
          }}
          aria-hidden
        >
          <div className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-[10px] font-semibold uppercase leading-none text-[#8c8c8c]">Path</span>
            <span className="text-sm font-bold tabular-nums leading-tight text-[#1890ff]">{percentTowardDrc}%</span>
          </div>
        </div>
        <div className="min-w-0">
          {!embedded ? (
            <>
              <h2 className="text-base font-semibold text-[#262626]">TDR workflow — submit → DRC</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#8c8c8c]">
                TCP statutory gates in one glance: phase tiles below + full gate strip (scroll horizontally on small screens).
              </p>
            </>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8c8c8c]">Statutory gates</p>
          )}
          <p className={`${embedded ? 'mt-1' : 'mt-3'} text-xs font-medium uppercase tracking-wide text-[#8c8c8c]`}>Current gate</p>
          <p className="truncate text-sm font-semibold text-[#262626]">{currentDef?.label ?? currentStageId}</p>
          <p className="mt-0.5 text-xs text-[#595959]">
            <span className="font-medium text-[#262626]">{currentDef?.officerAtGate ?? '—'}</span>
            {currentDef?.statusTracking ? (
              <span className="ml-2 rounded bg-[#fff7e6] px-1.5 py-0.5 text-[10px] font-medium text-[#ad6800]">Status tracking</span>
            ) : null}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <div className="rounded-xl border border-[#d9d9d9] bg-[#fafafa] px-4 py-3 text-right shadow-sm">
          <p className="text-[11px] font-medium text-[#8c8c8c]">Toward DRC milestone</p>
          <p className="text-lg font-bold tabular-nums text-[#1890ff]">
            {currentStepNumber} / {stepsTotal}
          </p>
          <p className="text-[11px] text-[#8c8c8c]">steps along issuance path</p>
        </div>
        <div className="hidden h-12 w-px bg-[#f0f0f0] sm:block" aria-hidden />
        <div className="flex items-center gap-2 rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-xs text-[#595959]">
          <FiLayers className="h-4 w-4 shrink-0 text-[#1890ff]" aria-hidden />
          <span>
            <strong className="text-[#262626]">{TDR_WORKFLOW_STAGES.length}</strong> gates ·{' '}
            <strong className="text-[#262626]">{phaseOrder.length}</strong> phases
          </span>
        </div>
      </div>
    </div>
  )

  const thinBar = (
    <div className={`h-1.5 overflow-hidden rounded-full bg-[#f0f0f0] ${embedded ? 'mt-3' : 'mt-4'}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#1890ff] via-[#69c0ff] to-[#52c41a] transition-[width] duration-500 ease-out"
        style={{ width: `${percentTowardDrc}%` }}
      />
    </div>
  )

  const phaseTiles = (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 ${embedded ? 'mt-4' : 'mt-5'}`}>
      {phaseSummaries.map(({ phase, label, done, total, active, allPast, rejectedHere }) => {
        const complete = allPast && !active
        let tone = 'border-[#f0f0f0] bg-[#fafafa] text-[#595959]'
        if (rejectedHere) tone = 'border-[#ffccc7] bg-[#fff1f0] text-[#cf1322]'
        else if (active) tone = 'border-[#91d5ff] bg-[#e6f7ff] text-[#0050b3]'
        else if (complete) tone = 'border-[#b7eb8f] bg-[#f6ffed] text-[#389e0d]'
        else if (!active && !complete) tone = 'border-[#f0f0f0] bg-white text-[#bfbfbf]'
        return (
          <div
            key={phase}
            className={`rounded-lg border px-2 py-2.5 text-center transition-shadow ${tone} ${active ? 'ring-2 ring-[#1890ff]/25 shadow-sm' : 'shadow-sm'}`}
            title={`${label}: ${done}/${total} gates completed`}
          >
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide opacity-90">{label}</p>
            <p className="mt-1.5 text-xs font-bold tabular-nums">
              {done}/{total}
              {rejectedHere ? (
                <FiAlertCircle className="ml-1 inline-block h-3.5 w-3.5 align-text-bottom" aria-hidden />
              ) : complete ? (
                <FiCheck className="ml-1 inline-block h-3.5 w-3.5 align-text-bottom text-[#52c41a]" aria-hidden />
              ) : null}
            </p>
          </div>
        )
      })}
    </div>
  )

  const horizontalStepper = (
    <div className={`${embedded ? 'mt-5' : 'mt-6'}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8c8c8c]">Gate-by-gate track</p>
        <p className="text-[11px] text-[#bfbfbf]">Hover a step for full title &amp; officer</p>
      </div>
      <div className="-mx-1 overflow-x-auto rounded-xl border border-[#f0f0f0] bg-gradient-to-b from-[#fafafa] to-white px-3 py-4 shadow-inner">
        <div className="flex min-w-max items-center">
          {TDR_WORKFLOW_STAGES.map((stage, idx) => {
            const ord = stage.order
            const isPast = ord < currentOrder
            const isCurrent = ord === currentOrder
            const isFuture = ord > currentOrder
            const rejectedHere = applicationStatus === 'Rejected' && isCurrent

            const circle =
              rejectedHere
                ? 'border-[#ff4d4f] bg-[#fff1f0] text-[#cf1322]'
                : isPast
                  ? 'border-[#95de64] bg-[#f6ffed] text-[#389e0d]'
                  : isCurrent
                    ? 'border-[#1890ff] bg-[#e6f7ff] text-[#0050b3] ring-4 ring-[#bae7ff]/60'
                    : 'border-[#f0f0f0] bg-white text-[#bfbfbf]'

            const lineDone = isPast || (isCurrent && !rejectedHere)

            return (
              <Fragment key={stage.id}>
                {idx > 0 ? (
                  <div
                    className={`mx-0.5 h-1 w-4 shrink-0 rounded-full sm:w-6 ${lineDone ? 'bg-[#95de64]' : 'bg-[#f0f0f0]'}`}
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  title={`${stage.label}\nGate: ${stage.officerAtGate}${stage.statusTracking ? '\n(Status tracking)' : ''}`}
                  aria-label={`${stage.label}, gate ${stage.officerAtGate}`}
                  className="group flex w-[68px] shrink-0 flex-col items-center sm:w-[76px]"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold tabular-nums transition-transform group-hover:scale-105 sm:h-10 sm:w-10 sm:text-xs ${circle}`}
                  >
                    {rejectedHere ? (
                      <FiAlertCircle className="h-4 w-4" aria-hidden />
                    ) : isPast ? (
                      <FiCheck className="h-4 w-4" aria-hidden />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={`mt-2 line-clamp-2 text-center text-[10px] font-medium leading-snug sm:text-[11px] ${isFuture ? 'text-[#bfbfbf]' : 'text-[#595959]'}`}
                  >
                    {stage.shortLabel}
                  </span>
                </button>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )

  const inner = (
    <>
      {headerBlock}
      {thinBar}
      {phaseTiles}
      {horizontalStepper}
    </>
  )

  if (embedded) {
    return <div className="space-y-0">{inner}</div>
  }

  return <section className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm sm:p-5">{inner}</section>
}
