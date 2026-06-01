/** Coerce API / Mongo values that may arrive as strings. */
export function pickAreaNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(/,/g, '').trim())
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return undefined
}

type LandLike = {
  total_area?: unknown
  proposed_area?: unknown
  original_total_area?: unknown
} | undefined

type AreaSource = {
  total_area?: unknown
  proposed_area?: unknown
  remaining_area?: unknown
  transferred_area?: unknown
  utilized_area?: unknown
  original_total_area?: unknown
  land?: LandLike
  plots?: Array<{ registry_area?: unknown; proposed_area?: unknown }>
}

function sumPlotAreas(plots: AreaSource['plots']): number {
  if (!Array.isArray(plots) || plots.length === 0) return 0
  let sum = 0
  for (const p of plots) {
    const part =
      pickAreaNumber(p.registry_area) ?? pickAreaNumber(p.proposed_area) ?? 0
    sum += part
  }
  return sum
}

/** Total / proposed / remaining (sq.m) — prefers API summary fields from GET /history/applications. */
export function resolveApplicationAreaFields(source: AreaSource) {
  const land = source.land

  const transferredArea = pickAreaNumber(source.transferred_area) ?? 0
  const utilizedArea = pickAreaNumber(source.utilized_area) ?? 0

  let totalArea =
    pickAreaNumber(
      source.total_area,
      source.original_total_area,
      land?.original_total_area,
      land?.total_area,
    ) ?? 0

  if (totalArea <= 0) {
    const fromPlots = sumPlotAreas(source.plots)
    if (fromPlots > 0) totalArea = fromPlots
  }

  const proposedArea = pickAreaNumber(source.proposed_area, land?.proposed_area) ?? 0
  const apiRemaining = pickAreaNumber(source.remaining_area)

  const remainingArea =
    apiRemaining !== undefined
      ? apiRemaining
      : totalArea > 0
        ? Math.max(0, totalArea - transferredArea - utilizedArea)
        : 0

  return {
    totalAreaSqM: totalArea,
    proposedAreaSqM: proposedArea,
    remainingAreaSqM: remainingArea,
    transferredAreaSqM: transferredArea,
    utilizedAreaSqM: utilizedArea,
  }
}

export function formatAreaSqM(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—'
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
