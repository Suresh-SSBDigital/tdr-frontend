import { apiAxios } from './axios'
import { makeRequestKey, startOrReplaceInFlight } from './requestDeduper'

export type ApiRequestOptions<D = unknown> = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  params?: Record<string, unknown>
  data?: D
  headers?: Record<string, string>
  dedupeKey?: string
  // When provided, this signal will cancel the request.
  signal?: AbortSignal
}

export async function apiRequest<T = unknown, D = unknown>(opts: ApiRequestOptions<D>): Promise<T> {
  const { method, url, params, data, headers } = opts

  // Request signature includes params/body + auth headers.
  const key = opts.dedupeKey ?? makeRequestKey({ method, url, params, data, headers })

  const merged = startOrReplaceInFlight<T>(key, async (dedupeSignal) => {
    const controller = new AbortController()

    const abortWithReason = (reason: unknown) => {
      // AbortController expects no payload, so we just abort.
      // Axios will surface this as a cancellation error.
      controller.abort(reason as any)
    }

    const onCallerAbort = () => {
      if (opts.signal?.aborted) abortWithReason(opts.signal.reason)
      else abortWithReason(new Error('Aborted'))
    }

    const onDedupeAbort = () => abortWithReason(dedupeSignal.reason)

    if (opts.signal) {
      if (opts.signal.aborted) {
        controller.abort(opts.signal.reason)
      } else {
        opts.signal.addEventListener('abort', onCallerAbort, { once: true })
      }
    }

    dedupeSignal.addEventListener('abort', onDedupeAbort, { once: true })

    if (controller.signal.aborted) {
      // Request was already aborted before axios started.
      throw controller.signal.reason ?? new Error('Aborted')
    }

    try {
      const res = await apiAxios.request<T>({
        method,
        url,
        params,
        data,
        headers,
        signal: controller.signal,
      })
      return res.data
    } finally {
      if (opts.signal) opts.signal.removeEventListener('abort', onCallerAbort)
      dedupeSignal.removeEventListener('abort', onDedupeAbort)
    }
  })

  return merged.promise
}



