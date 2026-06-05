import { useApi } from './useApi'

export function ExampleDedupeComponent() {
  const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

  const { data, isLoading, error, refetch } = useApi<unknown>({
    method: 'GET',
    url: '/api/tdr/history/applications',
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
    auto: true,
  })

  return (
    <div>
      <button onClick={() => void refetch()} disabled={isLoading}>
        Refetch
      </button>
      {isLoading ? <p>Loading…</p> : null}
      {error ? <pre>{String(error)}</pre> : null}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

