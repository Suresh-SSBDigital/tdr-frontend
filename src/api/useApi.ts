import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, type ApiRequestOptions } from './api'

type UseApiState<T> = {
  data: T | null
  error: unknown
  isLoading: boolean
  status: 'idle' | 'loading' | 'success' | 'error'
}

export function useApi<T = unknown, D = unknown>(
  options: Omit<ApiRequestOptions<D>, 'signal'> & {
    auto?: boolean
    initialData?: T | null
  },
) {
  const { auto = true, initialData = null, ...req } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    error: null,
    isLoading: false,
    status: 'idle',
  })

  const mountedRef = useRef(true)
  const runIdRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const run = useCallback(async () => {
    const runId = ++runIdRef.current
    const controller = new AbortController()

    setState((s) => ({
      ...s,
      error: null,
      isLoading: true,
      status: 'loading',
    }))

    try {
      const data = await apiRequest<T, D>({
        ...(req as ApiRequestOptions<D>),
        signal: controller.signal,
      })

      if (!mountedRef.current) return
      if (runId !== runIdRef.current) return // race handling

      setState({ data, error: null, isLoading: false, status: 'success' })
      return data
    } catch (err) {
      if (!mountedRef.current) return
      if (runId !== runIdRef.current) return // stale response

      // Ignore abort errors silently
      const isAbort =
        typeof err === 'object' &&
        err !== null &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).name === 'AbortError'

      if (isAbort) {
        // Keep loading false; do not surface error on cancellation.
        setState((s) => ({ ...s, isLoading: false, status: 'idle' }))
        return
      }

      setState({ data: null, error: err, isLoading: false, status: 'error' })
      return undefined
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(req)])

  const stableOptions = useMemo(() => req, [JSON.stringify(req)])

  useEffect(() => {
    if (!auto) return
    void run()
    // Cancel is handled by dedupe; here we only prevent state writes.
  }, [run, auto, stableOptions])

  return {
    ...state,
    refetch: run,
  }
}

