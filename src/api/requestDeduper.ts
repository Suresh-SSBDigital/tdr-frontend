/*
  Global in-flight request registry.

  Guarantees:
  - Same request key is never executed concurrently twice.
  - Starting a new request with same key cancels the previous one.

  Works with AbortController for fetch/XHR cancellation patterns.
*/

type InFlightEntry<T> = {
  promise: Promise<T>
  controller: AbortController
  // Used for debugging / optional introspection
  startedAt: number
}

const inflight = new Map<string, InFlightEntry<unknown>>()

function stableStringify(value: unknown): string {
  // Keep it deterministic for objects.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seen = new Set<any>()
  const stringify = (v: any): any => {
    if (v === null || typeof v !== 'object') return v
    if (seen.has(v)) return '[Circular]'
    seen.add(v)

    if (Array.isArray(v)) return v.map(stringify)
    const keys = Object.keys(v).sort()
    const out: Record<string, unknown> = {}
    for (const k of keys) out[k] = stringify(v[k])
    return out
  }

  try {
    return JSON.stringify(stringify(value))
  } catch {
    return String(value)
  }
}

export function makeRequestKey(opts: {
  method: string
  url: string
  params?: unknown
  data?: unknown
  headers?: Record<string, string>
}): string {
  const { method, url, params, data, headers } = opts
  const headerSubset: Record<string, string> = {}

  // Only include headers that affect auth / response.
  // Add more if your API depends on other headers.
  if (headers) {
    for (const k of Object.keys(headers)) {
      const uk = k.toLowerCase()
      if (uk === 'x-api-key' || uk === 'authorization') headerSubset[k] = headers[k]
    }
  }

  return [
    method.toUpperCase(),
    url,
    stableStringify(params ?? null),
    stableStringify(data ?? null),
    stableStringify(headerSubset),
  ].join('|')
}

export function startOrReplaceInFlight<T>(key: string, factory: (signal: AbortSignal) => Promise<T>): { promise: Promise<T> } {
  const existing = inflight.get(key)
  if (existing) {
    // Cancel the previous request when a new one starts.
    existing.controller.abort(new Error('Replaced by a newer request'))
    inflight.delete(key)
  }

  const controller = new AbortController()

  const promise = (async () => {
    try {
      return await factory(controller.signal)
    } finally {
      // Cleanup only if this entry is still the latest.
      const cur = inflight.get(key)
      if (cur && cur.controller === controller) inflight.delete(key)
    }
  })()

  inflight.set(key, { promise: promise as Promise<unknown>, controller, startedAt: Date.now() })

  return { promise }
}

export function getInFlightCount(): number {
  return inflight.size
}

